import { create } from "zustand";

const useJournalsStore = create((set) => ({
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
}))
export default function journalStore() {
    return useJournalsStore((state) => state.journals)
}