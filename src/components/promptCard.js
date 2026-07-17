import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import Greeting from './greeting';
import Prompt from './prompt';
import useTheme from '../store/useTheme';
import Icon from './icon';

const PromptCard = () => {
    const { colors, fSize, spacing } = useTheme();
    return (
        <View style={{
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            borderRadius: spacing.sm
        }}>
            <Greeting />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs }}>
                <Prompt />
                <Pressable onPress={() => router.push('/write/journal')}>
                    <Icon name={'feather'} color={colors.primary} />
                </Pressable>
                
            </View>

        </View>
    );
}

const styles = StyleSheet.create({})

export default PromptCard;
