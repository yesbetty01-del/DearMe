
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { Stack } from "expo-router";
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useAuth } from '@clerk/expo';
import useTheme from '../store/useTheme';
import { hydrateLetterStore, useLetterStore } from '../store/letterStore';
import { hydrateJournalStore, useJournalsReady } from '../store/journalStore';
import { getItems, initializeDataLayer } from '../utils/storage';
import LoadingScreen from '../components/loadingScreen';
import AppLockGate from '../components/appLockGate';
import { setConvexTokenProvider } from '../utils/convexAuth';
import { setSyncHandler, syncNow } from '../utils/syncQueue';
import { syncLocalData } from '../utils/convexRecords';
import {
    useFonts,
    Fraunces_300Light,
    Fraunces_400Regular,
    Fraunces_500Medium,
} from '@expo-google-fonts/fraunces';
import {
    Inter_300Light, 
    Inter_400Regular, 
    Inter_500Medium,
} from '@expo-google-fonts/inter';

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function Layout() {
    if (!clerkPublishableKey) return <AppLayout />;
    return (
        <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
            <AppLayout />
        </ClerkProvider>
    );
}

function AppLayout() {
    const { colors } = useTheme();
    const refreshArrivals = useLetterStore((state) => state.refreshArrivals);
    const lettersReady = useLetterStore((state) => state.isReady);
    const journalsReady = useJournalsReady();
    const [storageReady, setStorageReady] = useState(false);
    const [storageError, setStorageError] = useState(null);

    useEffect(() => {
        let active = true;
        initializeDataLayer()
            .then(() => Promise.all([hydrateJournalStore(), hydrateLetterStore()]))
            .then(() => {
                if (active) setStorageReady(true);
            })
            .catch((error) => {
                console.error('Could not initialize local data:', error);
                if (active) setStorageError('DearMe could not open your local journal data. Please restart the app.');
            });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!storageReady || !lettersReady || !journalsReady) return undefined;
        refreshArrivals();
        const interval = setInterval(refreshArrivals, 60 * 1000);
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') refreshArrivals();
        });
        return () => {
            clearInterval(interval);
            subscription.remove();
        };
    }, [lettersReady, journalsReady, refreshArrivals, storageReady]);

    const [fontsLoaded] = useFonts({
        Fraunces_300Light,
        Fraunces_400Regular,
        Fraunces_500Medium,
        Inter_300Light, 
        Inter_400Regular, 
        Inter_500Medium,
    });

    if (!fontsLoaded || (!storageReady && !storageError)) {
        return <LoadingScreen />;
    }
    if (storageError) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.background }}>
            <Text style={{ color: colors.foreground, textAlign: 'center' }}>{storageError}</Text>
        </View>;
    }
    if (!lettersReady || !journalsReady) return <LoadingScreen />;
    return(
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
                <Stack screenOptions={{headerShown: false}}>
                    <Stack.Screen name='index'/>
                    <Stack.Screen name='onboarding'/>
                    <Stack.Screen name='(tabs)'/>
                    <Stack.Screen name='app-lock'/>
                    <Stack.Screen name='app-lock/setup'/>
                    <Stack.Screen name='about'/>
                </Stack>
                <AppLockGate />
                {clerkPublishableKey ? <AuthSyncBridge /> : null}
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    )
}

function AuthSyncBridge() {
    const { isLoaded, isSignedIn, userId, getToken } = useAuth({ treatPendingAsSignedOut: false });

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !userId) {
            setConvexTokenProvider(null);
            setSyncHandler(null);
            return undefined;
        }

        setConvexTokenProvider(getToken);
        setSyncHandler(() => syncLocalData(userId));

        let isActive = true;
        const syncWhenEnabledAndOnline = async () => {
            try {
                const savedSettings = await getItems('profileSettings');
                const settings = savedSettings ? JSON.parse(savedSettings) : {};
                if (!isActive || settings.autoSync !== true) return;

                const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
                if (!convexUrl) return;
                const response = await fetch(convexUrl, { method: 'HEAD' });
                if (!response.ok && response.status >= 500) return;
                await syncNow();
            } catch (error) {
                // Keep automatic sync quiet while offline; the next check retries.
            }
        };

        syncWhenEnabledAndOnline();
        const interval = setInterval(syncWhenEnabledAndOnline, 60 * 1000);
        const appStateSubscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') syncWhenEnabledAndOnline();
        });
        return () => {
            isActive = false;
            clearInterval(interval);
            appStateSubscription.remove();
            setConvexTokenProvider(null);
            setSyncHandler(null);
        };
    }, [getToken, isLoaded, isSignedIn, userId]);

    return null;
}
