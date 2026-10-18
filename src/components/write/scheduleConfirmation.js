import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import useTheme from '../../store/useTheme';
import Icon from '../icon';

const ScheduleConfirmation = ({ visible, onClose, onSeal, onSealed }) => {
    const { colors, spacing, fSize } = useTheme();
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const sealLetter = async () => {
        setSaving(true);
        setSaveError('');
        try {
            await onSeal();
            onClose();
            onSealed();
        } catch (error) {
            setSaveError(error?.message || 'We could not save this letter. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={saving ? () => {} : onClose}
        >
            <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
                <View style={[styles.modal, { backgroundColor: colors.surface }]}>
                    <View style={{ backgroundColor: colors.accent, padding: spacing.md, borderRadius: 9999 }}>
                        <Icon name="lock" color={colors.primaryHover} />
                    </View>
                    <Text style={{ fontFamily: 'Fraunces_500Medium', fontSize: fSize.body, color: colors.foreground, marginTop: spacing.md }}>
                        Seal this letter?
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: fSize.secondary, marginTop: spacing.md, color: colors.mutedForeground, textAlign: 'center' }}>
                        Once sealed, you won't be able to read or edit this letter until the arrival date.
                    </Text>
                    {saveError ? <Text style={{ color: colors.primary, marginTop: spacing.sm, textAlign: 'center' }}>{saveError}</Text> : null}
                    <Pressable
                        style={{ marginTop: spacing.xl, backgroundColor: colors.primary, paddingVertical: spacing.sm, width: '100%', alignItems: 'center', borderRadius: spacing.lg, opacity: saving ? 0.7 : 1 }}
                        onPress={sealLetter}
                        disabled={saving}
                    >
                        <Text style={{ color: colors.onPrimary }}>{saving ? 'Saving letter...' : 'Seal Letter'}</Text>
                    </Pressable>
                    <Pressable style={{ marginTop: spacing.md }} onPress={onClose} disabled={saving}>
                        <Text style={{ color: colors.mutedForeground }}>Keep editing</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modal: { alignItems: 'center', width: '85%', padding: 24, borderRadius: 12 },
});

export default ScheduleConfirmation;
