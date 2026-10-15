import React, { useState } from 'react';
import { Alert, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import useTheme from '../../store/useTheme';
import journalStore, { addJournal, updateJournal } from '../../store/journalStore';
import EntryHeader from '../../components/write/entryHeader';
import MoodSelector from '../../components/write/moodSelector';
import InputText from '../../components/write/inputText';
import Toolbar from '../../components/write/toolbar';
import useWritingContent from '../../hook/useWritingContent';

const MOOD_DETAILS = {
    Calm: { mood: 'smile', moodColor: 'moodCalm' },
    Warm: { mood: 'sun', moodColor: 'moodWarm' },
    Cloudy: { mood: 'cloud', moodColor: 'moodCloud' },
    Quiet: { mood: 'moon', moodColor: 'moodQuiet' },
    Alive: { mood: 'flame', moodColor: 'moodAlive' },
};

const Journal = () => {
    const { colors } = useTheme();
    const { editId } = useLocalSearchParams();
    const journals = journalStore();
    const existingEntry = journals.find((entry) => entry.id === editId);
    const [draft, setDraft] = useState(() => ({
        title: existingEntry?.title || '',
        mood: existingEntry?.moodName ? existingEntry.moodName[0] + existingEntry.moodName.slice(1).toLowerCase() : null,
    }));
    const initialBlocks = existingEntry?.contentBlocks?.length
        ? existingEntry.contentBlocks
        : existingEntry
            ? [
                ...(existingEntry.content ? [{ id: `text-${editId}`, type: 'text', value: existingEntry.content }] : []),
                ...(existingEntry.attachments || []),
            ]
        : undefined;
    const writing = useWritingContent(initialBlocks);

    const updateDraft = (field, value) => {
        setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
    };

    const handleSave = async () => {
        if (!writing.hasWritingContent) return;
        const moodDetails = MOOD_DETAILS[draft.mood];
        const entry = {
            ...(existingEntry || {}),
            id: existingEntry?.id || `${Date.now()}`,
            title: draft.title.trim(),
            date: existingEntry?.date || new Date().toISOString(),
            mood: moodDetails?.mood,
            moodName: draft.mood?.toUpperCase(),
            moodColor: moodDetails?.moodColor,
            content: writing.content,
            contentBlocks: writing.contentBlocks,
            attachments: writing.attachments,
        };

        try {
            if (existingEntry) await updateJournal(existingEntry.id, entry);
            else await addJournal(entry);
            router.back();
        } catch (error) {
            Alert.alert('Could not save entry', error?.message || 'Please try again.');
        }
    };

    return (
        <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
            <EntryHeader title="JOURNAL ENTRY" saveTitle="Save" active={writing.hasWritingContent} hasEntry={writing.hasWritingContent} onPress={handleSave} />
            <View style={{ width: '100%', height: 1, backgroundColor: colors.divider, marginTop: 10 }} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <MoodSelector selectedMood={draft.mood} onSelectMood={(mood) => updateDraft('mood', mood)} />
                    <InputText
                        placeholderText="Start writing..."
                        title={draft.title}
                        onChangeTitle={(title) => updateDraft('title', title)}
                        blocks={writing.blocks}
                        onTextBlockChange={writing.updateTextBlock}
                        onAttachmentReviewed={writing.markAttachmentReviewed}
                        onRemoveAttachment={writing.removeAttachment}
                    />
                </ScrollView>
                <Toolbar onAddAttachments={writing.addAttachments} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Journal;
