import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme'
import Date from '../../components/date';
import Header from '../../components/header';

const Index = () => {
    const { colors, spacing } = useTheme();
    const styles = createStyles(colors, spacing);
    return (
        <SafeAreaView style={styles.container}>
            <Date />
            <Header header={'DearMe'} />
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

export default Index;
