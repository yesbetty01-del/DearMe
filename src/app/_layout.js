
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import useTheme from '../store/useTheme';
import { useLetterStore } from '../store/letterStore';
import {
    useFonts,
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

    useEffect(() => {
        refreshArrivals();
        const interval = setInterval(refreshArrivals, 60 * 1000);
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') refreshArrivals();
        });
        return () => {
            clearInterval(interval);
            subscription.remove();
        };
    }, [refreshArrivals]);

    const [fontsLoaded] = useFonts({
        Fraunces_400Regular,
        Fraunces_500Medium,
        Inter_300Light, 
        Inter_400Regular, 
        Inter_500Medium,
    });

    if (!fontsLoaded) {
        return null;
    }
    return(
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
                <Stack screenOptions={{headerShown: false}}>
                    {/* <Stack.Screen name='index'/>
                    <Stack.Screen name='onboarding'/> */}
                    <Stack.Screen name='(tabs)'/>
                </Stack>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    )
}
