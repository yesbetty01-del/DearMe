import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Icon from '../icon';
import useTheme from '../../store/useTheme';

const Toolbar = () => {
    const { colors, spacing } = useTheme();
    const styles = createStyles(colors, spacing);
    return (
        <View style={styles.container}>
            <Pressable style={styles.iconButton}>
                <Icon name={'bold'} />
            </Pressable>
            <Pressable style={styles.iconButton}>
                <Icon name={'italic'} />
            </Pressable>
            <Pressable style={styles.iconButton}>
                <Icon name={'image'} />
            </Pressable>
            <Pressable style={styles.iconButton}>
                <Icon name={'camera'} />
            </Pressable>
            <Pressable style={styles.iconButton}>
                <Icon name={'mic'} />
            </Pressable>
        </View>
    );
}

const createStyles = (colors, spacing) => StyleSheet.create({
    container: {
        borderWidth: 0.7,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        flexDirection: 'row',
        paddingVertical: spacing.lg
    },
    iconButton: {
        color: colors.mutedForeground,
    }
})

export default Toolbar;
