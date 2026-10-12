import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import useTheme from '../../store/useTheme';
import Section from '../section';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MOODS = {
    calm: 'moodCalm', warm: 'moodWarm', cloudy: 'moodCloud', quiet: 'moodQuiet', alive: 'moodAlive',
};

const startOfDay = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
};

const WeekMoodTracker = ({ entries = [] }) => {
    const { colors, spacing } = useTheme();
    const styles = createStyles(colors, spacing);
    const days = useMemo(() => {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
        return DAYS.map((label, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            const entry = entries.find((item) => startOfDay(item.date) === startOfDay(date));
            return { label, date, entry, isToday: startOfDay(date) === startOfDay(today) };
        });
    }, [entries]);

    return (
        <View style={styles.container}>
            <Section title="This week" />
            <View style={styles.days}>
                {days.map((day, index) => {
                    const moodKey = day.entry?.moodName?.toLowerCase();
                    const moodColor = moodKey ? colors[MOODS[moodKey]] : null;
                    return (
                        <View key={`${day.label}-${index}`} style={styles.day}>
                            <Text style={styles.dayLabel}>{day.label}</Text>
                            <View style={[styles.dateCircle, { borderColor: day.isToday ? colors.primary : colors.border, backgroundColor: moodColor || 'transparent', borderStyle: day.entry ? 'solid' : 'dashed' }]}>
                                <Text style={{ color: day.entry ? colors.onPrimary : colors.mutedForeground, fontSize: 12 }}>{day.date.getDate()}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const createStyles = (colors, spacing) => StyleSheet.create({
    container: { marginTop: spacing.xl },
    days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
    day: { alignItems: 'center', gap: spacing.sm },
    dayLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.mutedForeground },
    dateCircle: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});

export default WeekMoodTracker;
