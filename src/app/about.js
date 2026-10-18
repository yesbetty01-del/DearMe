import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import useTheme from '../store/useTheme';
import Icon from '../components/icon';

const About = () => {
    const { colors, spacing, fSize } = useTheme();
    const styles = createStyles(colors, spacing, fSize);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    onPress={() => router.back()}
                    style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
                >
                    <Icon name="arrow-left" color={colors.foreground} size={19} />
                </Pressable>
                <Text style={styles.headerTitle}>About DearMe</Text>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.content}>
                <View style={styles.iconWrap}>
                    <Icon name="heart" color={colors.primary} size={28} />
                </View>
                <Text style={styles.title}>A quiet space for you.</Text>
                <Text style={styles.description}>
                    DearMe is a private space to write to yourself, reflect on your days, and send letters to your future self.
                    Your words are saved on your device and stay with you.
                </Text>
                <Text style={styles.version}>Version {Constants.expoConfig?.version || '1.0.0'}</Text>
            </View>
        </SafeAreaView>
    );
};

const createStyles = (colors, spacing, fSize) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.sm,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerTitle: { color: colors.foreground, fontSize: fSize.secondary, fontFamily: 'Inter_500Medium' },
    headerSpacer: { width: 40 },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxxl,
    },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondary,
        marginBottom: spacing.lg,
    },
    title: {
        color: colors.foreground,
        fontFamily: 'Fraunces_400Regular',
        fontSize: fSize.screenTitle,
        textAlign: 'center',
    },
    description: {
        color: colors.mutedForeground,
        fontSize: fSize.secondary,
        lineHeight: fSize.secondary * 1.6,
        textAlign: 'center',
        marginTop: spacing.md,
    },
    version: { color: colors.mutedForeground, fontSize: 12, marginTop: spacing.xl },
    pressed: { opacity: 0.65 },
});

export default About;
