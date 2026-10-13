import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme';
import EntryHeader from '../../components/write/entryHeader';
import MoodSelector from '../../components/write/moodSelector';
import InputText from '../../components/write/inputText';
import Toolbar from '../../components/write/toolbar';
import { router, useLocalSearchParams } from 'expo-router';
import { useLetterStore, isLetterAvailable } from '../../store/letterStore';

const Reply = () => {
    const { colors, spacing, fSize } = useTheme();
    const styles = createStyles(colors, spacing, fSize);
    const { letterId } = useLocalSearchParams();
    const [content, setContent] = useState('');
    const [saveError, setSaveError] = useState(false);
    const letters = useLetterStore((state) => state.letters);
    const addReply = useLetterStore((state) => state.addReply);
    const refreshArrivals = useLetterStore((state) => state.refreshArrivals);
    const letter = letters.find((item) => item.id === letterId);
    useEffect(() => { refreshArrivals(); }, [refreshArrivals]);
    if (!letter) {
        return null;
    }
    const available = isLetterAvailable(letter);

    const saveReply = async () => {
        if (!available || !content.trim()) return;
        try {
            await addReply(letter.id, {
                id: `${Date.now()}`,
                content: content.trim(),
                writtenDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            });
            router.replace(`/letter/${letter.id}`);
        } catch (error) {
            setSaveError(true);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <EntryHeader title={'REPLY TO LETTER'} saveTitle={'Save'} active={available && !!content.trim()} onPress={saveReply} />
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
                    {!available ? <View style={styles.prevContainer}><Text style={styles.prevLetter}>This letter is sealed until its arrival date.</Text></View> : <View style={styles.prevContainer}>
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
                        
                    </View>}
                    {available && <InputText fixedTitle={`In reply to: ${letter.title}`} placeholderText={'Start writing...'} value={content} onChangeText={setContent} />}
                    {saveError && <Text style={[styles.prevLetter, { marginHorizontal: spacing.lg, color: colors.primary }]}>We could not save your reply. Please try again.</Text>}
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
