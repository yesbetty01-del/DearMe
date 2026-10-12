import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import useTheme from '../../store/useTheme';
import Icon from '../icon';
import Section from '../section';

const MOOD_COLORS = { calm: 'moodCalm', warm: 'moodWarm', cloudy: 'moodCloud', quiet: 'moodQuiet', alive: 'moodAlive' };

const EarlierEntriesList = ({ entries = [] }) => {
    const { colors, spacing } = useTheme();
    const styles = createStyles(colors, spacing);
    if (!entries.length) return null;
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <View style={styles.container}>
            <View style={styles.heading}>
                <Section title="Earlier" />
                <Pressable onPress={() => router.push('/journal')} style={styles.link}>
                    <Text style={styles.linkText}>OPEN JOURNAL</Text><Icon name="arrow-right" size={14} />
                </Pressable>
            </View>
            {sortedEntries.map((entry) => {
                const moodColor = colors[MOOD_COLORS[(entry.moodName || '').toLowerCase()]] || colors.primary;
                const entryDate = new Date(entry.date);
                const dateOptions = { month: 'short', day: 'numeric' };
                if (entryDate.getFullYear() !== new Date().getFullYear()) dateOptions.year = 'numeric';
                return (
                    <Pressable key={entry.id} onPress={() => router.push(`/entry/${entry.id}`)} style={styles.row}>
                        <Text style={styles.date}>{entryDate.toLocaleDateString('en-US', dateOptions)}</Text>
                        <View style={[styles.dot, { backgroundColor: moodColor }]} />
                        <Text numberOfLines={1} style={styles.title}>{entry.title}</Text>
                        <Icon name="chevron-right" size={15} />
                    </Pressable>
                );
            })}
        </View>
    );
};

const createStyles = (colors, spacing) => StyleSheet.create({
    container: { marginTop: spacing.xl, paddingHorizontal: spacing.xl },
    heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    link: { flexDirection: 'row', alignItems: 'center' },
    linkText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: colors.mutedForeground, letterSpacing: 1 },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
    date: { width: 44, fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.mutedForeground },
    dot: { width: 7, height: 7, borderRadius: 4 },
    title: { flex: 1, fontFamily: 'Fraunces_400Regular', fontSize: 14, color: colors.foreground },
});

export default EarlierEntriesList;
