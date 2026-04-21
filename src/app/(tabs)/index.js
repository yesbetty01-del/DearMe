import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/themeContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function Home() {
    const {theme} = useTheme();
    return(
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={[styles.titleText, {color: theme.primary}]}>DearMe</Text>
                <View style={[styles.customCard, {backgroundColor: theme.card1, borderColor: theme.card1}]}>
                    <MaterialIcons name="auto-stories" size={24} color={theme.primary} />
                    <Text style={{fontSize: 20, lineHeight: 29}}>
                        "If you were to write a letter to the version of yourself from
                        five years ago, what is the one secret you'd finally share?"
                    </Text>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <TouchableOpacity style={[styles.button, {backgroundColor: theme.primary}]}>
                            <Text style={{color:'white'}}>Start Writing</Text>
                        </TouchableOpacity>
                        <Text>Daily Prompt</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create ({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    titleText: {
        fontSize: 20,
        alignSelf: 'center'
    },
    customCard: {
        marginTop: 30,
        height: 350,
        width: 300,
        borderWidth: 1,
        borderRadius: 20,
        justifyContent: 'space-between',
        padding: 25,
        elevation: 1
    },
    button: {
        padding: 15,
        borderRadius: 40
    }
})