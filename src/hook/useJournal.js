import journalStore from "../store/journalStore";

export default function useJournal() {
    const journals = journalStore();
    const sortedJournals = [...journals].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    return sortedJournals.map((journal, index) => {
        const currentMonth = new Date(journal.date).toLocaleString("en-US", {
            month: "long",
            year: "numeric"
        });

        const previousMonth = index > 0 ? new Date(sortedJournals[index-1].date).toLocaleString("en-US", {
            month: "long",
            year: "numeric"
        }) : null;

        return {
            ...journal,
            showMonthHeader: currentMonth != previousMonth,
            monthHeader: currentMonth
        };
    });
}