import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/themeContext';
import { useFonts } from '@expo-google-fonts/inter/useFonts';
import { PlayfairDisplay_500Medium_Italic } from '@expo-google-fonts/playfair-display/500Medium_Italic';
import { Inter_300Light } from '@expo-google-fonts/inter/300Light';
import Onboarding from 'react-native-onboarding-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { setItems } from '../utils/storage';
import { useRouter } from 'expo-router';

export default function OnBoarding() {
    const {theme} = useTheme();
    const router = useRouter();

    let [fontsLoaded] = useFonts({
        PlayfairDisplay_500Medium_Italic,
        Inter_300Light, 
    });
    if(!fontsLoaded) return null;

    const handleDone = async() =>{
        try {
            await setItems ("onboardingCompleted", "true");
            console.log("Onboarding status set to true");
            router.replace('/(tabs)');
        }
        catch(error) {
            console.error("Error setting onboarding status:", error);
        };
    }

    return(
        <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
            <Onboarding
                onDone={handleDone}
                pages={[
                    {
                        backgroundColor: theme.background,
                        image:
                            <Image
                            source={require('../../assets/onboarding1.png')}
                            style={styles.image} 
                        />,
                        title: (
                            <Text style={[styles.headline, {color: theme.primary}]}>
                                Write to Your Future Self
                            </Text>
                        ),
                        subtitle: (
                            <ScrollView>
                                <Text style={[styles.description, {color: theme.secondary}]}>
                                    Capture your current thoughts, dreams, and feelings. Send them to youself weeks, months, or years from now.
                                </Text>
                            </ScrollView>
                        ),
                    },
                    {
                        backgroundColor: theme.background,
                        image: (
                            <View>
                                <View style={styles.title}>
                                    <MaterialIcons name="auto-stories" size={24} color={theme.primary} />
                                    <Text style={[ styles.titleText, {color: theme.primary}]}> DearMe</Text>
                                </View>
                                <Image
                                source={require('../../assets/onboarding2.png')}
                                style={styles.image}
                                />
                            </View>
                        ),
                            title: (
                                <Text style={[styles.headline, {color: theme.primary}]}>
                                    Reflect and Reply
                                </Text>
                            ),
                            subtitle: (
                                <ScrollView>
                                    <Text style={[styles.description, {color: theme.secondary}]}>
                                        Recieve your past letters when the time is right,
                                        and write back to reflect on how far you've come.
                                        Keep a daily journal in between.
                                    </Text>
                                </ScrollView>
                            )
                    },
                    {
                        backgroundColor: theme.background,
                        image: (
                            <View>
                                <View style={styles.title}>
                                    <MaterialIcons name="auto-stories" size={24} color={theme.primary} />
                                    <Text style={[styles.titleText, {color: theme.primary}]}> DearMe</Text>
                                </View>
                                <Image
                                source={require('../../assets/onboarding3.png')}
                                style={styles.image}
                                />
                            </View>
                        ),
                        title: (
                            <Text style={[styles.headline, {color: theme.primary}]}>
                                Your Private Sanctuary
                            </Text>
                        ),
                        subtitle: (
                            <ScrollView>
                                <Text style={[styles.description, {color: theme.secondary}]}>
                                    Your letters and journals are stored safely on your device.
                                    No internet required, just you and your thoughts.
                                </Text>
                            </ScrollView>
                        )
                    }
                ]}
            />
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    titleText: {
        fontSize: 20,
        fontStyle: 'italic'
    },
    image: {
        borderRadius: 30,
        elevation: 0.5,
        width: 320,
        height: 400
    },
    headline: {
        fontSize: 32,
        paddingHorizontal: 30,
        textAlign: 'center',
        fontFamily: 'PlayfairDisplay_500Medium_Italic'
    },
    description: {
        textAlign: 'center',
        paddingTop: 25,
        paddingHorizontal: 30,
        fontSize: 18, 
        fontFamily: 'Inter_300Light',
        lineHeight: 25
    },
})