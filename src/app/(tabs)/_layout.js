import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useTheme from '../../store/useTheme'
import {
    useFonts,
    Fraunces_400Regular,
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
        Inter_300Light, 
        Inter_400Regular, 
        Inter_500Medium,
    });

    if (!fontsLoaded) {
        return null;
    }

    return(
        <Tabs screenOptions={{
            tabBarStyle:{
                backgroundColor: colors.surface,
                borderTopWidth: 0,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.mutedForeground,
        }}>
            <Tabs.Screen name='index' options={{
                title: 'Home',
                headerShown: false,
                tabBarIcon: ({color, focused}) => (
                    <Feather name="book" size={22} color={color} />
                ),
            }}/>
            
            <Tabs.Screen name='journal' options={{
                title: 'Journal',
                headerShown: false,
                tabBarIcon: ({color, focused}) => (
                    <Feather name="book-open" size={22} color={color} />
                ),
            }}/>

            <Tabs.Screen name='write' options={{
                title: 'Write',
                headerShown: false,
                tabBarIcon: ({color, focused}) => (
                    <View style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: colors.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 15,
                    }}>
                        <Feather name='edit-3' size={22} color={colors.onPrimary} />
                    </View>
                ),
            }}/>

            <Tabs.Screen name='letters' options={{
                title: 'Letters',
                headerShown: false,
                tabBarIcon: ({color}) => (
                    <Feather name="mail" size={22} color={color} />
                ),
            }}/>

            <Tabs.Screen name='profile' options={{
                title: 'Profile',
                headerShown: false,
                tabBarIcon: ({color}) => (
                    <Feather name="user" size={22} color={color} />
                ),
            }}/>

        </Tabs>
    )
}