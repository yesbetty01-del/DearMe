import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from 'react';
import { useTheme } from '../../contexts/themeContext';
import { useProfile } from '../../contexts/profileContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TextInput } from 'react-native-paper';
import { useFonts } from '@expo-google-fonts/inter/useFonts';
import { CormorantGaramond_600SemiBold_Italic } from '@expo-google-fonts/cormorant-garamond/600SemiBold_Italic';
import { PlayfairDisplay_500Medium_Italic } from '@expo-google-fonts/playfair-display/500Medium_Italic';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';

export default function profile (){
    const {theme} = useTheme();
    const { name, setName } = useProfile();

    const [isEnabled, setIsEnabled] = useState(false);
    const [editing, setEditing] = useState(false);
    const toggleSwitch = () => setIsEnabled(previous => !previous);



    let [fontsLoaded] = useFonts({
         CormorantGaramond_600SemiBold_Italic,
         PlayfairDisplay_500Medium_Italic,
         Inter_500Medium
    });
    
    if(!fontsLoaded) return null;
    

    return(
        <SafeAreaView style={{flex: 1, backgroundColor: theme.background}}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.titleText, {color: theme.primary}]}>DearMe</Text>
                <View style={styles.profile}>

                    <Pressable
                        style={[styles.editIcon,{backgroundColor: theme.primary}]}
                        onPress={()=> setEditing(true)}
                    >
                        <MaterialIcons name="edit" size={18} color="white" />
                    </Pressable>

                </View>
                
                {editing ? (
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        onBlur={()=> setEditing(false)}
                    />
                ):(
                    <Text style={styles.name}>{name ? name : "Enter your Name"}</Text>
                )}
            
                <Text style={{color: theme.secondary, textAlign: 'center', fontSize: 16}}>
                    Preserving quite moments for a future version of myself.
                </Text> 

                <View style={styles.records}>
                    <View style={[styles.recordCard, {backgroundColor: theme. card1}]}>
                        <Text style={[styles.recordText, {color: theme.text}]}>LETTERS SENT</Text>
                    </View>
                    <View style={[styles.recordCard, {backgroundColor: theme. card1}]}>
                        <Text style={[styles.recordText, {color: theme.text}]}>JOURNALS WRITTEN</Text>
                    </View>
                </View>

            </ScrollView>
            
        </SafeAreaView>
    )
}
const styles = StyleSheet.create ({
    container: {
        flexGrow: 1,
        paddingHorizontal: 25,
        alignItems: 'center'
    },
    titleText: {
        fontSize: 20,
        fontFamily: 'PlayfairDisplay_500Medium_Italic'
    },
    profile: {
        height: 90,
        width: 90,
        borderRadius: 45,
        borderWidth: 1,
        marginTop: 30,
        //position: 'relative'
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 20,
    },
    input: {
        marginTop: 24,
        borderBottomWidth: 0,
        borderColor: 'transparent',
        width: 200,
        textAlign: 'center',
        fontSize: 18,
        backgroundColor: 'transparent',
        marginBottom: 10
    },
    name: {
        marginTop: 30,
        fontSize: 35,
        fontFamily: 'CormorantGaramond_600SemiBold_Italic',
        marginBottom: 10
    },
    records: {
        flexDirection: 'row',
        //padding: 25,
        marginTop: 30
    },
    recordCard: {
        height: 100,
        width: 150,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10
    },
    recordText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 11
    }
})