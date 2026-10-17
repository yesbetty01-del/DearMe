import { ConvexHttpClient } from 'convex/browser';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { api } from '../../convex/_generated/api';
import { getItems, setItems } from './storage';
import { getConvexAuthToken } from './convexAuth';

const OWNER_KEY = 'attachmentOwnerKey';
const clientUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
let convexClient;
let cachedOwnerKey;
let ownerKeyPromise;

const getConvexClient = () => {
    if (!clientUrl) {
        throw new Error('Convex is not configured. Set EXPO_PUBLIC_CONVEX_URL and restart the app.');
    }
    if (!convexClient) convexClient = new ConvexHttpClient(clientUrl);
    return convexClient;
};

const authenticateConvex = async () => {
    const token = await getConvexAuthToken();
    if (!token) throw new Error('Sign in to sync attachments.');
    getConvexClient().setAuth(token);
};

const createOwnerKey = () => {
    const bytes = new Uint8Array(24);
    if (globalThis.crypto?.getRandomValues) {
        globalThis.crypto.getRandomValues(bytes);
    } else {
        for (let index = 0; index < bytes.length; index += 1) {
            bytes[index] = Math.floor(Math.random() * 256);
        }
    }
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const getAttachmentOwnerKey = () => {
    if (cachedOwnerKey) return Promise.resolve(cachedOwnerKey);
    if (!ownerKeyPromise) {
        ownerKeyPromise = (async () => {
            const savedOwnerKey = await getItems(OWNER_KEY);
            if (savedOwnerKey) {
                cachedOwnerKey = savedOwnerKey;
                return savedOwnerKey;
            }

            const ownerKey = createOwnerKey();
            const saved = await setItems(OWNER_KEY, ownerKey);
            if (!saved) throw new Error('Could not initialize local attachment storage.');
            cachedOwnerKey = ownerKey;
            return ownerKey;
        })().catch((error) => {
            ownerKeyPromise = null;
            throw error;
        });
    }
    return ownerKeyPromise;
};

const getContentType = (attachment) => {
    if (attachment.mimeType) return attachment.mimeType;
    const extension = (attachment.name || attachment.uri || '').split('.').pop().toLowerCase();
    if (attachment.type === 'image') {
        return ({ png: 'image/png', gif: 'image/gif', webp: 'image/webp', heic: 'image/heic' })[extension] || 'image/jpeg';
    }
    return ({ mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac', m4a: 'audio/mp4' })[extension] || 'audio/mp4';
};

const uploadWebFile = async (uploadUrl, attachment, contentType) => {
    const fileResponse = await fetch(attachment.uri);
    if (!fileResponse.ok) throw new Error('Could not read the local attachment.');
    const file = await fileResponse.blob();
    const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type || contentType },
        body: file,
    });
    if (!response.ok) throw new Error('Could not upload the attachment.');
    return response.json();
};

const uploadNativeFile = async (uploadUrl, attachment, contentType) => {
    const response = await FileSystem.uploadAsync(uploadUrl, attachment.uri, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: { 'Content-Type': contentType },
    });
    if (response.status < 200 || response.status >= 300) {
        throw new Error('Could not upload the attachment.');
    }
    return JSON.parse(response.body);
};

const uploadAttachment = async (ownerKey, attachment) => {
    if (!attachment.uri) throw new Error(`The local ${attachment.type} file is unavailable.`);
    await authenticateConvex();
    const convex = getConvexClient();
    const uploadUrl = await convex.mutation(api.attachments.generateUploadUrl, { ownerKey });
    const contentType = getContentType(attachment);
    const result = Platform.OS === 'web'
        ? await uploadWebFile(uploadUrl, attachment, contentType)
        : await uploadNativeFile(uploadUrl, attachment, contentType);
    if (!result?.storageId) throw new Error('Convex did not return a storage ID.');
    return result.storageId;
};

export const prepareContentBlocksForSave = async ({ blocks }) => {
    const contentBlocks = blocks.map((block, position) => ({ ...block, position }));
    return {
        contentBlocks,
        attachments: contentBlocks.filter((block) => block.type !== 'text'),
        localUris: [],
    };
};

export const prepareContentBlocksForSync = async ({
    ownerKey,
    recordType,
    recordKey,
    blocks,
    onAttachmentUploaded,
}) => {
    await authenticateConvex();
    const convex = getConvexClient();
    const contentBlocks = [];
    const localUris = new Set();

    for (let position = 0; position < blocks.length; position += 1) {
        const block = blocks[position];
        if (block.type === 'text') {
            contentBlocks.push({ ...block, position });
            continue;
        }

        if (block.type !== 'image' && block.type !== 'audio') {
            throw new Error('This attachment type is not supported.');
        }

        let storageId = block.storageId;
        if (!storageId) {
            storageId = await uploadAttachment(ownerKey, block);
            onAttachmentUploaded?.(block.id, storageId);
        }

        const metadata = {
            ownerKey,
            recordType,
            recordKey,
            blockId: block.id,
            storageId,
            type: block.type,
            position,
            ...(block.name !== undefined ? { name: block.name } : {}),
            ...(block.type === 'audio' && block.reviewed !== undefined
                ? { reviewed: block.reviewed }
                : {}),
        };
        await convex.mutation(api.attachments.saveMetadata, metadata);

        contentBlocks.push({
            id: block.id,
            type: block.type,
            position,
            storageId,
            name: block.name,
            ...(block.type === 'audio' ? { reviewed: Boolean(block.reviewed) } : {}),
        });

        if (block.uri && !block.uri.startsWith('data:')) localUris.add(block.uri);
    }

    return {
        contentBlocks,
        attachments: contentBlocks.filter((block) => block.type !== 'text'),
        localUris: [...localUris],
    };
};

export const deleteLocalAttachmentCopies = async (uris = []) => {
    const documentDirectory = FileSystem.documentDirectory;
    if (!documentDirectory) return;

    await Promise.all(uris.map(async (uri) => {
        if (!uri.startsWith(documentDirectory)) return;
        try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
        } catch (error) {
            // A retained local copy is safe; cleanup can be retried separately.
        }
    }));
};

export const getStoredAttachmentUrl = async (storageId) => {
    if (!storageId) return null;
    await authenticateConvex();
    const ownerKey = await getAttachmentOwnerKey();
    return getConvexClient().query(api.attachments.getFileUrl, { ownerKey, storageId });
};

export const cacheStoredAttachment = async (storageId, type = 'image') => {
    if (!storageId || !FileSystem.documentDirectory) return null;
    const extension = type === 'audio' ? 'm4a' : 'jpg';
    const directory = `${FileSystem.documentDirectory}attachments/`;
    const localUri = `${directory}synced-${encodeURIComponent(storageId)}.${extension}`;
    const existing = await FileSystem.getInfoAsync(localUri);
    if (existing.exists) return localUri;

    const remoteUrl = await getStoredAttachmentUrl(storageId);
    if (!remoteUrl) return null;
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    const download = await FileSystem.downloadAsync(remoteUrl, localUri);
    return download.status >= 200 && download.status < 300 ? download.uri : null;
};
