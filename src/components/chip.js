import React from 'react';
import { StyleSheet, Pressable, Text, View } from 'react-native';
import useTheme from '../store/useTheme';

const Chip = ({ label, selected, onPress }) => {
    const { colors, spacing, fSize } = useTheme();
    const styles = createStyles(colors, spacing, fSize);
    return (
        <View style={styles.container}>
        <Pressable
            onPress={onPress}
            style={[
                styles.chip,
                selected && styles.selectedChip,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    selected && styles.selectedText,
                ]}
            >
                {label}
            </Text>
        </Pressable>
        </View>
    );
}

const createStyles = (colors, spacing, fSize) => StyleSheet.create({
    container: {
        paddingVertical: spacing.lg
    },
    chip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: spacing.xl,
        borderColor: colors.border,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center'
    },
    selectedChip: {
        backgroundColor: colors.primary,
        borderColor: colors.primary
    },
    text: {
        fontFamily: 'Inter_500Medium',
        color: colors.mutedForeground,
        fontSize: fSize.caption,
    },
    selectedText: {
        color: colors.onPrimary
    }
})

export default Chip;
