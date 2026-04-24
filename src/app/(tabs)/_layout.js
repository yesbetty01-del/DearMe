import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import Foundation from '@expo/vector-icons/Foundation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
            <Tabs.Screen name='index' options={{
                title: 'Home',
                headerShown: false,
                tabBarIcon: () => <Foundation name="home" size={24} color='grey' />
            }}/>
            
            <Tabs.Screen name='profile' options={{
                title: 'Profile',
                headerShown: false,
                tabBarIcon: ()=> <MaterialIcons name="person" size={24} color="grey" />
            }}
            />
        </Tabs>
    )
}