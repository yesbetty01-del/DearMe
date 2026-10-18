import { create } from 'zustand';
import { getItems, setItems, setManyItems } from '../utils/storage';
import { getDeviceTimeZone, getLetterReleaseAt } from '../utils/letterSchedule';

const STORAGE_KEY = 'letters';
const DELETED_LETTERS_STORAGE_KEY = 'deletedLetters';
const DELETED_REPLIES_STORAGE_KEY = 'deletedReplies';
const LEGACY_LETTER_SEED_IDS = new Set(['1', '2', '3']);
let deletedLetterIds = new Set();

const normalizeNow = (value) => {
    const date = value instanceof Date ? value : new Date(value ?? Date.now());
    return Number.isNaN(date.getTime()) ? new Date() : date;
};

export const toLocalDateKey = (value) => {
    if (typeof value === 'string') {
        const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        if (dateOnly) {
            const [, year, month, day] = dateOnly.map(Number);
            const daysInMonth = [31, (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1] ? value : '';
        }
    }
    const date = value instanceof Date ? value : (typeof value === 'number' || typeof value === 'string') ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const getDeliveryDateKey = (value) => toLocalDateKey(value);

export const isLetterAvailable = (letter, now = new Date()) => {
    const releaseAt = letter.releaseAt ?? getLetterReleaseAt(
        getDeliveryDateKey(letter.deliveryDate),
        letter.deliveryTime,
        letter.deliveryTimezone || getDeviceTimeZone(),
    );
    return releaseAt !== null && normalizeNow(now).getTime() >= releaseAt;
};

const withCurrentStatus = (letter, now = new Date()) => {
    const deliveryTimezone = letter.deliveryTimezone || getDeviceTimeZone();
    const releaseAt = getLetterReleaseAt(getDeliveryDateKey(letter.deliveryDate), letter.deliveryTime, deliveryTimezone);
    const scheduledLetter = { ...letter, deliveryTimezone, releaseAt };
    return {
        ...scheduledLetter,
        replies: letter.replies || [],
        status: isLetterAvailable(scheduledLetter, now) ? 'delivered' : 'scheduled',
    };
};

const persist = async (letters) => {
    if (!await setItems(STORAGE_KEY, JSON.stringify(letters))) throw new Error('Could not save your letter. Please try again.');
};

export const useLetterStore = create((set, get) => ({
    letters: [],
    isReady: false,
    addLetter: async (letter) => {
        const record = withCurrentStatus({ ...letter, updatedAt: Date.now() });
        const existingIndex = get().letters.findIndex((item) =>
            (record.id != null && item.id === record.id) ||
            (record.localKey != null && item.localKey === record.localKey),
        );
        let letters = existingIndex === -1
            ? [record, ...get().letters]
            : get().letters.map((item, index) => index === existingIndex ? { ...item, ...record } : item);
        await persist(letters);
        set({ letters });
    },
    updateLetter: async (letterId, updates) => {
        const letters = get().letters.map((letter) => letter.id === letterId
            ? withCurrentStatus({ ...letter, ...updates, updatedAt: Date.now() })
            : letter);
        await persist(letters);
        set({ letters });
    },
    deleteLetter: async (letterId) => {
        const nextDeletedIds = new Set(deletedLetterIds).add(String(letterId));
        const letters = get().letters.filter((letter) => letter.id !== letterId);
        try {
            await setManyItems([
                [DELETED_LETTERS_STORAGE_KEY, JSON.stringify([...nextDeletedIds])],
                [STORAGE_KEY, JSON.stringify(letters)],
            ]);
        } catch { throw new Error('Could not delete your letter. Please try again.'); }
        deletedLetterIds = nextDeletedIds;
        set({ letters });
    },
    addReply: async (letterId, reply) => {
        const record = reply;
        const letters = get().letters.map((letter) => letter.id === letterId
            ? { ...letter, updatedAt: Date.now(), replies: [...(letter.replies || []).filter((item) => item.id !== record.id && item.localKey !== record.localKey), { ...record, updatedAt: Date.now() }] }
            : letter);
        await persist(letters);
        set({ letters });
    },
    updateReply: async (letterId, replyId, updates) => {
        const letters = get().letters.map((letter) => letter.id === letterId
            ? { ...letter, updatedAt: Date.now(), replies: (letter.replies || []).map((reply) => reply.id === replyId ? { ...reply, ...updates, updatedAt: Date.now() } : reply) }
            : letter);
        await persist(letters);
        set({ letters });
    },
    deleteReply: async (letterId, replyId) => {
        const deletedReplyKey = JSON.stringify([String(letterId), String(replyId)]);
        const savedDeletedReplyIds = await getItems(DELETED_REPLIES_STORAGE_KEY);
        let deletedReplyIds = [];
        try { deletedReplyIds = savedDeletedReplyIds ? JSON.parse(savedDeletedReplyIds) : []; } catch { deletedReplyIds = []; }
        const nextDeletedReplyIds = new Set(deletedReplyIds).add(deletedReplyKey);
        const letters = get().letters.map((letter) => letter.id === letterId
            ? { ...letter, updatedAt: Date.now(), replies: (letter.replies || []).filter((reply) => reply.id !== replyId) }
            : letter);
        await setManyItems([
            [DELETED_REPLIES_STORAGE_KEY, JSON.stringify([...nextDeletedReplyIds])],
            [STORAGE_KEY, JSON.stringify(letters)],
        ]);
        set({ letters });
    },
    refreshArrivals: async (now = new Date()) => {
        now = normalizeNow(now);
        const letters = get().letters.map((letter) => withCurrentStatus(letter, now));
        if (letters.some((letter, index) => letter.status !== get().letters[index].status)) {
            await persist(letters);
            set({ letters });
        }
    },
}));

export const hydrateLetterStore = async () => {
    const [storedLetters, storedDeletedIds] = await Promise.all([
        getItems(STORAGE_KEY),
        getItems(DELETED_LETTERS_STORAGE_KEY),
    ]);
    try {
        const parsed = storedDeletedIds ? JSON.parse(storedDeletedIds) : [];
        if (Array.isArray(parsed)) deletedLetterIds = new Set(parsed.map(String));
    } catch (error) { console.error('Error parsing deleted letter IDs:', error); }

    // Legacy demo letters used these fixed IDs. Tombstone them as well as
    // removing them locally so cloud sync cannot restore the demo records.
    for (const id of LEGACY_LETTER_SEED_IDS) deletedLetterIds.add(id);

    let letters = [];
    if (storedLetters) {
        try {
            const saved = JSON.parse(storedLetters);
            if (Array.isArray(saved)) {
                letters = saved.filter((letter) =>
                    !deletedLetterIds.has(String(letter.id)) &&
                    !LEGACY_LETTER_SEED_IDS.has(String(letter.id)),
                ).map(withCurrentStatus);
                if (letters.length !== saved.length) await persist(letters);
            }
        } catch (error) { console.error('Error parsing saved letters:', error); }
    } else {
        await persist([]);
    }
    await setItems(DELETED_LETTERS_STORAGE_KEY, JSON.stringify([...deletedLetterIds]));
    useLetterStore.setState({ letters });
    useLetterStore.setState({ isReady: true });
};

export const useLetters = () => useLetterStore((state) => state.letters);
export const getLetterSnapshot = () => useLetterStore.getState().letters;
export const replaceLetterSnapshot = (letters) => useLetterStore.setState({ letters });
export const setDeletedLetterSnapshot = (ids) => { deletedLetterIds = new Set(ids.map(String)); };
