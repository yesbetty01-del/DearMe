import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import useTheme from '../store/useTheme';

const ConfirmationDialog = ({ visible, title, message, confirmLabel = 'Confirm', onCancel, onConfirm }) => {
    const { colors, spacing, fSize } = useTheme();

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, backgroundColor: colors.overlay }}>
                <View style={{ width: '100%', maxWidth: 360, padding: spacing.xl, borderRadius: spacing.lg, backgroundColor: colors.surface }}>
                    <Text style={{ color: colors.foreground, fontFamily: 'Inter_500Medium', fontSize: fSize.body }}>{title}</Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: fSize.secondary, lineHeight: fSize.secondary * 1.5, marginTop: spacing.md }}>{message}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.lg, marginTop: spacing.xl }}>
                        <Pressable accessibilityRole="button" onPress={onCancel} style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.xs }}>
                            <Text style={{ color: colors.primary, fontFamily: 'Inter_500Medium' }}>Cancel</Text>
                        </Pressable>
                        <Pressable accessibilityRole="button" onPress={onConfirm} style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.xs }}>
                            <Text style={{ color: colors.primary, fontFamily: 'Inter_500Medium' }}>{confirmLabel}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmationDialog;
