import { create } from "zustand";

const useLettersStore = create((set) => ({
    letters: [
        { id: '1', title: 'A letter to my one year older self' },
    ],
}))
export default function useLetters() {
    return useLettersStore((state) => state.letters)
}