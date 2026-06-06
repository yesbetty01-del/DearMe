import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme';

const Write = () => {
    const { colors, spacing } = useTheme();
    const styles = createStyles(colors, spacing);
    return (
        <SafeAreaView style={styles.container}>
           
        </SafeAreaView>
    );
}

const createStyles = (colors, spacing) => {
    return StyleSheet.create({
        container: {
            backgroundColor: colors.background,
            flex: 1,
            paddingHorizontal: spacing.xl,
        },
    });
};

export default Write;
