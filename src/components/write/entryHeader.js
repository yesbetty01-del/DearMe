import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import useTheme from '../../store/useTheme';
import Icon from '../icon';
import ConfirmationDialog from '../confirmationDialog';

const EntryHeader = ({ title, saveTitle, onPress, active, hasEntry = active }) => {
    const { colors, spacing, fSize } = useTheme();
    const [confirmLeave, setConfirmLeave] = useState(false);
    return (
        <>
            <View style={[styles.container, { paddingHorizontal: spacing.lg }]}>
                <Pressable
                    onPress={() => {
                        if (hasEntry) setConfirmLeave(true);
                        else router.back();
                    }}
                    style={{ gap: spacing.xs, flexDirection: 'row', alignItems: 'center' }}
                >
                    <Icon name="chevron-left" />
                    <Text style={{ fontFamily: 'Inter_500Medium', color: colors.mutedForeground }}>
                        Back
                    </Text>
                </Pressable>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: fSize.secondary, color: colors.mutedForeground, letterSpacing: 1.2 }}>
                    {title}
                </Text>
                <Pressable
                    disabled={!active}
                    style={{
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderRadius: spacing.xl,
                        backgroundColor: active ? colors.primary : colors.accent,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={onPress}
                >
                    <Text style={{ color: colors.onPrimary }}> {saveTitle} </Text>
                </Pressable>
            </View>
            <ConfirmationDialog
                visible={confirmLeave}
                title="Leave writing screen?"
                message="Your unsaved changes will be lost."
                confirmLabel="Leave"
                icon="arrow-left"
                confirmColor={colors.warning}
                onCancel={() => setConfirmLeave(false)}
                onConfirm={() => { setConfirmLeave(false); router.back(); }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
})

export default EntryHeader;
