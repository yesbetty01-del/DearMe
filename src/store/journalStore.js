import { create } from "zustand";
import { getItems, setItems, setManyItems } from "../utils/storage";

const JOURNALS_STORAGE_KEY = "journals";
const DELETED_JOURNALS_STORAGE_KEY = "deletedJournals";
const LEGACY_JOURNAL_SEED_IDS = new Set(["1", "2", "3"]);
const JOURNAL_SEED_CLEANUP_KEY = 'migration:remove-journal-seeds:v1';
let deletedJournalIds = new Set();

const useJournalsStore = create((set, get) => ({
    journals: [],
    addJournal: async (entry) => {
        const journals = [entry, ...get().journals];
        if (!await setItems(JOURNALS_STORAGE_KEY, JSON.stringify(journals))) throw new Error('Could not save your entry. Please try again.');
        set({ journals });
    },
    updateJournal: async (entryId, updates) => {
        const journals = get().journals.map((journal) => journal.id === entryId ? { ...journal, ...updates } : journal);
        const saved = await setItems(JOURNALS_STORAGE_KEY, JSON.stringify(journals));
        if (!saved) throw new Error('Could not save your entry. Please try again.');
        set({ journals });
    },
    deleteJournal: async (entryId) => {
        const nextDeletedIds = new Set(deletedJournalIds).add(entryId);
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
        const journals = get().journals.map((journal) => journal.id === entryId
            ? { ...journal, reflections: [...(journal.reflections || []), reflection] }
            : journal);
        if (!await setItems(JOURNALS_STORAGE_KEY, JSON.stringify(journals))) throw new Error('Could not save your reflection. Please try again.');
        set({ journals });
    },
    updateReflection: async (entryId, reflectionId, updates) => {
        const journals = get().journals.map((journal) => journal.id === entryId
            ? { ...journal, reflections: (journal.reflections || []).map((reflection) => reflection.id === reflectionId ? { ...reflection, ...updates } : reflection) }
            : journal);
        const saved = await setItems(JOURNALS_STORAGE_KEY, JSON.stringify(journals));
        if (!saved) throw new Error('Could not save your reflection. Please try again.');
        set({ journals });
    },
    deleteReflection: async (entryId, reflectionId) => {
        const journals = get().journals.map((journal) => journal.id === entryId
            ? { ...journal, reflections: (journal.reflections || []).filter((reflection) => reflection.id !== reflectionId) }
            : journal);
        const saved = await setItems(JOURNALS_STORAGE_KEY, JSON.stringify(journals));
        if (!saved) throw new Error('Could not delete your reflection. Please try again.');
        set({ journals });
    },
}))

export const hydrateJournalStore = async () => {
    const [storedJournals, storedDeletedIds, seedCleanupComplete] = await Promise.all([
        getItems(JOURNALS_STORAGE_KEY),
        getItems(DELETED_JOURNALS_STORAGE_KEY),
        getItems(JOURNAL_SEED_CLEANUP_KEY),
    ]);
    try {
        const parsedDeletedIds = storedDeletedIds ? JSON.parse(storedDeletedIds) : [];
        if (Array.isArray(parsedDeletedIds)) deletedJournalIds = new Set(parsedDeletedIds.map(String));
    } catch (error) {
        console.error("Error parsing deleted journal IDs:", error);
    }
    if (!storedJournals) {
        useJournalsStore.setState({ journals: [] });
        await setItems(JOURNALS_STORAGE_KEY, JSON.stringify([]));
        if (!seedCleanupComplete) await setItems(JOURNAL_SEED_CLEANUP_KEY, 'true');
        return;
    }

    try {
        const savedJournals = JSON.parse(storedJournals);
        const removeLegacySeeds = seedCleanupComplete !== 'true';
        const journals = Array.isArray(savedJournals)
            ? savedJournals.filter((journal) => {
                const isLegacySeed = removeLegacySeeds && LEGACY_JOURNAL_SEED_IDS.has(String(journal.id));
                return !deletedJournalIds.has(String(journal.id)) && !isLegacySeed;
            })
            : [];
        useJournalsStore.setState({ journals });
        if (journals.length !== savedJournals.length || removeLegacySeeds) {
            await setItems(JOURNALS_STORAGE_KEY, JSON.stringify(journals));
        }
        if (removeLegacySeeds) await setItems(JOURNAL_SEED_CLEANUP_KEY, 'true');
    } catch (error) {
        console.error("Error parsing saved journals:", error);
    }
};

export default function journalStore() {
    return useJournalsStore((state) => state.journals)
}

export const addJournal = (entry) => useJournalsStore.getState().addJournal(entry);
export const updateJournal = (entryId, updates) => useJournalsStore.getState().updateJournal(entryId, updates);
export const deleteJournal = (entryId) => useJournalsStore.getState().deleteJournal(entryId);
export const addReflection = (entryId, reflection) => useJournalsStore.getState().addReflection(entryId, reflection);
export const updateReflection = (entryId, reflectionId, updates) => useJournalsStore.getState().updateReflection(entryId, reflectionId, updates);
export const deleteReflection = (entryId, reflectionId) => useJournalsStore.getState().deleteReflection(entryId, reflectionId);
