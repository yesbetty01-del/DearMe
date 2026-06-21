import { create } from "zustand";

const useJournalsStore = create((set) => ({
    journals: [
        { id: '1', title: 'The morning fog at the cabin', date: "2025-11-02T00:00:00.000Z" },
        { id: '2', title: 'Finding small things', date: "2025-10-14T00:00:00.000Z" },
        { id: '3', title: 'The summer of 2025', date: "2025-08-02T00:00:00.000Z" },
    ],
}))
export default function useJournals() {
    return useJournalsStore((state) => state.journals)
}