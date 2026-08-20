import React from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme';
import EntryHeader from '../../components/write/entryHeader';
import MoodSelector from '../../components/write/moodSelector';
import InputText from '../../components/write/inputText';
import Toolbar from '../../components/write/toolbar';
import { useLocalSearchParams } from 'expo-router';
import { letterStore } from '../../store/letterStore';

const Reply = () => {
    const { colors, spacing, fSize } = useTheme();
    const styles = createStyles(colors, spacing, fSize);
    const { letterId } = useLocalSearchParams();
    const letter = letterStore.find(
        item => item.id === letterId
    );
    if (!letter) {
        return null;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <EntryHeader title={'REPLY TO LETTER'} saveTitle={'Save'} />
            <View style={{ width: '100%', height: 1, backgroundColor: colors.divider, marginTop: 10 }} />
            <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                >
                    <View style={styles.prevContainer}>
                        <View style={{
                            height: '100%',
                            width: 3,
                            backgroundColor: colors.deliveredBag,
                        }}/>
                        <View style={{padding: spacing.lg}}>
                            <Text style={{
                                fontFamily: 'Inter_500Medium',
                                color: colors.mutedForeground,
                                paddingBottom: spacing.sm
                            }}>
                                {`Replying to ${letter.writtenDate}`}
                            </Text>
                            <Text numberOfLines={4} style={styles.prevLetter}>"{letter.content}"</Text>
                        </View>
                        
                    </View>
                    <InputText fixedTitle={`In reply to: ${letter.title}`} placeholderText={'Start writting...'} />
                </ScrollView>
                <Toolbar />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors, spacing, fSize) => StyleSheet.create({
    prevContainer: {
        flexDirection: 'row',
        marginHorizontal: spacing.lg,
        marginVertical: spacing.xl,
        backgroundColor: colors.surface,
    },
    prevLetter: {
        fontStyle: 'italic',
        color: colors.mutedForeground,
        fontSize: fSize.secondary,
        lineHeight: fSize.secondary * 1.4
    }
})

export default Reply;
