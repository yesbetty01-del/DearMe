import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import useTheme from '../store/useTheme';
import Icon from './icon';
import { getDeliveryDateKey } from '../store/letterStore';
import { parseCalendarDate } from '../utils/date';

const LetterCard = ({ letter }) => {
    const { colors, fSize, spacing } = useTheme();
    const { id, title, status, content, deliveryDate, writtenDate, replies = [] } = letter;
    const deliveryDateKey = getDeliveryDateKey(deliveryDate);
    const arrives = deliveryDateKey ? new Date(`${deliveryDateKey}T00:00:00`) : null;
    const formattedDeliveryDate = arrives && !Number.isNaN(arrives.getTime())
        ? arrives.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
        : deliveryDate;
    const formattedWrittenDate = parseCalendarDate(writtenDate)?.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }) || '';
    const styles = createStyles(colors, fSize, spacing);

    return (
        <Pressable
            onPress={() => router.push(`letter/${id}`)}
            style={styles.card}
        >
            <View style={styles.statusRow}>
                <View style={[
                    styles.statusPill,
                    {
                        backgroundColor: status === 'scheduled'
                            ? colors.scheduledBag
                            : colors.deliveredBag,
                    },
                ]}>
                    <Icon
                        name={status === 'scheduled' ? 'lock' : 'mail-open'}
                        color={colors.mutedForeground}
                        size={12}
                    />
                    <Text style={styles.statusText}>
                        {status === 'scheduled' ? 'SEALED' : 'DELIVERED'}
                    </Text>
                </View>
            </View>

            <View>
                <Text style={styles.title}>{status === 'scheduled' ? 'Sealed letter' : title}</Text>
                {status === 'delivered' && (
                    <Text numberOfLines={2} style={styles.content}>
                        {content}
                    </Text>
                )}
            </View>

            <View style={styles.details}>
                <View style={styles.detailCell}>
                    <Text style={styles.detailLabel}>
                        {status === 'scheduled' ? 'ARRIVES' : 'ARRIVED'}
                    </Text>
                    <Text style={styles.detailValue}>{formattedDeliveryDate}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailCell}>
                    <Text style={styles.detailLabel}>WRITTEN</Text>
                    <Text style={styles.detailValue}>{formattedWrittenDate}</Text>
                </View>
            </View>

            {replies.length > 0 && (
                <Text style={styles.replies}>
                    {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </Text>
            )}
        </Pressable>
    );
};

const createStyles = (colors, fSize, spacing) => StyleSheet.create({
    card: {
        minHeight: 190,
        justifyContent: 'space-between',
        marginTop: spacing.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: spacing.md,
        backgroundColor: colors.surface,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 9,
        color: colors.mutedForeground,
        letterSpacing: 1.2,
    },
    title: {
        marginBottom: spacing.md,
        fontFamily: 'Fraunces_400Regular',
        fontSize: 20,
        lineHeight: 26,
        color: colors.foreground,
    },
    content: {
        fontFamily: 'Fraunces_400Regular',
        fontSize: fSize.secondary,
        color: colors.mutedForeground,
    },
    details: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: spacing.md,
        backgroundColor: colors.background,
    },
    detailCell: {
        flex: 1,
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    detailDivider: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
    },
    detailLabel: {
        fontFamily: 'Inter_500Medium',
        fontSize: fSize.caption,
        color: colors.mutedForeground,
        letterSpacing: 1.2,
    },
    detailValue: {
        fontFamily: 'Fraunces_400Regular',
        fontSize: fSize.secondary,
        color: colors.foreground,
    },
    replies: {
        marginTop: spacing.sm,
        fontFamily: 'Inter_500Medium',
        color: colors.primary,
    },
});

export default LetterCard;
