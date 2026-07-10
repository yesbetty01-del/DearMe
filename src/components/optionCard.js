import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import useTheme from '../store/useTheme';
import Icon from './icon';

const OptionCard = ({ name, label, description }) => {
    const { colors, spacing, fSize } = useTheme();
    const styles = CreateStyles(colors, spacing, fSize);
    return (
        <Pressable style={styles.container}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: spacing.md}}>
                <View style={styles.fab} >
                    <Icon name={name} color={colors.primary} />
                </View>
                <View>
                    <Text style={styles.label}> {label} </Text>
                    <Text style={styles.description}> {description} </Text>
                </View>
            </View>
        </Pressable>
    );
}

const CreateStyles = (colors, spacing, fSize) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: '100%',
        padding: spacing.md,
        backgroundColor: colors.onPrimary,
        borderRadius: spacing.md,
        borderWidth: 0.5,
        borderColor: colors.border
    },
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
})

export default OptionCard;
