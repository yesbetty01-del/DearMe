import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { SignIn } from '@clerk/expo/web';
import { router } from 'expo-router';
import useTheme from '../store/useTheme';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function Account() {
    if (!publishableKey) return <AccountSetupNotice />;

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <SignIn />
        </View>
    );
}

function AccountSetupNotice() {
    const { colors, spacing } = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.background }}>
            <Text style={{ color: colors.foreground, fontSize: 22, textAlign: 'center', fontFamily: 'Fraunces_400Regular' }}>
                Accounts are not configured yet
            </Text>
            <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: spacing.md }}>
                Your writing is saved on this device. Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to enable account sync.
            </Text>
            <Pressable onPress={() => router.back()} style={{ marginTop: spacing.xl, alignSelf: 'center' }}>
                <Text style={{ color: colors.primary }}>Go back</Text>
            </Pressable>
        </SafeAreaView>
    );
}
