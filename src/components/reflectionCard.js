import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import useTheme from '../store/useTheme';
import Icon from './icon';
import { getGapLabel, parseCalendarDate } from '../utils/date';

const ReflectionCard = ({ entry, reflection }) => {
    const { colors, spacing, fSize } = useTheme();
    const writtenDate = reflection.writtenDate || reflection.writtenOn || reflection.date || reflection.createdAt || reflection.timestamp;
    const date = parseCalendarDate(writtenDate);
    const entryDate = parseCalendarDate(entry.date);
    return (
        <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/reflection/[id]', params: { id: reflection.id, entryId: entry.id } })}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, padding: spacing.lg }]}
        >
            <View style={styles.row}>
                <View style={[styles.dot, { borderColor: colors[entry.moodColor] || colors.primary }]} />
                <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={[styles.kicker, { color: colors.mutedForeground }]}>{entryDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || ''} · {entry.title}</Text>
                    <Text numberOfLines={1} style={[styles.quote, { color: colors.mutedForeground }]}>{`“${entry.content}”`}</Text>
                </View>
            </View>
            <View style={[styles.gapRow, { borderColor: colors[entry.moodColor] || colors.primary }]}>
                <View style={[styles.dot, { backgroundColor: colors[entry.moodColor] || colors.primary, borderColor: colors[entry.moodColor] || colors.primary }]} />
                <Text style={[styles.gap, { color: colors.mutedForeground }]}>{getGapLabel(entryDate, date, true)}</Text>
            </View>
            <View style={styles.row}>
                <View style={[styles.dot, { backgroundColor: colors[entry.moodColor] || colors.primary, borderColor: colors[entry.moodColor] || colors.primary }]} />
                <View style={{ flex: 1 }}>
                    <View style={styles.reflectionHeading}>
                        <Text style={[styles.kicker, { color: colors.foreground }]}>REFLECTION · {date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || ''}</Text>
                        <Icon name="arrow-up-right" color={colors.mutedForeground} size={14} />
                    </View>
                    <Text numberOfLines={3} style={[styles.body, { color: colors.foreground, fontSize: fSize.secondary }]}>{reflection.content}</Text>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: { borderWidth: 1, borderRadius: 16, marginBottom: 12 },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, marginTop: 3 },
    kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 1.1, textTransform: 'uppercase' },
    quote: { fontFamily: 'Fraunces_400Regular', fontSize: 12, fontStyle: 'italic', marginTop: 5 },
    gapRow: { borderLeftWidth: 1, borderStyle: 'dashed', marginLeft: 4, marginVertical: 9, paddingVertical: 5, paddingLeft: 18 },
    gap: { fontFamily: 'Fraunces_400Regular', fontStyle: 'italic', fontSize: 11 },
    reflectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    body: { fontFamily: 'Fraunces_400Regular', lineHeight: 22, marginTop: 6 },
});

export default ReflectionCard;
