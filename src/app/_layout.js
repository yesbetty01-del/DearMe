import ThemeProvider from "../contexts/themeContext";
import ProfileProvider from "../contexts/profileContext";
import { Stack } from "expo-router";

export default function Layout() {
    return(
        <ThemeProvider>
            <ProfileProvider>
                <Stack screenOptions={{headerShown: false}}>
                    <Stack.Screen name='index'/>
                    <Stack.Screen name='onboarding'/>
                    <Stack.Screen name='(tabs)'/>
                </Stack>    
            </ProfileProvider> 
        </ThemeProvider>
    )
}