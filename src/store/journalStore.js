import { create } from "zustand";

const useJournalsStore = create((set) => ({
    journals: [
        {
            id: "1",
            title: "The morning fog at the cabin",
            date: "2023-11-02T00:00:00.000Z",
            mood: "smile",
            content: "Today the air felt different. There was a stillness that made everything seem possible again. I sat with my coffee and watched the light break through the pines."
        },
        {
            id: "2",
            title: "Finding small things",
            date: "2024-10-14T00:00:00.000Z",
            mood: "sun",
            content: "I noticed the way afternoon light fell across the kitchen floor and felt grateful in a way I couldn't name."
        },
        {
            id: "3",
            title: 'The summer of 2025',
            date: "2025-08-02T00:00:00.000Z",
            mood: "cloud",
            content: "I keep returning to that summer. Not because it was perfect but because I was so fully there."
        },
    ],
}))
export default function journalStore() {
    return useJournalsStore((state) => state.journals)
}