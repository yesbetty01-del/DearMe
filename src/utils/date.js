const today = new Date();

const day = today.toLocaleDateString('en-US', { weekday: 'long' });
const month = today.toLocaleDateString('en-US', { month: 'long' });
const dateNo = today.getDate();

const todayFormatted = today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

const monthNames = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

const getMonthIndex = (value) => monthNames.indexOf(value.slice(0, 3).toLowerCase());

const parseCalendarDate = (value) => {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'string') {
        const normalized = value.trim();
        const isoDate = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(normalized);
        if (isoDate) {
            return new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
        }

        const numericDate = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(normalized);
        if (numericDate) {
            return new Date(
                Number(numericDate[3]),
                Number(numericDate[1]) - 1,
                Number(numericDate[2]),
            );
        }

        const writtenDate = /^([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{4})$/.exec(normalized);
        if (writtenDate) {
            const month = getMonthIndex(writtenDate[1]);
            if (month >= 0) {
                return new Date(Number(writtenDate[3]), month, Number(writtenDate[2]));
            }
        }
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const getTimestamp = (value) => {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? 0 : value.getTime();
    if (typeof value === 'number') return value;

    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) return timestamp;

    return parseCalendarDate(value)?.getTime() || 0;
};

const getCalendarDay = (value) => {
    const date = parseCalendarDate(value);
    if (!date) return null;
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
};

const daysBetweenDates = (from, to) => {
    const fromDay = getCalendarDay(from);
    const toDay = getCalendarDay(to);
    if (fromDay === null || toDay === null) return null;
    return Math.max(0, Math.round((toDay - fromDay) / 86400000));
};

const getGapLabel = (from, to, includeLater = false) => {
    const days = daysBetweenDates(from, to);
    if (days === null) return 'date unavailable';
    if (days === 0) return includeLater ? 'the same day' : 'same day';

    const months = Math.round(days / 30);
    const gap = days < 45
        ? `${days} ${days === 1 ? 'day' : 'days'}`
        : `${months} ${months === 1 ? 'month' : 'months'}`;

    return includeLater ? `${gap} later` : gap;
};

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

export {
    day,
    month,
    dateNo,
    getGreeting,
    getPrompt,
    todayFormatted,
    daysBetweenDates,
    getGapLabel,
    parseCalendarDate,
    getTimestamp,
};
