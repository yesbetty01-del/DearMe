
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function Layout() {
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