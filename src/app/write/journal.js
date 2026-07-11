import React from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme';
import EntryHeader from '../../components/write/entryHeader';
import MoodSelector from '../../components/write/moodSelector';

const Journal = () => {
    const { colors, spacing, fSize } = useTheme();
    return (
        <SafeAreaView edge={['top', 'left', 'right']} style={{flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg}}>
           <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <EntryHeader title={'JOURNAL ENTRY'} saveTitle={'Save'} />
                <View style={{width: '100%', height: 1, backgroundColor: colors.divider, marginTop: 10}} />
                <ScrollView>
                    <MoodSelector />
                </ScrollView>   
            </KeyboardAvoidingView> 
        </SafeAreaView>
            
    );
}

const styles = StyleSheet.create({})

export default Journal;
