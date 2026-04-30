import { View, Text, StyleSheet, ScrollView, Switch, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from 'react';
import { useTheme } from '../../contexts/themeContext';
import { useProfile } from '../../contexts/profileContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { TextInput } from 'react-native-paper';
import { useFonts } from '@expo-google-fonts/inter/useFonts';
import { CormorantGaramond_600SemiBold_Italic } from '@expo-google-fonts/cormorant-garamond/600SemiBold_Italic';
import { PlayfairDisplay_500Medium_Italic } from '@expo-google-fonts/playfair-display/500Medium_Italic';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';

export default function profile (){
    const {theme} = useTheme();
    const { name, setName } = useProfile();

    const [notifyEnabled, setNotifyEnabled] = useState(true);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [editing, setEditing] = useState(false);

    const toggleNotify = () => setNotifyEnabled(prev => !prev);
    const toggleReminder = () => setReminderEnabled(prev => !prev);



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

                <View style={styles.settingsContainer}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <MaterialIcons name="auto-stories" size={24} color={theme.primary} />
                        <Text style={styles.settingTitle}> Future Delivery Alerts</Text>
                    </View>
                    <Text style={styles.settingSubtitle}>
                        Anniversary Surprises
                    </Text>
                    <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                        <View style={{flex: 1}}>
                            <Text style={[styles.settingText, {color: theme.secondary}]}>
                                Notify me when a 1-year-old letter arrives.
                            </Text>
                        </View>
                        <Switch
                            trackColor={{false: theme.text, true: theme.primary}}
                            thumbColor={notifyEnabled ? '#fff' : '#fff'}
                            onValueChange={toggleNotify}
                            value={notifyEnabled}
                        />
                    </View>
                    <Text style={styles.settingSubtitle}>
                        The 5-Years Reach
                    </Text>
                    <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                        <View style={{flex: 1}}>
                            <Text style={[styles.settingText, {color: theme.secondary}]}>
                                Quiet reminders for long-term time capsules.
                            </Text>
                        </View>
                        <Switch
                            trackColor={{false: theme.text, true: theme.primary}}
                            thumbColor={reminderEnabled ? '#fff' : '#fff'}
                            onValueChange={toggleReminder}
                            value={reminderEnabled}
                        />
                    </View>
                </View>

                <View style={styles.settingsContainer}>
                    <Text style={styles.settingTitle}>
                        Security & Privacy
                    </Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18}}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <MaterialIcons name="lock-open" size={24} color={theme.secondary} />
                            <Text style={[styles.settingSubtitle, {color: theme.secondary, paddingTop: 0, paddingLeft: 10}]}>
                                FaceID Lock
                            </Text>    
                        </View>
                        <TouchableOpacity>
                            <Feather name="chevron-right" size={20} color={theme.text} />    
                        </TouchableOpacity>
                    
                    </View>

                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18}}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <MaterialIcons name="visibility-off" size={24} color={theme.secondary} />
                            <Text style={[styles.settingSubtitle, {color: theme.secondary, paddingTop: 0, paddingLeft: 10}]}>
                                Ghost Mode
                            </Text>    
                        </View>
                        <TouchableOpacity>
                            <Feather name="chevron-right" size={20} color={theme.text} />    
                        </TouchableOpacity>
                    
                    </View>

                </View>

                <View style={styles.settingsContainer}>
                    <Text style={styles.settingTitle}>
                        Archive & Storage
                    </Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18}}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <MaterialIcons name="cloud-done" size={24} color={theme.secondary} />
                            <Text style={[styles.settingSubtitle, {color: theme.secondary, paddingTop: 0, paddingLeft: 10}]}>
                                Cloud Backup
                            </Text>    
                        </View>
                        <Pressable style={{paddingHorizontal: 8, paddingVertical: 3, backgroundColor: theme.highlight1, borderRadius: 5}}>
                            <Text style={{color: theme.secondary, fontSize: 12, fontFamily: 'Inter_500Medium'}}>
                                Active
                            </Text>
                         </Pressable>
                    </View>

                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18}}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Feather name="download" size={24} color={theme.secondary} />
                            <Text style={[styles.settingSubtitle, {color: theme.secondary, paddingTop: 0, paddingLeft: 10}]}>
                                Export All Letters
                            </Text>    
                        </View>
                        <TouchableOpacity>
                            <Feather name="chevron-right" size={20} color={theme.text} />        
                        </TouchableOpacity>
                    
                    </View>

                </View>

                <Pressable
                    style={{width: '100%', borderWidth: 1, borderColor: theme.text, paddingVertical: 15, borderRadius: 30, marginTop: 35, marginBottom: 18}}
                >
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <MaterialIcons name="logout" size={15} color={theme.secondary} />
                        <Text style={[styles.settingSubtitle, {color: theme.secondary, paddingTop: 0, paddingLeft: 10}]}>
                            Sign Out of DearMe
                        </Text>
                    </View>
                </Pressable>

                <Text style={[styles.settingText, {color: theme.highlight2, fontSize: 12, fontFamily: 'Inter_500Medium', paddingBottom: 30}]}>
                    DEACTIVATE ARCHIVE
                </Text>

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
        marginTop: 30,
        marginBottom: 30
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
    },
    settingsContainer: {
        padding: 25,
        width: '100%',
        borderRadius: 20,
        backgroundColor: 'white',
        marginTop: 20,
        elevation: 0.5
    },
    settingTitle: {
        fontFamily: 'CormorantGaramond_600SemiBold_Italic',
        fontSize: 25
    },
    settingSubtitle: {
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        paddingTop: 18
    },
    settingText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 13,
        lineHeight: 22
    }
})