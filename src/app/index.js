import { StyleSheet, View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFonts } from '@expo-google-fonts/inter/useFonts';
import { PlayfairDisplay_500Medium_Italic } from '@expo-google-fonts/playfair-display/500Medium_Italic';
import { Inter_300Light } from '@expo-google-fonts/inter/300Light';
import {useTheme} from '../contexts/themeContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getItems } from '../utils/storage';

export default function Splash(){

    const {theme} = useTheme();
    const router = useRouter();
    const [isTimeup, setIsTimeup] = useState(false);

    let [fontsLoaded] = useFonts({
        PlayfairDisplay_500Medium_Italic,
        Inter_300Light, 
    });

    const [showOnboarding, setShowOnboarding] = useState(true);

    const checkOnboardingStatus = async () =>{
        try {
            const onboardingCompleted = await getItems("onboardingCompleted");
            setShowOnboarding(onboardingCompleted != "true");
        }
        catch (error) {
            console.error("Error checking onboarding status:", error);
        }
    }

    useEffect(()=> {
        checkOnboardingStatus();
        const timer = setTimeout(()=> setIsTimeup(true), 3000);
        return() => clearTimeout(timer);
        
    }, []);

    useEffect(()=> {
        if(isTimeup && fontsLoaded){
            if(showOnboarding)
                router.replace('/onboarding');
            else
                router.replace('/(tabs)');
        }
    }, [isTimeup, fontsLoaded, showOnboarding])
    
    if(!fontsLoaded) return null;

    return(
        <View style={[styles.container, {backgroundColor: theme.background}]}>
            <View style={styles.topContainer}>
                <View style={{flex:1}}/>

                <View style={styles.iconContainer}>
                    <Ionicons name="mail" size={45} color="#DBDDD7" />
                    <View style={styles.topIcon}>
                        <MaterialIcons name="eco" size={50} color="#72604D" />
                    </View>
                </View>

                <Text style={[styles.title, {color: theme.primary}]}>
                    DearMe
                </Text>
                <Text style={[styles.subtitle, {color: theme.text}]}>
                    THE LIVING ARCHIVE
                </Text>
                
                <View style={styles.dots}>
                    <Text style={[styles.dot, {color: theme.text}]}>...</Text>
                </View>
           
            </View>
            <View style={styles.description}>
                <Text style={[styles.descriptionText, {color: theme.text}]}>
                    "Writing to the vesion of you that hasn't arrived yet."
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    topContainer: {
        flex:1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconContainer: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    topIcon: {
        position: 'absolute',
        flex: 1,
        top: 5
    },
    title: {
        fontSize: 55,
        marginTop: 40,
        fontFamily: 'PlayfairDisplay_500Medium_Italic'
    },
    subtitle: {
        marginTop: 5,
        fontSize: 11,
        fontFamily: 'monospace'
    },
    dots: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    dot: {
        fontSize: 50
    },
    description: {
        padding: 35,
        paddingBottom: 50
    },
    descriptionText: {
        textAlign: 'center',
        fontSize: 18,
        fontFamily: 'PlayfairDisplay_500Medium_Italic'
    }
})
