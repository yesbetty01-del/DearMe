import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import useTheme from '../../store/useTheme';
import Icon from '../icon';

const EntryHeader = ({ title, saveTitle, onPress, active }) => {
    const { colors, spacing, fSize } = useTheme();
    return (
        <View style={[styles.container, {paddingHorizontal: spacing.lg}]}>
            <Pressable
                onPress={() => router.back()}
                style={{gap: spacing.xs, flexDirection: 'row', alignItems: 'center'}}
            >
                <Icon name={'chevron-left'} />
                <Text style={{fontFamily: 'Inter_500Medium', color: colors.mutedForeground}}>
                    Back
                </Text>
            </Pressable>
            <Text style={{fontFamily: 'Inter_400Regular', fontSize: fSize.secondary, color: colors.mutedForeground, letterSpacing: 1.2}}>
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
                    justifyContent: 'center'
                }}
                onPress={onPress}
            >
                <Text style={{color: colors.onPrimary}}> {saveTitle} </Text>
            </Pressable>
        </View>
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
