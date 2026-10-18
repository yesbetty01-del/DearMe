import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import useTheme from '../../store/useTheme';
import Icon from '../icon';

const EmptyJournalCard = () => {
    const { colors, spacing } = useTheme();
    const styles = createStyles(colors, spacing);

    return (
        <View style={styles.card}>
            <View style={styles.iconWrap}>
                <Icon name="feather" color={colors.primary} size={22} />
            </View>
            <Text style={styles.title}>A little space for you</Text>
            <Text style={styles.message}>Your thoughts, moments, and little wins can all begin here.</Text>
            <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/write/journal')}
                style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            >
                <Icon name="plus" color={colors.onPrimary} size={16} />
                <Text style={styles.buttonLabel}>Write your first entry</Text>
            </Pressable>
        </View>
    );
};

const createStyles = (colors, spacing) => StyleSheet.create({
    card: {
        alignItems: 'center',
        marginTop: spacing.xl,
        padding: spacing.xl,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.border,
        borderRadius: spacing.md,
        backgroundColor: colors.surface,
    },
    iconWrap: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondary,
    },
    title: {
        marginTop: spacing.md,
        color: colors.foreground,
        fontFamily: 'Fraunces_400Regular',
        fontSize: 20,
        textAlign: 'center',
    },
    message: {
        maxWidth: 280,
        marginTop: spacing.xs,
        color: colors.mutedForeground,
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
    },
    button: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderRadius: 22,
        backgroundColor: colors.primary,
    },
    buttonLabel: { color: colors.onPrimary, fontFamily: 'Inter_500Medium', fontSize: 12 },
    pressed: { opacity: 0.78 },
});

export default EmptyJournalCard;
