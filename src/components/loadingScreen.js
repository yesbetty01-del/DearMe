import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import useTheme from '../store/useTheme';

const LoadingScreen = () => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
                Getting things ready...
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    label: {
        fontSize: 13,
    },
});

export default LoadingScreen;
