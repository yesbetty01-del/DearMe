import { create } from 'zustand';
import { getItems, setItems, setManyItems } from '../utils/storage';

const JOURNALS_STORAGE_KEY = 'journals';
const DELETED_JOURNALS_STORAGE_KEY = 'deletedJournals';
const DELETED_REFLECTIONS_STORAGE_KEY = 'deletedReflections';
const LEGACY_JOURNAL_SEED_IDS = new Set(['1', '2', '3']);
const JOURNAL_SEED_CLEANUP_KEY = 'migration:remove-journal-seeds:v1';
let deletedJournalIds = new Set();

const saveLocally = async (journals, errorMessage) => {
    if (!await setItems(JOURNALS_STORAGE_KEY, JSON.stringify(journals))) throw new Error(errorMessage);
};

const useJournalsStore = create((set, get) => ({
    journals: [],
    isReady: false,
    addJournal: async (entry) => {
        const record = { ...entry, updatedAt: Date.now() };
        const existingIndex = get().journals.findIndex((item) => item.id === record.id || item.localKey === record.localKey);
        const journals = existingIndex === -1
            ? [record, ...get().journals]
            : get().journals.map((item, index) => index === existingIndex ? { ...item, ...record } : item);
        await saveLocally(journals, 'Could not save your entry. Please try again.');
        set({ journals });
    },
    updateJournal: async (entryId, updates) => {
        const journals = get().journals.map((journal) => journal.id === entryId ? { ...journal, ...updates, updatedAt: Date.now() } : journal);
        await saveLocally(journals, 'Could not save your entry. Please try again.');
        set({ journals });
    },
    deleteJournal: async (entryId) => {
        const existing = get().journals.find((journal) => journal.id === entryId);
        const nextDeletedIds = new Set(deletedJournalIds).add(String(entryId));
        const journals = get().journals.filter((journal) => journal.id !== entryId);
        try {
            await setManyItems([
                [DELETED_JOURNALS_STORAGE_KEY, JSON.stringify([...nextDeletedIds])],
                [JOURNALS_STORAGE_KEY, JSON.stringify(journals)],
            ]);
        } catch {
            throw new Error('Could not delete your entry. Please try again.');
        }
        deletedJournalIds = nextDeletedIds;
        set({ journals });
    },
    addReflection: async (entryId, reflection) => {
        const record = reflection;
        const journals = get().journals.map((journal) => journal.id === entryId
            ? { ...journal, updatedAt: Date.now(), reflections: [...(journal.reflections || []).filter((item) => item.id !== record.id && item.localKey !== record.localKey), record] }
            : journal);
        await saveLocally(journals, 'Could not save your reflection. Please try again.');
        set({ journals });
    },
    updateReflection: async (entryId, reflectionId, updates) => {
        const journals = get().journals.map((journal) => journal.id === entryId
            ? { ...journal, updatedAt: Date.now(), reflections: (journal.reflections || []).map((reflection) => reflection.id === reflectionId ? { ...reflection, ...updates, updatedAt: Date.now() } : reflection) }
            : journal);
        await saveLocally(journals, 'Could not save your reflection. Please try again.');
        set({ journals });
    },
    deleteReflection: async (entryId, reflectionId) => {
        const deletedReflectionKey = JSON.stringify([String(entryId), String(reflectionId)]);
        const deletedReflectionIds = new Set(await (async () => {
            const saved = await getItems(DELETED_REFLECTIONS_STORAGE_KEY);
            try { return saved ? JSON.parse(saved) : []; } catch { return []; }
        })());
        deletedReflectionIds.add(deletedReflectionKey);
        const journals = get().journals.map((journal) => journal.id === entryId
            ? { ...journal, updatedAt: Date.now(), reflections: (journal.reflections || []).filter((reflection) => reflection.id !== reflectionId) }
            : journal);
        try {
            await setManyItems([
                [DELETED_REFLECTIONS_STORAGE_KEY, JSON.stringify([...deletedReflectionIds])],
                [JOURNALS_STORAGE_KEY, JSON.stringify(journals)],
            ]);
        } catch {
            throw new Error('Could not delete your reflection. Please try again.');
        }
        set({ journals });
    },
}));

export const hydrateJournalStore = async () => {
    const [storedJournals, storedDeletedIds, seedCleanupComplete] = await Promise.all([
        getItems(JOURNALS_STORAGE_KEY),
        getItems(DELETED_JOURNALS_STORAGE_KEY),
        getItems(JOURNAL_SEED_CLEANUP_KEY),
    ]);
    try {
        const parsed = storedDeletedIds ? JSON.parse(storedDeletedIds) : [];
        if (Array.isArray(parsed)) deletedJournalIds = new Set(parsed.map(String));
    } catch (error) { console.error('Error parsing deleted journal IDs:', error); }

    let journals = [];
    if (storedJournals) {
        try {
            const saved = JSON.parse(storedJournals);
            if (Array.isArray(saved)) {
                const removeLegacySeeds = seedCleanupComplete !== 'true';
                journals = saved.filter((journal) =>
                    !deletedJournalIds.has(String(journal.id)) &&
                    !(removeLegacySeeds && LEGACY_JOURNAL_SEED_IDS.has(String(journal.id))),
                );
                if (journals.length !== saved.length || removeLegacySeeds) {
                    await setItems(JOURNALS_STORAGE_KEY, JSON.stringify(journals));
                }
                if (removeLegacySeeds) await setItems(JOURNAL_SEED_CLEANUP_KEY, 'true');
            }
        } catch (error) { console.error('Error parsing saved journals:', error); }
    } else {
        await setItems(JOURNALS_STORAGE_KEY, JSON.stringify([]));
        if (seedCleanupComplete !== 'true') await setItems(JOURNAL_SEED_CLEANUP_KEY, 'true');
    }
    useJournalsStore.setState({ journals });
    useJournalsStore.setState({ isReady: true });
};

export default function journalStore() {
    return useJournalsStore((state) => state.journals);
}

export const useJournalsReady = () => useJournalsStore((state) => state.isReady);
export const getJournalSnapshot = () => useJournalsStore.getState().journals;
export const replaceJournalSnapshot = (journals) => useJournalsStore.setState({ journals });
export const setDeletedJournalSnapshot = (ids) => { deletedJournalIds = new Set(ids.map(String)); };
export const addJournal = (entry) => useJournalsStore.getState().addJournal(entry);
export const updateJournal = (entryId, updates) => useJournalsStore.getState().updateJournal(entryId, updates);
export const deleteJournal = (entryId) => useJournalsStore.getState().deleteJournal(entryId);
export const addReflection = (entryId, reflection) => useJournalsStore.getState().addReflection(entryId, reflection);
export const updateReflection = (entryId, reflectionId, updates) => useJournalsStore.getState().updateReflection(entryId, reflectionId, updates);
export const deleteReflection = (entryId, reflectionId) => useJournalsStore.getState().deleteReflection(entryId, reflectionId);
