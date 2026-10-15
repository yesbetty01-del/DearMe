import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import useTheme from '../../store/useTheme';
import journalStore from '../../store/journalStore';
import Icon from '../../components/icon';
import { getGapLabel, parseCalendarDate } from '../../utils/date';

const formatDate = (value, options) => parseCalendarDate(value)?.toLocaleDateString('en-US', options) || value || '';

const ReflectionDetail = () => {
    const { colors, spacing, fSize } = useTheme();
    const { id, entryId } = useLocalSearchParams();
    const entries = journalStore();
    const entry = entries.find((item) => item.id === entryId);
    const reflection = entry?.reflections?.find((item) => item.id === id);
    if (!entry || !reflection) return null;
    const writtenDate = reflection.writtenDate || reflection.writtenOn || reflection.date || reflection.createdAt || reflection.timestamp;
    const accent = colors[entry.moodColor] || colors.primary;

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
                <TouchableOpacity accessibilityLabel="Back" onPress={() => router.back()} style={[styles.back, { borderColor: colors.border }]}><Icon name="chevron-left" color={colors.foreground} size={16} /></TouchableOpacity>
                <View style={styles.headerTitle}><Icon name="corner-down-right" color={colors.mutedForeground} size={13} /><Text style={[styles.kicker, { color: colors.mutedForeground }]}>REFLECTION</Text></View>
                <View style={{ width: 36 }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
                <View style={[styles.timeline, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
                    <View><Text style={[styles.kicker, { color: colors.mutedForeground }]}>WRITTEN</Text><Text style={[styles.timelineDate, { color: colors.foreground }]}>{formatDate(entry.date, { month: 'short', day: 'numeric' })}</Text></View>
                    <View style={styles.timelineLine}><View style={[styles.line, { backgroundColor: accent }]} /><Text style={[styles.gap, { color: colors.mutedForeground, backgroundColor: colors.background }]}>{getGapLabel(entry.date, writtenDate)}</Text></View>
                    <View style={{ alignItems: 'flex-end' }}><Text style={[styles.kicker, { color: colors.mutedForeground }]}>REFLECTED</Text><Text style={[styles.timelineDate, { color: colors.foreground }]}>{formatDate(writtenDate, { month: 'short', day: 'numeric' })}</Text></View>
                </View>
                <TouchableOpacity onPress={() => router.replace(`/entry/${entry.id}`)} style={[styles.original, { marginHorizontal: spacing.lg, marginTop: spacing.xl, backgroundColor: colors.secondary, padding: spacing.lg }]}>
                    <Text style={[styles.kicker, { color: colors.mutedForeground }]}>LOOKING BACK ON</Text>
                    <Text style={[styles.originalTitle, { color: colors.foreground }]}>{entry.title}</Text>
                    <Text numberOfLines={3} style={[styles.quote, { color: colors.mutedForeground }]}>{`“${entry.content}”`}</Text>
                    <View style={styles.readLink}><Text style={[styles.readText, { color: colors.primary }]}>Read the journal entry</Text><Icon name="arrow-right" color={colors.primary} size={13} /></View>
                </TouchableOpacity>
                <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
                    <View style={styles.dateRow}><View style={[styles.accentLine, { backgroundColor: accent }]} /><Text style={[styles.kicker, { color: accent }]}>{formatDate(writtenDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text></View>
                    <Text style={[styles.paragraph, { color: colors.foreground, fontSize: fSize.body, marginTop: spacing.lg }]}>{reflection.content}</Text>
                    <Text style={[styles.signature, { color: colors.mutedForeground }]}>— You, {getGapLabel(entry.date, writtenDate, true)}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 }, header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    back: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 }, kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 1.4 },
    timeline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, timelineDate: { fontFamily: 'Fraunces_400Regular', fontSize: 14, marginTop: 3 },
    timelineLine: { flex: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: 10 }, line: { width: '100%', height: 1, opacity: 0.4 },
    gap: { position: 'absolute', paddingHorizontal: 8, fontFamily: 'Fraunces_400Regular', fontSize: 11, fontStyle: 'italic' },
    original: { borderRadius: 16 }, originalTitle: { fontFamily: 'Fraunces_400Regular', fontSize: 19, marginTop: 6 },
    quote: { fontFamily: 'Fraunces_400Regular', fontSize: 14, fontStyle: 'italic', lineHeight: 21, marginTop: 8 },
    readLink: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12 }, readText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, accentLine: { width: 24, height: 1 },
    paragraph: { fontFamily: 'Fraunces_400Regular', lineHeight: 30 }, signature: { fontFamily: 'Fraunces_400Regular', fontSize: 16, fontStyle: 'italic', textAlign: 'right', marginTop: 24 },
});

export default ReflectionDetail;
