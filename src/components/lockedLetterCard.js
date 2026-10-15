import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import useTheme from '../store/useTheme';
import Icon from './icon';
import { getDeliveryDateKey } from '../store/letterStore';

const parseDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const LockedLetterCard = ({ letter }) => {
    const { colors, spacing } = useTheme();
    const now = new Date();
    const deliveryDateKey = getDeliveryDateKey(letter.deliveryDate);
    const arrives = deliveryDateKey
        ? new Date(`${deliveryDateKey}T00:00:00`)
        : parseDate(letter.deliveryDate);
    const sealed = parseDate(letter.writtenDate);
    const daysLeft = arrives
        ? Math.max(0, Math.ceil((new Date(arrives.toDateString()) - new Date(now.toDateString())) / 86400000))
        : 0;
    const totalDays = arrives && sealed
        ? Math.max(1, Math.ceil((arrives - sealed) / 86400000))
        : 1;
    const elapsedDays = sealed ? Math.max(0, Math.ceil((now - sealed) / 86400000)) : 0;
    const progress = Math.min(1, elapsedDays / totalDays);
    const styles = createStyles(colors, spacing);

    return (
        <Pressable onPress={() => router.push(`/letter/${letter.id}`)} style={styles.card}>
            <View style={styles.topRow}>
                <View style={styles.sealedPill}>
                    <Icon name="lock" color={colors.mutedForeground} size={12} />
                    <Text style={styles.sealedText}>SEALED</Text>
                </View>
            </View>
            <View>
                <Text style={styles.title}>{letter.title}</Text>
                <View style={styles.stats}>
                    <View style={styles.statCell}>
                        <Text style={styles.statLabel}>OPENS IN</Text>
                        <Text style={styles.days}>
                            {daysLeft}
                            <Text style={styles.dayUnit}>
                                {' '}{daysLeft === 1 ? 'day' : 'days'}
                            </Text>
                        </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statCell}>
                        <Text style={styles.statLabel}>ARRIVES</Text>
                        <Text style={styles.arrival}>
                            {arrives
                                ? arrives.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })
                                : letter.deliveryDate}
                        </Text>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

const createStyles = (colors, spacing) => StyleSheet.create({
    card: {
        minHeight: 190,
        justifyContent: 'space-between',
        borderRadius: spacing.md,
        overflow: 'hidden',
        marginTop: spacing.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sealedPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.scheduledBag,
        backgroundColor: colors.scheduledBag,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    sealedText: {
        fontFamily: 'Inter_500Medium',
        color: colors.mutedForeground,
        fontSize: 9,
        letterSpacing: 1.2,
    },
    title: {
        fontFamily: 'Fraunces_400Regular',
        fontSize: 20,
        lineHeight: 26,
        color: colors.foreground,
        marginBottom: spacing.md,
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'stretch',
        borderRadius: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    statCell: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    statDivider: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
    },
    statLabel: {
        fontFamily: 'Inter_500Medium',
        color: colors.mutedForeground,
        fontSize: 9,
        letterSpacing: 1.2,
    },
    days: {
        fontFamily: 'Fraunces_400Regular',
        color: colors.foreground,
        fontSize: 23,
        marginTop: 3,
    },
    dayUnit: {
        fontFamily: 'Inter_400Regular',
        fontSize: 10,
        color: colors.mutedForeground,
    },
    arrival: {
        fontFamily: 'Fraunces_400Regular',
        color: colors.foreground,
        fontSize: 12,
        marginTop: 5,
    },
    progressTrack: {
        height: 3,
        borderRadius: 2,
        backgroundColor: colors.border,
        marginTop: 7,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
        backgroundColor: colors.primary,
    },
});

export default LockedLetterCard;
