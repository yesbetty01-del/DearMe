import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/themeContext';
import { useFonts } from '@expo-google-fonts/inter/useFonts';
import { PlayfairDisplay_500Medium_Italic } from '@expo-google-fonts/playfair-display/500Medium_Italic';
import { Inter_300Light } from '@expo-google-fonts/inter/300Light';
import Feather from '@expo/vector-icons/Feather';

export default function Onboarding() {
    const {theme} = useTheme();

    let [fontsLoaded] = useFonts({
        PlayfairDisplay_500Medium_Italic,
        Inter_300Light, 
    });
    if(!fontsLoaded) return null;

    return(
        <View style={[styles.container, {backgroundColor: theme.background}]}>
            <TouchableOpacity style={styles.skipButton}>
                <Text style={{color: theme.secondary}}>SKIP</Text>
            </TouchableOpacity>
            
            <Image
                source={require('../../assets/onboarding1.png')}
                style={styles.image} 
            />
            <Text style={[styles.headline, {color: theme.primary}]}>
                Write to Your Future Self
            </Text>
            <Text style={[styles.description, {color: theme.secondary}]}>
                Capture your current thoughts, dreams, and feelings. Send them to youself weeks, months, or years from now.
            </Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 'auto'}}>
                <View style={styles.dots}>
                  <View style={[styles.pageDot, {backgroundColor: theme.primary, width: 25}]} />
                  <View style={[styles.pageDot, {backgroundColor: theme.text, opacity: 0.5}]} />
                  <View style={[styles.pageDot, {backgroundColor: theme.text, opacity: 0.5}]}/>
                </View>
            
                <TouchableOpacity style={[styles.fabButton, {backgroundColor: theme.primary}]}>
                    <Text style={styles.fabText}>Next </Text>
                    <Feather name="arrow-right" size={18} color="white" />
                </TouchableOpacity>
            </View>
            
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30
    },
    skipButton: {
        alignSelf: 'flex-end',
    },
    image: {
        borderRadius: 30,
        elevation: 0.5,
        width: 320,
        height: 400,
        marginTop: 45,
        marginBottom: 'auto'
    },
    headline: {
        fontSize: 32,
        marginTop: 'auto',
        textAlign: 'center',
        fontFamily: 'PlayfairDisplay_500Medium_Italic'
    },
    description: {
        textAlign: 'center',
        paddingTop: 25,
        fontSize: 18, 
        fontFamily: 'Inter_300Light',
        lineHeight: 25
    },
    dots: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    pageDot: {
        height: 6,
        width: 6,
        borderRadius: 3,
        marginHorizontal: 5,
    },
    fabButton: {
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 35,
        borderRadius: 30,
        flexDirection: 'row'
    },
    fabText: {
        color: 'white',
        fontSize: 16
    }
})