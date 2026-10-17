import { create } from 'zustand';
import { getItems, setItems, setManyItems } from '../utils/storage';

const STORAGE_KEY = 'letters';
const DELETED_LETTERS_STORAGE_KEY = 'deletedLetters';
const LEGACY_LETTER_SEED_IDS = new Set(['1', '2', '3']);
const LETTER_SEED_CLEANUP_KEY = 'migration:remove-letter-seeds:v1';
let deletedLetterIds = new Set();

export const toLocalDateKey = (value) => {
    if (typeof value === 'string') {
        const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        if (dateOnly) {
            const [, year, month, day] = dateOnly.map(Number);
            const daysInMonth = [31, (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1] ? value : '';
        }
    }

    const date = value instanceof Date
        ? value
        : (typeof value === 'number' || typeof value === 'string') ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getDeliveryDateKey = (value) => toLocalDateKey(value);

export const isLetterAvailable = (letter, now = new Date()) => {
    const deliveryDateKey = getDeliveryDateKey(letter.deliveryDate);
    if (!deliveryDateKey) return false;

    const todayKey = toLocalDateKey(now);
    if (deliveryDateKey !== todayKey) return deliveryDateKey < todayKey;
    if (!letter.deliveryTime) return true;

    const timeMatch = /^(\d{2}):(\d{2})$/.exec(letter.deliveryTime);
    if (!timeMatch) return false;

    const [, hours, minutes] = timeMatch;
    const deliveryDateTime = new Date(`${deliveryDateKey}T${hours}:${minutes}:00`);
    return !Number.isNaN(deliveryDateTime.getTime()) && now >= deliveryDateTime;
};

const withCurrentStatus = (letter, now = new Date()) => ({
    ...letter,
    replies: letter.replies || [],
    status: isLetterAvailable(letter, now) ? 'delivered' : 'scheduled',
});

const persist = async (letters) => {
    const saved = await setItems(STORAGE_KEY, JSON.stringify(letters));
    if (!saved) throw new Error('Could not save your letter. Please try again.');
};

export const useLetterStore = create((set, get) => ({
    letters: [],
    addLetter: async (letter) => {
        const letters = [withCurrentStatus(letter), ...get().letters];
        await persist(letters);
        set({ letters });
    },
    updateLetter: async (letterId, updates) => {
        const letters = get().letters.map((letter) => letter.id === letterId
            ? withCurrentStatus({ ...letter, ...updates })
            : letter);
        await persist(letters);
        set({ letters });
    },
    deleteLetter: async (letterId) => {
        const nextDeletedIds = new Set(deletedLetterIds).add(letterId);
        const letters = get().letters.filter((letter) => letter.id !== letterId);
        try {
            await setManyItems([
                [DELETED_LETTERS_STORAGE_KEY, JSON.stringify([...nextDeletedIds])],
                [STORAGE_KEY, JSON.stringify(letters)],
            ]);
        } catch {
            throw new Error('Could not delete your letter. Please try again.');
        }
        deletedLetterIds = nextDeletedIds;
        set({ letters });
    },
    addReply: async (letterId, reply) => {
        const letters = get().letters.map((letter) => letter.id === letterId
            ? { ...letter, replies: [...(letter.replies || []), reply] }
            : letter);
        await persist(letters);
        set({ letters });
    },
    updateReply: async (letterId, replyId, updates) => {
        const letters = get().letters.map((letter) => letter.id === letterId
            ? { ...letter, replies: (letter.replies || []).map((reply) => reply.id === replyId ? { ...reply, ...updates } : reply) }
            : letter);
        await persist(letters);
        set({ letters });
    },
    deleteReply: async (letterId, replyId) => {
        const letters = get().letters.map((letter) => letter.id === letterId
            ? { ...letter, replies: (letter.replies || []).filter((reply) => reply.id !== replyId) }
            : letter);
        await persist(letters);
        set({ letters });
    },
    refreshArrivals: async (now = new Date()) => {
        const letters = get().letters.map((letter) => withCurrentStatus(letter, now));
        if (letters.some((letter, index) => letter.status !== get().letters[index].status)) {
            await persist(letters);
            set({ letters });
        }
    },
}));

export const hydrateLetterStore = async () => {
    const [storedLetters, storedDeletedIds, seedCleanupComplete] = await Promise.all([
        getItems(STORAGE_KEY),
        getItems(DELETED_LETTERS_STORAGE_KEY),
        getItems(LETTER_SEED_CLEANUP_KEY),
    ]);
    try {
        const parsedDeletedIds = storedDeletedIds ? JSON.parse(storedDeletedIds) : [];
        if (Array.isArray(parsedDeletedIds)) deletedLetterIds = new Set(parsedDeletedIds.map(String));
    } catch (error) {
        console.error('Error parsing deleted letter IDs:', error);
    }
    if (!storedLetters) {
        const letters = useLetterStore.getState().letters
            .filter((letter) => !deletedLetterIds.has(String(letter.id)))
            .map(withCurrentStatus);
        useLetterStore.setState({ letters });
        await persist(letters);
        if (!seedCleanupComplete) await setItems(LETTER_SEED_CLEANUP_KEY, 'true');
        return;
    }
    try {
        const saved = JSON.parse(storedLetters);
        if (!Array.isArray(saved)) return;
        const removeLegacySeeds = seedCleanupComplete !== 'true';
        const activeSavedLetters = saved.filter((letter) => {
            const isLegacySeed = removeLegacySeeds && LEGACY_LETTER_SEED_IDS.has(String(letter.id));
            return !deletedLetterIds.has(String(letter.id)) && !isLegacySeed;
        });
        const letters = activeSavedLetters.map(withCurrentStatus);
        useLetterStore.setState({ letters });
        if (letters.length !== saved.length || removeLegacySeeds) await persist(letters);
        if (removeLegacySeeds) await setItems(LETTER_SEED_CLEANUP_KEY, 'true');
    } catch (error) {
        console.error('Error parsing saved letters:', error);
    }
};

export const useLetters = () => useLetterStore((state) => state.letters);
