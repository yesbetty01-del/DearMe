import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import useTheme from '../store/useTheme';
import { getGapLabel, parseCalendarDate } from '../utils/date';

const LetterReplyCard = ({ letter, reply }) => {
    const { colors, spacing, fSize } = useTheme();
    const replyDate =
        reply.writtenDate ??
        reply.writtenOn ??
        reply.date ??
        reply.createdAt ??
        reply.timestamp;
    const sealedDate =
        letter.writtenDate ??
        letter.sealedOn ??
        letter.createdAt ??
        letter.timestamp;
    const date = parseCalendarDate(replyDate);
    const dateDay = date?.getDate() || '';
    const dateMonth = date?.toLocaleDateString('en-US', { month: 'short' }) || '';

    return (
        <Pressable
            accessibilityRole="button"
            onPress={() =>
                router.push({
                    pathname: '/reply/[id]',
                    params: { id: reply.id, letterId: letter.id },
                })
            }
            style={[
                styles.card,
                { backgroundColor: colors.surface, marginTop: spacing.md },
            ]}
        >
            <View
                style={[
                    styles.inner,
                    { borderColor: `${colors.primary}4D`, padding: spacing.lg },
                ]}
            >
                <View style={styles.row}>
                    <View style={styles.copy}>
                        <Text
                            numberOfLines={1}
                            style={[styles.kicker, { color: colors.mutedForeground }]}
                        >
                            {letter.title}
                        </Text>
                        <Text
                            numberOfLines={3}
                            style={[
                                styles.body,
                                { color: colors.foreground, fontSize: fSize.secondary },
                            ]}
                        >
                            {(reply.content || '').replace(/^Dear past me[,—–\s-]*/i, '')}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.stamp,
                            { backgroundColor: colors[letter.moodColor] || colors.primary },
                        ]}
                    >
                        <View style={styles.stampInner}>
                            <Text style={[styles.stampDay, { color: colors.onPrimary }]}>
                                {dateDay}
                            </Text>
                            <Text style={[styles.stampMonth, { color: colors.onPrimary }]}>
                                {dateMonth}
                            </Text>
                        </View>
                    </View>
                </View>

                <View
                    style={[
                        styles.footer,
                        {
                            borderTopColor: colors.border,
                            marginTop: spacing.md,
                            paddingTop: spacing.md,
                        },
                    ]}
                >
                    <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                        Replied {getGapLabel(sealedDate, replyDate, true)}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 6,
    },
    inner: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    copy: {
        flex: 1,
    },
    kicker: {
        fontFamily: 'Inter_500Medium',
        fontSize: 10,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    body: {
        fontFamily: 'Fraunces_400Regular',
        lineHeight: 23,
        marginTop: 8,
    },
    stamp: {
        padding: 3,
        borderRadius: 5,
        transform: [{ rotate: '3deg' }],
    },
    stampInner: {
        width: 48,
        height: 58,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(255,255,255,0.55)',
        borderRadius: 4,
    },
    stampDay: {
        alignSelf: 'center',
        textAlign: 'center',
        fontFamily: 'Fraunces_400Regular',
        fontSize: 19,
        lineHeight: 22,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    stampMonth: {
        alignSelf: 'center',
        textAlign: 'center',
        fontFamily: 'Inter_500Medium',
        fontSize: 8,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop: 2,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    footerText: {
        fontFamily: 'Fraunces_400Regular',
        fontSize: 13,
        fontStyle: 'italic',
    },
});

export default LetterReplyCard;
