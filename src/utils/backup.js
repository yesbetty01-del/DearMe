import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { hydrateJournalStore } from '../store/journalStore';
import { hydrateLetterStore } from '../store/letterStore';
import { getItems, replaceLocalData } from './storage';

const BACKUP_VERSION = 1;
const BACKUP_FILE_TYPE = 'dearme-backup';
const ATTACHMENT_URI_PREFIX = 'dearme-backup://attachments/';
const DATA_KEYS = ['journals', 'deletedJournals', 'letters', 'deletedLetters', 'deletedReflections', 'deletedReplies'];
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const bytesToBase64 = (bytes) => {
    let output = '';
    for (let index = 0; index < bytes.length; index += 3) {
        const first = bytes[index];
        const second = bytes[index + 1];
        const third = bytes[index + 2];
        output += BASE64_ALPHABET[first >> 2];
        output += BASE64_ALPHABET[((first & 3) << 4) | (second === undefined ? 0 : second >> 4)];
        output += second === undefined
            ? '=='
            : BASE64_ALPHABET[((second & 15) << 2) | (third === undefined ? 0 : third >> 6)];
        output += third === undefined ? '=' : BASE64_ALPHABET[third & 63];
    }
    return output;
};

const base64ToBytes = (value) => {
    const base64 = value.replace(/\s/g, '');
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)) {
        throw new Error('The backup contains an invalid attachment.');
    }

    const bytes = [];
    for (let index = 0; index < base64.length; index += 4) {
        const first = BASE64_ALPHABET.indexOf(base64[index]);
        const second = BASE64_ALPHABET.indexOf(base64[index + 1]);
        const third = base64[index + 2] === '=' ? 0 : BASE64_ALPHABET.indexOf(base64[index + 2]);
        const fourth = base64[index + 3] === '=' ? 0 : BASE64_ALPHABET.indexOf(base64[index + 3]);
        bytes.push((first << 2) | (second >> 4));
        if (base64[index + 2] !== '=') bytes.push(((second & 15) << 4) | (third >> 2));
        if (base64[index + 3] !== '=') bytes.push(((third & 3) << 6) | fourth);
    }
    return new Uint8Array(bytes);
};

const parseStoredArray = (key, value) => {
    if (value === null) return [];
    let parsed;
    try {
        parsed = JSON.parse(value);
    } catch {
        throw new Error(`Could not read saved ${key} data for the backup.`);
    }
    if (!Array.isArray(parsed)) throw new Error(`Saved ${key} data is invalid.`);
    return parsed;
};

const readBackupBytes = async (file) => {
    if (file && typeof file.arrayBuffer === 'function') {
        return new Uint8Array(await file.arrayBuffer());
    }
    if (typeof file !== 'string' || Platform.OS === 'web') {
        throw new Error('Choose a valid DearMe backup file.');
    }
    const encoded = await FileSystem.readAsStringAsync(file, {
        encoding: FileSystem.EncodingType.Base64,
    });
    return base64ToBytes(encoded);
};

const getExtension = (uri) => {
    const match = /\.([a-zA-Z0-9]{1,8})(?:[?#].*)?$/.exec(uri);
    return match ? match[1].toLowerCase() : 'bin';
};

const rewriteUris = (value, replaceUri) => {
    if (Array.isArray(value)) return value.map((item) => rewriteUris(item, replaceUri));
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
        key,
        key === 'uri' && typeof item === 'string' ? replaceUri(item) : rewriteUris(item, replaceUri),
    ]));
};

const readStoredData = async () => {
    const values = await Promise.all(DATA_KEYS.map((key) => getItems(key)));
    return Object.fromEntries(DATA_KEYS.map((key, index) => [
        key,
        parseStoredArray(key, values[index]),
    ]));
};

const summarize = ({ journals, letters }) => ({
    journals: journals.length,
    reflections: journals.reduce((total, journal) => total + (journal.reflections?.length || 0), 0),
    letters: letters.length,
    replies: letters.reduce((total, letter) => total + (letter.replies?.length || 0), 0),
});

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const validateRecords = (records, label, childKey, childLabel) => {
    records.forEach((record, index) => {
        if (!isRecord(record) || (typeof record.id !== 'string' && typeof record.id !== 'number')) {
            throw new Error(`The backup contains an invalid ${label} at position ${index + 1}.`);
        }
        if (record[childKey] !== undefined && !Array.isArray(record[childKey])) {
            throw new Error(`The backup contains invalid ${label} ${childKey}.`);
        }
        (record[childKey] || []).forEach((child, childIndex) => {
            if (!isRecord(child) || (typeof child.id !== 'string' && typeof child.id !== 'number')) {
                throw new Error(`The backup contains an invalid ${childLabel} at position ${childIndex + 1}.`);
            }
        });
    });
};

const validateBackupData = (data) => {
    const requiredKeys = ['journals', 'deletedJournals', 'letters', 'deletedLetters'];
    if (!data || requiredKeys.some((key) => !Array.isArray(data[key]))) {
        throw new Error('The backup does not contain valid DearMe writing.');
    }
    for (const key of ['deletedReflections', 'deletedReplies']) {
        if (data[key] === undefined) data[key] = [];
        if (!Array.isArray(data[key])) throw new Error(`The backup contains invalid ${key} data.`);
    }
    validateRecords(data.journals, 'journal', 'reflections', 'reflection');
    validateRecords(data.letters, 'letter', 'replies', 'reply');
    for (const key of ['deletedJournals', 'deletedLetters', 'deletedReflections', 'deletedReplies']) {
        if (!data[key].every((id) => typeof id === 'string' || typeof id === 'number')) {
            throw new Error(`The backup contains invalid ${key} data.`);
        }
    }
};

const parseArchive = async (file) => {
    let archive;
    try {
        archive = unzipSync(await readBackupBytes(file));
    } catch (error) {
        throw new Error(`Could not read the backup archive. ${error?.message || 'Choose a valid DearMe backup file.'}`);
    }

    let manifest;
    try {
        if (!archive['manifest.json']) throw new Error('The backup manifest is missing.');
        manifest = JSON.parse(strFromU8(archive['manifest.json']));
    } catch (error) {
        throw new Error(`The backup file is invalid. ${error?.message || ''}`.trim());
    }

    if (manifest?.format !== BACKUP_FILE_TYPE || manifest.version !== BACKUP_VERSION) {
        throw new Error('This backup file is not supported by this version of DearMe.');
    }
    validateBackupData(manifest.data);
    if (!Array.isArray(manifest.attachments)) {
        throw new Error('The backup attachment list is invalid.');
    }

    const validAttachmentPaths = new Set(
        manifest.attachments.filter((path) => typeof path === 'string' && /^attachments\/[a-zA-Z0-9._-]+$/.test(path)),
    );
    if (validAttachmentPaths.size !== manifest.attachments.length) {
        throw new Error('The backup contains an invalid attachment path.');
    }
    for (const path of validAttachmentPaths) {
        if (!archive[path]) throw new Error('The backup is missing an attachment.');
    }
    if (Object.keys(archive).some((path) => path !== 'manifest.json' && !validAttachmentPaths.has(path))) {
        throw new Error('The backup contains unexpected files.');
    }

    return { archive, manifest, summary: summarize(manifest.data) };
};

export const createBackupFile = async () => {
    const data = await readStoredData();
    const attachmentDirectory = FileSystem.documentDirectory
        ? `${FileSystem.documentDirectory}attachments/`
        : '';
    const attachmentPaths = new Map();
    const archive = {};
    const rewrittenData = {};

    for (const key of DATA_KEYS) {
        rewrittenData[key] = rewriteUris(data[key], (uri) => {
            if (!attachmentDirectory || !uri.startsWith(attachmentDirectory)) return uri;
            if (attachmentPaths.has(uri)) return `${ATTACHMENT_URI_PREFIX}${attachmentPaths.get(uri)}`;

            const path = `attachments/${attachmentPaths.size}-${getExtension(uri)}`;
            attachmentPaths.set(uri, path);
            return `${ATTACHMENT_URI_PREFIX}${path}`;
        });
    }

    for (const [uri, path] of attachmentPaths) {
        archive[path] = strToU8(await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        }));
    }

    const manifest = {
        format: BACKUP_FILE_TYPE,
        version: BACKUP_VERSION,
        createdAt: new Date().toISOString(),
        data: rewrittenData,
        attachments: [...attachmentPaths.values()],
    };
    archive['manifest.json'] = strToU8(JSON.stringify(manifest));
    const bytes = zipSync(archive, { level: 6 });
    const filename = `DearMe-backup-${Date.now()}.dearme`;

    if (Platform.OS === 'web') {
        return { uri: filename, bytes: async () => bytes };
    }
    if (!FileSystem.cacheDirectory) throw new Error('A temporary folder is not available for the backup.');

    const uri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(uri, bytesToBase64(bytes), {
        encoding: FileSystem.EncodingType.Base64,
    });
    return { uri, bytes: async () => bytes };
};

export const inspectBackupFile = async (file) => {
    const { summary } = await parseArchive(file);
    return { summary };
};

const getAttachmentMimeType = (path) => {
    const extension = getExtension(path);
    const mimeTypes = {
        aac: 'audio/aac',
        caf: 'audio/x-caf',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        m4a: 'audio/mp4',
        mp3: 'audio/mpeg',
        mp4: 'video/mp4',
        png: 'image/png',
        wav: 'audio/wav',
        webm: 'audio/webm',
        webp: 'image/webp',
    };
    return mimeTypes[extension] || 'application/octet-stream';
};

export const restoreBackupFile = async (file) => {
    const { archive, manifest, summary } = await parseArchive(file);
    const attachmentUris = new Map();
    const writtenFiles = [];

    try {
        if (manifest.attachments.length && Platform.OS !== 'web') {
            if (!FileSystem.documentDirectory) throw new Error('A storage folder is not available for the attachments.');
            const directory = `${FileSystem.documentDirectory}attachments/`;
            const directoryInfo = await FileSystem.getInfoAsync(directory);
            if (!directoryInfo.exists) await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

            for (const [index, path] of manifest.attachments.entries()) {
                const uri = `${directory}restored-${Date.now()}-${index}.${getExtension(path)}`;
                await FileSystem.writeAsStringAsync(uri, strFromU8(archive[path]), {
                    encoding: FileSystem.EncodingType.Base64,
                });
                writtenFiles.push(uri);
                attachmentUris.set(`${ATTACHMENT_URI_PREFIX}${path}`, uri);
            }
        } else {
            for (const path of manifest.attachments) {
                const base64 = strFromU8(archive[path]);
                const dataUri = `data:${getAttachmentMimeType(path)};base64,${base64}`;
                attachmentUris.set(`${ATTACHMENT_URI_PREFIX}${path}`, dataUri);
            }
        }

        const restoredData = Object.fromEntries(DATA_KEYS.map((key) => [
            key,
            rewriteUris(manifest.data[key], (uri) => {
                if (!uri.startsWith(ATTACHMENT_URI_PREFIX)) return uri;
                const restoredUri = attachmentUris.get(uri);
                if (!restoredUri) throw new Error('The backup references a missing attachment.');
                return restoredUri;
            }),
        ]));

        await replaceLocalData(DATA_KEYS.map((key) => [key, JSON.stringify(restoredData[key])]));
    } catch (error) {
        await Promise.all(writtenFiles.map((uri) => FileSystem.deleteAsync(uri, { idempotent: true }).catch((cleanupError) => {
            console.error('Could not remove an incomplete restored attachment:', cleanupError);
        })));
        throw error;
    }

    try {
        await Promise.all([
            hydrateJournalStore(),
            hydrateLetterStore(),
        ]);
    } catch (error) {
        throw new Error(`Writing was restored, but the app could not refresh its data. Restart DearMe to load it. ${error?.message || ''}`.trim());
    }

    return summary;
};
