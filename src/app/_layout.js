
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { Stack } from "expo-router";
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import useTheme from '../store/useTheme';
import { hydrateLetterStore, useLetterStore } from '../store/letterStore';
import { hydrateJournalStore } from '../store/journalStore';
import { initializeDataLayer } from '../utils/storage';
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

export default function Layout() {
    const { colors } = useTheme();
    const refreshArrivals = useLetterStore((state) => state.refreshArrivals);
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
        if (!storageReady) return undefined;
        refreshArrivals();
        const interval = setInterval(refreshArrivals, 60 * 1000);
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') refreshArrivals();
        });
        return () => {
            clearInterval(interval);
            subscription.remove();
        };
    }, [refreshArrivals, storageReady]);

    const [fontsLoaded] = useFonts({
        Fraunces_300Light,
        Fraunces_400Regular,
        Fraunces_500Medium,
        Inter_300Light, 
        Inter_400Regular, 
        Inter_500Medium,
    });

    if (!fontsLoaded || (!storageReady && !storageError)) {
        return null;
    }
    if (storageError) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.background }}>
            <Text style={{ color: colors.foreground, textAlign: 'center' }}>{storageError}</Text>
        </View>;
    }
    return(
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
                <Stack screenOptions={{headerShown: false}}>
                    <Stack.Screen name='index'/>
                    <Stack.Screen name='onboarding'/>
                    <Stack.Screen name='(tabs)'/>
                </Stack>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    )
}
