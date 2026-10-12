import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import useTheme from '../../store/useTheme';
import { addJournal } from '../../store/journalStore';
import EntryHeader from '../../components/write/entryHeader';
import MoodSelector from '../../components/write/moodSelector';
import InputText from '../../components/write/inputText';
import Toolbar from '../../components/write/toolbar';

const MOOD_DETAILS = {
    Calm: { mood: 'smile', moodColor: 'moodCalm' },
    Warm: { mood: 'sun', moodColor: 'moodWarm' },
    Cloudy: { mood: 'cloud', moodColor: 'moodCloud' },
    Quiet: { mood: 'moon', moodColor: 'moodQuiet' },
    Alive: { mood: 'flame', moodColor: 'moodAlive' },
};

const Journal = () => {
    const { colors } = useTheme();
    const [draft, setDraft] = useState({ title: '', body: '', mood: null });

    const updateDraft = (field, value) => {
        setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
    };

    const handleSave = async () => {
        const moodDetails = MOOD_DETAILS[draft.mood];
        const entry = {
            id: `${Date.now()}`,
            title: draft.title.trim(),
            date: new Date().toISOString(),
            mood: moodDetails?.mood,
            moodName: draft.mood?.toUpperCase(),
            moodColor: moodDetails?.moodColor,
            content: draft.body.trim(),
        };

        await addJournal(entry);
        router.back();
    };

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
            <EntryHeader title="JOURNAL ENTRY" saveTitle="Save" active={Boolean(draft.body.trim())} onPress={handleSave} />
            <View style={{ width: '100%', height: 1, backgroundColor: colors.divider, marginTop: 10 }} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <MoodSelector selectedMood={draft.mood} onSelectMood={(mood) => updateDraft('mood', mood)} />
                    <InputText
                        placeholderText="Start writing..."
                        title={draft.title}
                        onChangeTitle={(title) => updateDraft('title', title)}
                        value={draft.body}
                        onChangeText={(body) => updateDraft('body', body)}
                    />
                </ScrollView>
                <Toolbar />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Journal;
