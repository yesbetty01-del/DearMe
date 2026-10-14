import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import useTheme from '../../store/useTheme';
import { useLetterStore } from '../../store/letterStore';
import Icon from '../../components/icon';
import { daysBetweenDates, getGapLabel, parseCalendarDate } from '../../utils/date';

const formatDate = (value, options) => parseCalendarDate(value)?.toLocaleDateString('en-US', options) || value || '';
const formatShort = (value) => formatDate(value, { month: 'short', day: 'numeric' });
const formatLong = (value) => formatDate(value, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const ReplyDetail = () => {
    const { colors, spacing, fSize } = useTheme();
    const { id, letterId } = useLocalSearchParams();
    const letters = useLetterStore((state) => state.letters);
    const letter = letters.find((item) => item.id === letterId);
    const reply = letter?.replies?.find((item) => item.id === id);
    if (!letter || !reply) return null;

    const replyDate = reply.writtenDate ?? reply.writtenOn ?? reply.date ?? reply.createdAt ?? reply.timestamp;
    const sealedDate = letter.writtenDate ?? letter.sealedOn ?? letter.createdAt ?? letter.timestamp;
    const paragraphs = (reply.content || '').split(/\n\s*\n/).filter(Boolean).map((paragraph, index) =>
        index === 0 ? paragraph.replace(/^Dear past me[,—–\s-]*/i, '') : paragraph
    );
    const days = daysBetweenDates(sealedDate, replyDate);
    const gap = getGapLabel(sealedDate, replyDate);
    const accent = colors[letter.moodColor] || colors.primary;

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
                <TouchableOpacity accessibilityLabel="Back" onPress={() => router.back()} style={[styles.back, { borderColor: colors.border }]}>
                    <Icon name="chevron-left" color={colors.foreground} size={16} />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Icon name="mail" color={colors.mutedForeground} size={13} />
                    <Text style={[styles.kicker, { color: colors.mutedForeground }]}>REPLY</Text>
                </View>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
                <View style={[styles.timeline, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
                    <View>
                        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>SEALED</Text>
                        <Text style={[styles.timelineDate, { color: colors.foreground }]}>{formatShort(sealedDate)}</Text>
                    </View>
                    <View style={styles.timelineLine}>
                        <View style={[styles.line, { backgroundColor: accent }]} />
                        <Text style={[styles.gap, { color: colors.mutedForeground, backgroundColor: colors.background }]}>{gap}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>REPLIED</Text>
                        <Text style={[styles.timelineDate, { color: colors.foreground }]}>{formatShort(replyDate)}</Text>
                    </View>
                </View>

                <PressableOriginal letter={letter} colors={colors} spacing={spacing} onPress={() => router.replace(`/letter/${letter.id}`)} />

                <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
                    <View style={styles.dateRow}>
                        <View style={[styles.accentLine, { backgroundColor: accent }]} />
                        <Text style={[styles.kicker, { color: accent }]}>{formatLong(replyDate)}</Text>
                    </View>
                    <View style={{ marginTop: spacing.lg, gap: spacing.lg }}>
                        {paragraphs.map((paragraph, index) => (
                            <Text key={index} style={[styles.paragraph, { color: colors.foreground, fontSize: fSize.body }]}>{paragraph}</Text>
                        ))}
                    </View>
                    <Text style={[styles.signature, { color: colors.mutedForeground }]}>— You, {days === 0 ? 'the same day' : `${gap} later`}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const PressableOriginal = ({ letter, colors, spacing, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.original, { marginHorizontal: spacing.lg, marginTop: spacing.xl, backgroundColor: colors.secondary, padding: spacing.lg }]}>
        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>IN ANSWER TO</Text>
        <Text style={[styles.originalTitle, { color: colors.foreground }]}>{letter.title}</Text>
        {!!letter.content && <Text numberOfLines={3} style={[styles.quote, { color: colors.mutedForeground }]}>{`“${letter.content.split(/\n\s*\n/)[1] || letter.content}”`}</Text>}
        <View style={styles.readLink}><Text style={[styles.readText, { color: colors.primary }]}>Read the letter</Text><Icon name="arrow-right" color={colors.primary} size={13} /></View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    back: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 1.4 },
    timeline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    timelineDate: { fontFamily: 'Fraunces_400Regular', fontSize: 14, marginTop: 3 },
    timelineLine: { flex: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: 10 },
    line: { width: '100%', height: 1, opacity: 0.4 },
    gap: { position: 'absolute', paddingHorizontal: 8, fontFamily: 'Fraunces_400Regular', fontSize: 11, fontStyle: 'italic' },
    original: { borderRadius: 16 },
    originalTitle: { fontFamily: 'Fraunces_400Regular', fontSize: 19, marginTop: 6 },
    quote: { fontFamily: 'Fraunces_400Regular', fontSize: 14, fontStyle: 'italic', lineHeight: 21, marginTop: 8 },
    readLink: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12 },
    readText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    accentLine: { width: 24, height: 1 },
    paragraph: { fontFamily: 'Fraunces_400Regular', lineHeight: 30 },
    signature: { fontFamily: 'Fraunces_400Regular', fontSize: 16, fontStyle: 'italic', textAlign: 'right', marginTop: 24 },
});

export default ReplyDetail;
