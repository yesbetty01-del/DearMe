import { Tabs } from 'expo-router';
import TabBar from '../../components/navigation/tabBar';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import useTheme from '../../store/useTheme'
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
import { View } from 'react-native';

export default function Layout() {
    const { colors } = useTheme();

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
        <>
        <StatusBar style={colors.statusBarStyle} />
        <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}>
            <Tabs.Screen name='index' />
            <Tabs.Screen name='journal' />
            <Tabs.Screen name='letters' />
            <Tabs.Screen name='profile' />

        </Tabs>
        </>
    )
}