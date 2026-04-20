import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import Foundation from '@expo/vector-icons/Foundation';
export default function Layout() {
    const theme = useTheme();
    return(
        <Tabs screenOptions={{
            tabBarStyle:{
                backgroundColor: 'white',
                setOffset: 0,
                borderTopWidth: 0,
            },
        }}>
            <Tabs.Screen name='Home' options={{
                headerShown: false,
                tabBarIcon: () => <Foundation name="home" size={24} color='grey' />
            }}/>
        </Tabs>
    )
}