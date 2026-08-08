import { Tabs } from 'expo-router';
import TabBar from '../../components/navigation/tabBar';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import useTheme from '../../store/useTheme'
import { View } from 'react-native';

export default function Layout() {
    const { colors } = useTheme();

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