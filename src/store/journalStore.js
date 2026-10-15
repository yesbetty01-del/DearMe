import { create } from "zustand";
import { getItems, setItems } from "../utils/storage";

const JOURNALS_STORAGE_KEY = "journals";
const DELETED_JOURNALS_STORAGE_KEY = "deletedJournals";
let deletedJournalIds = new Set();

const useJournalsStore = create((set, get) => ({
    journals: [
        {
            id: "1",
            title: "The morning fog at the cabin",
            date: "2023-11-02T00:00:00.000Z",
            mood: "smile",
            moodName: "CALM",
            moodColor: "moodCalm",
            image: require('../../image/image.png'),
            content: "Spent the morning with coffee and a book. The kind of day that doesn't ask anything of you — no plans to keep, no one waiting on a reply. I used to think days like this were wasted. That if nothing happened, nothing counted. But I'm starting to suspect the opposite is true, that the days which ask nothing are the ones that give the most back. The light moved across the kitchen table while I read. I noticed it three separate times, which felt like its own small accomplishment."
        },
        {
            id: "2",
            title: "Finding small things",
            date: "2024-10-14T00:00:00.000Z",
            mood: "sun",
            moodName: "WARM",
            moodColor: "moodWarm",
            image: require('../../image/image.png'),
            content: "Spent the morning with coffee and a book. The kind of day that doesn't ask anything of you — no plans to keep, no one waiting on a reply. I used to think days like this were wasted. That if nothing happened, nothing counted. But I'm starting to suspect the opposite is true, that the days which ask nothing are the ones that give the most back. The light moved across the kitchen table while I read. I noticed it three separate times, which felt like its own small accomplishment."
        },
        {
            id: "3",
            title: 'The summer of 2025',
            date: "2025-08-02T00:00:00.000Z",
            mood: "cloud",
            moodName: "CLOUDY",
            moodColor: "moodCloud",
            image: require('../../image/image.png'),
            content: "Spent the morning with coffee and a book. The kind of day that doesn't ask anything of you — no plans to keep, no one waiting on a reply. I used to think days like this were wasted. That if nothing happened, nothing counted. But I'm starting to suspect the opposite is true, that the days which ask nothing are the ones that give the most back. The light moved across the kitchen table while I read. I noticed it three separate times, which felt like its own small accomplishment."
        },
    ],
    addJournal: async (entry) => {
        const journals = [entry, ...get().journals];
        set({ journals });
        await setItems(JOURNALS_STORAGE_KEY, JSON.stringify(journals));
    },
    updateJournal: async (entryId, updates) => {
        const journals = get().journals.map((journal) => journal.id === entryId ? { ...journal, ...updates } : journal);
        const saved = await setItems(JOURNALS_STORAGE_KEY, JSON.stringify(journals));
        if (!saved) throw new Error('Could not save your entry. Please try again.');
        set({ journals });
    },
    deleteJournal: async (entryId) => {
        const nextDeletedIds = new Set(deletedJournalIds).add(entryId);
        const savedDeletedIds = await setItems(DELETED_JOURNALS_STORAGE_KEY, JSON.stringify([...nextDeletedIds]));
        if (!savedDeletedIds) throw new Error('Could not delete your entry. Please try again.');
        deletedJournalIds = nextDeletedIds;
        const journals = get().journals.filter((journal) => journal.id !== entryId);
        const saved = await setItems(JOURNALS_STORAGE_KEY, JSON.stringify(journals));
        if (!saved) throw new Error('Could not delete your entry. Please try again.');
        set({ journals });
    },
    addReflection: async (entryId, reflection) => {
        const journals = get().journals.map((journal) => journal.id === entryId
            ? { ...journal, reflections: [...(journal.reflections || []), reflection] }
            : journal);
        set({ journals });
        await setItems(JOURNALS_STORAGE_KEY, JSON.stringify(journals));
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

Promise.all([getItems(JOURNALS_STORAGE_KEY), getItems(DELETED_JOURNALS_STORAGE_KEY)]).then(([storedJournals, storedDeletedIds]) => {
    try {
        const parsedDeletedIds = storedDeletedIds ? JSON.parse(storedDeletedIds) : [];
        if (Array.isArray(parsedDeletedIds)) deletedJournalIds = new Set(parsedDeletedIds);
    } catch (error) {
        console.error("Error parsing deleted journal IDs:", error);
    }
    if (!storedJournals) {
        if (deletedJournalIds.size) useJournalsStore.setState((state) => ({ journals: state.journals.filter((journal) => !deletedJournalIds.has(journal.id)) }));
        return;
    }

    try {
        const savedJournals = JSON.parse(storedJournals);
        const journals = Array.isArray(savedJournals)
            ? savedJournals.filter((journal) => !deletedJournalIds.has(journal.id))
            : [];
        if (Array.isArray(journals)) {
            const currentJournals = useJournalsStore.getState().journals;
            const storedIds = new Set(journals.map((journal) => journal.id));
            const mergedJournals = [
                ...currentJournals.filter((journal) => !deletedJournalIds.has(journal.id) && !storedIds.has(journal.id)),
                ...journals,
            ];
            useJournalsStore.setState({ journals: mergedJournals });
        }
    } catch (error) {
        console.error("Error parsing saved journals:", error);
    }
});

export default function journalStore() {
    return useJournalsStore((state) => state.journals)
}

export const addJournal = (entry) => useJournalsStore.getState().addJournal(entry);
export const updateJournal = (entryId, updates) => useJournalsStore.getState().updateJournal(entryId, updates);
export const deleteJournal = (entryId) => useJournalsStore.getState().deleteJournal(entryId);
export const addReflection = (entryId, reflection) => useJournalsStore.getState().addReflection(entryId, reflection);
export const updateReflection = (entryId, reflectionId, updates) => useJournalsStore.getState().updateReflection(entryId, reflectionId, updates);
export const deleteReflection = (entryId, reflectionId) => useJournalsStore.getState().deleteReflection(entryId, reflectionId);
