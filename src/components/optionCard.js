import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import useTheme from '../store/useTheme';
import Icon from './icon';

const OptionCard = ({ name, label, description, onPress, disabled = false }) => {
    const { colors, spacing, fSize } = useTheme();
    const styles = CreateStyles(colors, spacing, fSize);
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${label}. ${description}`}
            accessibilityState={{ disabled }}
            disabled={disabled}
            style={({ pressed }) => [styles.container, pressed && styles.pressed, disabled && styles.disabled]}
            onPress={onPress}
        >
            <View style={styles.content}>
                <View style={styles.fab} >
                    <Icon name={name} color={colors.primary} />
                </View>
                <View style={styles.copy}>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.description}>{description}</Text>
                </View>
            </View>
        </Pressable>
    );
};

const CreateStyles = (colors, spacing, fSize) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: '100%',
        padding: spacing.md,
        backgroundColor: colors.onPrimary,
        borderRadius: spacing.md,
        borderWidth: 0.5,
        borderColor: colors.border,
    },
    content: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    copy: { flex: 1 },
    pressed: { opacity: 0.72 },
    disabled: { opacity: 0.55 },
    fab: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondary,
    },
    label: {
        fontFamily: 'Fraunces_400Regular',
        fontSize: fSize.body,
        color: colors.foreground,
    },
    description: {
        fontFamily: 'Inter_400Regular',
        fontSize: fSize.secondary,
        color: colors.mutedForeground,
    }
});

export default OptionCard;
