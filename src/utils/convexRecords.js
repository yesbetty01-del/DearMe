import { ConvexHttpClient } from 'convex/browser';
import { api } from './convexApi';
import { cacheStoredAttachment, getAttachmentOwnerKey, prepareContentBlocksForSync } from './attachmentStorage';
import { getConvexAuthToken } from './convexAuth';
import { getItems, setItems, setManyItems } from './storage';
import { replaceJournalSnapshot, setDeletedJournalSnapshot } from '../store/journalStore';
import { replaceLetterSnapshot, setDeletedLetterSnapshot } from '../store/letterStore';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
let convexClient;

const getClient = () => {
    if (!convexUrl) throw new Error('Convex is not configured. Set EXPO_PUBLIC_CONVEX_URL.');
    if (!convexClient) convexClient = new ConvexHttpClient(convexUrl);
    return convexClient;
};

const withOwnerKey = async (args = {}) => ({
    ...args,
    ownerKey: await getAttachmentOwnerKey(),
});

const authenticateClient = async () => {
    const token = await getConvexAuthToken();
    if (!token) throw new Error('Sign in to sync your DearMe data.');
    getClient().setAuth(token);
};

const callMutation = async (reference, args) => {
    await authenticateClient();
    return getClient().mutation(reference, await withOwnerKey(args));
};

const getAllPages = async (reference, args = {}) => {
    await authenticateClient();
    const ownerKey = await getAttachmentOwnerKey();
    const items = [];
    let cursor = null;
    do {
        const result = await getClient().query(reference, {
            ...args,
            ownerKey,
            paginationOpts: { numItems: 100, cursor },
        });
        items.push(...result.page);
        cursor = result.isDone ? null : result.continueCursor;
        if (items.length >= 5000) break;
    } while (cursor);
    return items;
};

const asLocalRecord = (record) => ({
    ...record,
    id: record.localKey || record._id,
    localKey: record.localKey || record._id,
    convexId: record._id,
});

const getLetterWrittenTimestamp = (letter) => {
    if (typeof letter.writtenDate === 'number' && Number.isFinite(letter.writtenDate)) {
        return letter.writtenDate;
    }
    if (typeof letter.writtenDate === 'string' && /^(\d{4}-\d{2}-\d{2}(?:T.*)?|[A-Za-z]{3,}\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4})$/.test(letter.writtenDate)) {
        const timestamp = Date.parse(letter.writtenDate);
        if (Number.isFinite(timestamp)) return timestamp;
    }
    return typeof letter.createdAt === 'number' ? letter.createdAt : 0;
};

export const saveJournalRecord = async (record) => {
    const localKey = record.localKey || record.id;
    const date = record.date instanceof Date ? record.date.getTime() : new Date(record.date).getTime();
    return callMutation(api.client.saveJournalEntry, {
        localKey,
        title: record.title || '',
        date: Number.isFinite(date) ? date : Date.now(),
        ...(record.mood ? { mood: record.mood } : {}),
        ...(record.moodName ? { moodName: record.moodName } : {}),
        ...(record.moodColor ? { moodColor: record.moodColor } : {}),
        content: record.content || '',
        contentBlocks: record.contentBlocks || [],
    });
};

export const saveReflectionRecord = async (entry, reflection) => callMutation(api.client.saveReflection, {
    parentLocalKey: entry.localKey || entry.id,
    localKey: reflection.localKey || reflection.id,
    content: reflection.content || '',
    contentBlocks: reflection.contentBlocks || [],
});

export const saveLetterRecord = async (letter) => {
    const writtenDate = letter.writtenDate instanceof Date
        ? letter.writtenDate.getTime()
        : new Date(letter.writtenDate).getTime();
    return callMutation(api.client.saveLetter, {
        localKey: letter.localKey || letter.id,
        title: letter.title || 'To my future self',
        content: letter.content || '',
        contentBlocks: letter.contentBlocks || [],
        ...(letter.mood ? { mood: letter.mood } : {}),
        ...(letter.moodName ? { moodName: letter.moodName } : {}),
        ...(letter.moodColor ? { moodColor: letter.moodColor } : {}),
        writtenDate: Number.isFinite(writtenDate) ? writtenDate : Date.now(),
        deliveryDate: letter.deliveryDate,
        ...(letter.deliveryTime ? { deliveryTime: letter.deliveryTime } : {}),
        deliveryTimezone: letter.deliveryTimezone || 'UTC',
    });
};

export const saveReplyRecord = async (letter, reply) => callMutation(api.client.saveReply, {
    parentLocalKey: letter.localKey || letter.id,
    localKey: reply.localKey || reply.id,
    content: reply.content || '',
    contentBlocks: reply.contentBlocks || [],
});

export const deleteJournalRecord = (localKey) => callMutation(api.client.deleteJournalEntry, { localKey });
export const deleteReflectionRecord = (entry, reflection) => callMutation(api.client.deleteReflection, {
    parentLocalKey: entry.localKey || entry.id,
    localKey: reflection.localKey || reflection.id,
});
export const deleteLetterRecord = (localKey) => callMutation(api.client.deleteLetter, { localKey });
export const deleteReplyRecord = (letter, reply) => callMutation(api.client.deleteReply, {
    parentLocalKey: letter.localKey || letter.id,
    localKey: reply.localKey || reply.id,
});

export const loadJournalRecords = async () => {
    const entries = await getAllPages(api.client.listJournalEntries);
    return Promise.all(entries.map(async (entry) => {
        const reflections = await getAllPages(api.client.listReflections, {
            parentLocalKey: entry.localKey || entry._id,
        });
        return {
            ...asLocalRecord(entry),
            date: entry.date,
            reflections: reflections.map(asLocalRecord),
        };
    }));
};

export const loadLetterRecords = async () => {
    const letters = await getAllPages(api.client.listLetters);
    return Promise.all(letters.map(async (letter) => {
        const replies = await getAllPages(api.client.listReplies, {
            parentLocalKey: letter.localKey || letter._id,
        });
        return {
            ...asLocalRecord(letter),
            writtenDate: getLetterWrittenTimestamp(letter),
            serverAvailable: Boolean(letter.title || letter.content || letter.contentBlocks?.length),
            replies: replies.map(asLocalRecord),
        };
    }));
};

const parseRecords = async (key) => {
    const value = await getItems(key);
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn(`Could not parse local ${key} before sync:`, error);
        return [];
    }
};

const accountSnapshotKey = (userId) => `sync:localSnapshot:${userId}`;
const activeAccountKey = 'sync:activeAccountId';

const switchLocalAccount = async (userId) => {
    const currentUserId = await getItems(activeAccountKey);
    if (currentUserId === userId) return;

    const localJournals = await parseRecords('journals');
    const localLetters = await parseRecords('letters');
    const deletedJournals = await parseRecords('deletedJournals');
    const deletedLetters = await parseRecords('deletedLetters');
    const deletedReflections = await parseRecords('deletedReflections');
    const deletedReplies = await parseRecords('deletedReplies');

    if (currentUserId) {
        const saved = await setItems(accountSnapshotKey(currentUserId), JSON.stringify({
            journals: localJournals,
            letters: localLetters,
            deletedJournals,
            deletedLetters,
            deletedReflections,
            deletedReplies,
        }));
        if (!saved) throw new Error('Could not safely switch local data to this account.');
    }

    const snapshotValue = currentUserId ? await getItems(accountSnapshotKey(userId)) : null;
    let snapshot = {};
    if (snapshotValue) {
        try { snapshot = JSON.parse(snapshotValue); } catch (error) { console.warn('Could not parse this account’s local data snapshot:', error); }
    }
    await setManyItems([
        ['journals', JSON.stringify(snapshot.journals || (currentUserId ? [] : localJournals))],
        ['letters', JSON.stringify(snapshot.letters || (currentUserId ? [] : localLetters))],
        ['deletedJournals', JSON.stringify(snapshot.deletedJournals || (currentUserId ? [] : deletedJournals))],
        ['deletedLetters', JSON.stringify(snapshot.deletedLetters || (currentUserId ? [] : deletedLetters))],
        ['deletedReflections', JSON.stringify(snapshot.deletedReflections || (currentUserId ? [] : deletedReflections))],
        ['deletedReplies', JSON.stringify(snapshot.deletedReplies || (currentUserId ? [] : deletedReplies))],
        [activeAccountKey, userId],
    ]);
    replaceJournalSnapshot(snapshot.journals || (currentUserId ? [] : localJournals));
    replaceLetterSnapshot(snapshot.letters || (currentUserId ? [] : localLetters));
    setDeletedJournalSnapshot(snapshot.deletedJournals || (currentUserId ? [] : deletedJournals));
    setDeletedLetterSnapshot(snapshot.deletedLetters || (currentUserId ? [] : deletedLetters));
};

const getContentBlocksForSync = async (record, recordType, recordKey) => {
    const contentBlocks = record.contentBlocks || [];
    if (!contentBlocks.some((block) => block.type === 'image' || block.type === 'audio')) return contentBlocks;
    const ownerKey = await getAttachmentOwnerKey();
    return (await prepareContentBlocksForSync({ ownerKey, recordType, recordKey, blocks: contentBlocks })).contentBlocks;
};

const syncJournalEntry = async (journal, remote) => {
    if (!remote || (journal.updatedAt || 0) > (remote.updatedAt || 0)) {
        const entryBlocks = await getContentBlocksForSync(journal, 'journalEntry', journal.localKey || journal.id);
        await saveJournalRecord({ ...journal, contentBlocks: entryBlocks });
    }
    for (const reflection of journal.reflections || []) {
        const remoteReflection = (remote?.reflections || []).find((item) => (item.localKey || item.id) === (reflection.localKey || reflection.id));
        if (!remoteReflection || (reflection.updatedAt || 0) > (remoteReflection.updatedAt || 0)) {
            const blocks = await getContentBlocksForSync(reflection, 'reflection', reflection.localKey || reflection.id);
            await saveReflectionRecord(journal, { ...reflection, contentBlocks: blocks });
        }
    }
};

const syncLetter = async (letter, remote) => {
    if (!remote || (letter.updatedAt || 0) > (remote.updatedAt || 0)) {
        const letterBlocks = await getContentBlocksForSync(letter, 'letter', letter.localKey || letter.id);
        await saveLetterRecord({ ...letter, contentBlocks: letterBlocks });
    }
    for (const reply of letter.replies || []) {
        const remoteReply = (remote?.replies || []).find((item) => (item.localKey || item.id) === (reply.localKey || reply.id));
        if (!remoteReply || (reply.updatedAt || 0) > (remoteReply.updatedAt || 0)) {
            const blocks = await getContentBlocksForSync(reply, 'reply', reply.localKey || reply.id);
            await saveReplyRecord(letter, { ...reply, contentBlocks: blocks });
        }
    }
};

const mergeContentBlocks = async (preferredBlocks = [], otherBlocks = []) => Promise.all(preferredBlocks.map(async (block) => {
    const other = otherBlocks.find((item) => item.id === block.id);
    const storageId = block.storageId || other?.storageId;
    const uri = block.uri || other?.uri || await cacheStoredAttachment(storageId, block.type);
    return { ...other, ...block, ...(storageId ? { storageId } : {}), ...(uri ? { uri } : {}) };
}));

const mergeChildren = async (remoteItems = [], localItems = []) => {
    const remoteByKey = new Map(remoteItems.map((item) => [item.localKey || item.id, item]));
    const localByKey = new Map(localItems.map((item) => [item.localKey || item.id, item]));
    const keys = new Set([...remoteByKey.keys(), ...localByKey.keys()]);
    const merged = [];
    for (const key of keys) {
        const remote = remoteByKey.get(key);
        const local = localByKey.get(key);
        const chosen = local && (!remote || (local.updatedAt || 0) > (remote.updatedAt || 0)) ? local : remote;
        if (remote && local) {
            const contentBlocks = await mergeContentBlocks(chosen.contentBlocks, chosen === local ? remote.contentBlocks : local.contentBlocks);
            const childField = Array.isArray(remote.reflections) || Array.isArray(local.reflections)
                ? 'reflections'
                : Array.isArray(remote.replies) || Array.isArray(local.replies) ? 'replies' : null;
            const children = childField
                ? await mergeChildren(remote[childField] || [], local[childField] || [])
                : undefined;
            merged.push({
                ...chosen,
                contentBlocks,
                attachments: contentBlocks.filter((block) => block.type !== 'text'),
                ...(childField ? { [childField]: children } : {}),
            });
        } else if (remote) {
            const contentBlocks = await mergeContentBlocks(remote.contentBlocks);
            merged.push({ ...remote, contentBlocks, attachments: contentBlocks.filter((block) => block.type !== 'text') });
        } else {
            merged.push(local);
        }
    }
    return merged;
};

export const syncLocalData = async (userId) => {
    if (!userId) throw new Error('A signed-in account is required to sync local data.');
    await authenticateClient();
    await switchLocalAccount(userId);

    const [localJournals, localLetters, deletedJournalIds, deletedLetterIds, deletedReflectionIds, deletedReplyIds] = await Promise.all([
        parseRecords('journals'),
        parseRecords('letters'),
        parseRecords('deletedJournals'),
        parseRecords('deletedLetters'),
        parseRecords('deletedReflections'),
        parseRecords('deletedReplies'),
    ]);
    let [remoteJournals, remoteLetters] = await Promise.all([loadJournalRecords(), loadLetterRecords()]);
    const deletedJournalKeys = new Set(deletedJournalIds.map(String));
    const deletedLetterKeys = new Set(deletedLetterIds.map(String));
    const deletedReflectionKeys = new Set(deletedReflectionIds.map(String));
    const deletedReplyKeys = new Set(deletedReplyIds.map(String));

    for (const key of deletedJournalKeys) await deleteJournalRecord(key);
    for (const key of deletedLetterKeys) await deleteLetterRecord(key);
    for (const key of deletedReflectionKeys) {
        try {
            const [parentKey, reflectionKey] = JSON.parse(key);
            await deleteReflectionRecord({ id: parentKey, localKey: parentKey }, { id: reflectionKey, localKey: reflectionKey });
        } catch (error) { console.warn('Could not sync a deleted reflection:', error); }
    }
    for (const key of deletedReplyKeys) {
        try {
            const [parentKey, replyKey] = JSON.parse(key);
            await deleteReplyRecord({ id: parentKey, localKey: parentKey }, { id: replyKey, localKey: replyKey });
        } catch (error) { console.warn('Could not sync a deleted reply:', error); }
    }
    remoteJournals = remoteJournals.filter((item) => !deletedJournalKeys.has(String(item.localKey || item.id)));
    remoteLetters = remoteLetters.filter((item) => !deletedLetterKeys.has(String(item.localKey || item.id)));

    const remoteJournalByKey = new Map(remoteJournals.map((item) => [item.localKey || item.id, item]));
    for (const journal of localJournals) {
        const remote = remoteJournalByKey.get(journal.localKey || journal.id);
        await syncJournalEntry(journal, remote);
    }
    const remoteLetterByKey = new Map(remoteLetters.map((item) => [item.localKey || item.id, item]));
    for (const letter of localLetters) {
        const remote = remoteLetterByKey.get(letter.localKey || letter.id);
        await syncLetter(letter, remote);
    }

    const [latestJournals, latestLetters] = await Promise.all([loadJournalRecords(), loadLetterRecords()]);
    const journalByKey = new Map(localJournals.map((item) => [item.localKey || item.id, item]));
    const letterByKey = new Map(localLetters.map((item) => [item.localKey || item.id, item]));
    const journals = await mergeChildren(
        latestJournals.filter((item) => !deletedJournalKeys.has(String(item.localKey || item.id))).map((item) => ({
            ...item,
            reflections: (item.reflections || []).filter((child) => !deletedReflectionKeys.has(JSON.stringify([String(item.localKey || item.id), String(child.localKey || child.id)]))),
        })),
        [...journalByKey.values()].filter((item) => !deletedJournalKeys.has(String(item.localKey || item.id))),
    );
    const letters = await mergeChildren(
        latestLetters.filter((item) => !deletedLetterKeys.has(String(item.localKey || item.id))).map((item) => ({
            ...item,
            replies: (item.replies || []).filter((child) => !deletedReplyKeys.has(JSON.stringify([String(item.localKey || item.id), String(child.localKey || child.id)]))),
        })),
        [...letterByKey.values()].filter((item) => !deletedLetterKeys.has(String(item.localKey || item.id))),
    );
    await setManyItems([
        ['journals', JSON.stringify(journals)],
        ['letters', JSON.stringify(letters)],
    ]);
    replaceJournalSnapshot(journals);
    replaceLetterSnapshot(letters);
    await setItems(activeAccountKey, userId);
};
