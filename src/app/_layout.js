import ThemeProvider from "../contexts/themeContext";
import { Stack } from "expo-router";

export default function Layout() {
    return(
        <ThemeProvider>
            <Stack screenOptions={{headerShown: false}}>
                <Stack.Screen name='index'/>
                <Stack.Screen name='onboarding'/>
                <Stack.Screen name='(tabs)'/>
            </Stack>
        </ThemeProvider>
    )
}