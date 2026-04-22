import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/themeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from '@expo-google-fonts/inter/useFonts';
import { PlayfairDisplay_500Medium_Italic } from '@expo-google-fonts/playfair-display/500Medium_Italic';
import { Inter_300Light } from '@expo-google-fonts/inter/300Light';

export default function Home() {
    const {theme} = useTheme();

     let [fontsLoaded] = useFonts({
        PlayfairDisplay_500Medium_Italic,
        Inter_300Light, 
    });

    if(!fontsLoaded) return null;

    return(
        <SafeAreaView edges={['top']} style={[styles.container, {backgroundColor: theme.background}]}>
            <ScrollView style>
                <Text style={[styles.titleText, {color: theme.primary}]}>DearMe</Text>
                <View style={{alignItems: 'center'}}>
                    <View style={[styles.customCard, {backgroundColor: theme.card1, borderColor: theme.card1}]}>
                        <MaterialIcons name="auto-stories" size={24} color={theme.primary} />
                        <Text style={[styles.prompt, {color: theme.secondary}]}>
                            "If you were to write a letter to the version of yourself from
                            five years ago, what is the one secret you'd finally share?"
                        </Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <TouchableOpacity style={[styles.button, {backgroundColor: theme.primary}]}>
                                <Text style={{color:'white', fontWeight: '500'}}>Start Writing</Text>
                            </TouchableOpacity>
                            <Text style={{color: theme.text, fontStyle: 'italic'}}>DailyPrompt</Text>
                        </View>
                    </View>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Text style={{fontFamily: 'PlayfairDisplay_500Medium_Italic', fontSize: 20}}>
                        Recent Reflections
                    </Text>
                    <Text style={{color: theme.primary, fontWeight: '500'}}>
                        View Archive
                    </Text>
                </View>

                <View style={styles.entries}>
                    <Text>No entries</Text>
                </View>

                <View style={{alignItems: 'center'}}>
                    <View style={styles.upcomingLetter}>
                        <Text>No upcoming letter</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create ({
    container: {
        flex: 1,
        //alignItems: 'center',
        paddingHorizontal: 25
    },
    titleText: {
        fontSize: 20,
        alignSelf: 'center',
        fontFamily: 'PlayfairDisplay_500Medium_Italic'
    },
    customCard: {
        marginTop: 30,
        height: 350,
        borderWidth: 1,
        borderRadius: 20,
        justifyContent: 'space-between',
        padding: 25,
        elevation: 1,
        marginBottom: 50
    },
    prompt: {
        fontFamily: 'PlayfairDisplay_500Medium_Italic',
        lineHeight: 35,
        fontSize: 22
    },
    button: {
        padding: 15,
        borderRadius: 40
    },
    entries: {
        height: 300,
        width: 250,
        borderWidth: 1,
        marginTop: 30,
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'transparent',
        elevation: 1
    },
    upcomingLetter: {
        height: 100,
        width: 200,
        borderWidth: 1,
        margin: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center'
    }
})