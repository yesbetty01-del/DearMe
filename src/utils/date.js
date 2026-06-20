const today = new Date();

const day = today.toLocaleDateString('en-US', { weekday: 'long' });
const month = today.toLocaleDateString('en-US', { month: 'long' });
const dateNo = today.getDate();

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'GOOD MORNING';
    if (hour >= 12 && hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
};

const getPrompt = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'What is your intention for today?';
    if (hour >= 12 && hour < 17) return 'How is your day going?';
    return 'How was your day?';
}

export { day, month, dateNo, getGreeting, getPrompt };