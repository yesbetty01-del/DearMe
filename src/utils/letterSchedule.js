const getLocalParts = (instant, timeZone) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(instant);
    return Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
};

const matches = (actual, expected) =>
    actual.year === expected[0] &&
    actual.month === expected[1] &&
    actual.day === expected[2] &&
    actual.hour === expected[3] &&
    actual.minute === expected[4] &&
    actual.second === 0;

export const getLetterReleaseAt = (deliveryDate, deliveryTime = '00:00', timeZone = 'UTC') => {
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(deliveryDate || '');
    const timeMatch = /^(\d{2}):(\d{2})$/.exec(deliveryTime || '');
    if (!dateMatch || !timeMatch) return null;

    const expected = [
        Number(dateMatch[1]), Number(dateMatch[2]), Number(dateMatch[3]),
        Number(timeMatch[1]), Number(timeMatch[2]),
    ];
    const dateCheck = new Date(Date.UTC(expected[0], expected[1] - 1, expected[2]));
    if (
        dateCheck.getUTCFullYear() !== expected[0] ||
        dateCheck.getUTCMonth() + 1 !== expected[1] ||
        dateCheck.getUTCDate() !== expected[2] ||
        expected[3] > 23 || expected[4] > 59
    ) return null;

    try {
        new Intl.DateTimeFormat('en-US', { timeZone }).format(0);
        const nominalUtc = Date.UTC(expected[0], expected[1] - 1, expected[2], expected[3], expected[4]);
        const offsets = new Set();
        for (let delta = -36; delta <= 36; delta += 1) {
            const sample = nominalUtc + delta * 60 * 60 * 1000;
            const local = getLocalParts(sample, timeZone);
            offsets.add(Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second) - sample);
        }

        const candidates = [...offsets]
            .map((offset) => nominalUtc - offset)
            .filter((instant) => matches(getLocalParts(instant, timeZone), expected))
            .sort((left, right) => left - right);
        if (candidates.length) return candidates[0];

        // For a skipped DST wall time, advance to the first valid minute.
        for (let minute = 1; minute <= 180; minute += 1) {
            const shifted = new Date(nominalUtc + minute * 60_000);
            const shiftedParts = [
                shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate(),
                shifted.getUTCHours(), shifted.getUTCMinutes(),
            ];
            const shiftedUtc = Date.UTC(...shiftedParts.slice(0, 3), shiftedParts[3], shiftedParts[4]);
            for (const offset of offsets) {
                const instant = shiftedUtc - offset;
                if (matches(getLocalParts(instant, timeZone), shiftedParts)) return instant;
            }
        }
    } catch (error) {
        return null;
    }
    return null;
};

export const getDeviceTimeZone = () =>
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
