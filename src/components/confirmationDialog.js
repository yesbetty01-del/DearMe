import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import useTheme from '../store/useTheme';
import Icon from './icon';

const ConfirmationDialog = ({
    visible,
    title,
    message,
    confirmLabel = 'Confirm',
    icon = 'alert-circle',
    confirmColor,
    onCancel,
    onConfirm,
}) => {
    const { colors, spacing, fSize } = useTheme();
    const actionColor = confirmColor || colors.primary;
    const actionTextColor = actionColor === colors.destructive ? colors.destructiveFg : colors.onPrimary;
    const styles = createStyles(colors, spacing, fSize, actionColor, actionTextColor);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <View style={styles.iconWrap}>
                        <Icon name={icon} color={confirmColor || colors.primary} size={20} />
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.actions}>
                        <Pressable
                            accessibilityRole="button"
                            onPress={onCancel}
                            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            onPress={onConfirm}
                            style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
                        >
                            <Text style={styles.confirmText}>{confirmLabel}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const createStyles = (colors, spacing, fSize, confirmColor, confirmTextColor) => StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.overlay,
    },
    dialog: {
        width: '100%',
        maxWidth: 360,
        padding: spacing.xl,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        color: colors.foreground,
        fontFamily: 'Fraunces_400Regular',
        fontSize: fSize.cardTitle,
        textAlign: 'center',
    },
    message: {
        color: colors.mutedForeground,
        fontSize: fSize.secondary,
        lineHeight: fSize.secondary * 1.5,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    actions: {
        width: '100%',
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.xl,
    },
    cancelButton: {
        flex: 1,
        minHeight: 46,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    cancelText: { color: colors.foreground, fontFamily: 'Inter_500Medium', fontSize: fSize.secondary },
    confirmButton: {
        flex: 1,
        minHeight: 46,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        backgroundColor: confirmColor,
    },
    confirmText: { color: confirmTextColor, fontFamily: 'Inter_500Medium', fontSize: fSize.secondary },
    pressed: { opacity: 0.78 },
});

export default ConfirmationDialog;
