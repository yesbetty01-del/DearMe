import React, { useRef } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import useTheme from '../../store/useTheme';
import journalStore, { addReflection, updateReflection } from '../../store/journalStore';
import EntryHeader from '../../components/write/entryHeader';
import InputText from '../../components/write/inputText';
import Toolbar from '../../components/write/toolbar';
import useWritingContent from '../../hook/useWritingContent';
import {
    prepareContentBlocksForSave,
} from '../../utils/attachmentStorage';

const Reflection = () => {
    const draftId = useRef(`${Date.now()}`);
    const { colors, spacing, fSize } = useTheme();
    const { entryId, reflectionId } = useLocalSearchParams();
    const entries = journalStore();
    const entry = entries.find((item) => item.id === entryId);
    const reflection = entry?.reflections?.find((item) => item.id === reflectionId);
    const initialBlocks = reflection?.contentBlocks?.length
        ? reflection.contentBlocks
        : reflection
            ? [
                ...(reflection.content ? [{ id: `text-${reflectionId}`, type: 'text', value: reflection.content }] : []),
                ...(reflection.attachments || []),
            ]
        : undefined;
    const writing = useWritingContent(initialBlocks);
    if (!entry) return null;

    const saveReflection = async () => {
        if (!writing.hasWritingContent) return;
        try {
            const reflectionIdToSave = reflection?.id || draftId.current;
            const preparedContent = await prepareContentBlocksForSave({
                blocks: writing.contentBlocks,
            });
            const updatedReflection = {
                ...(reflection || {}),
                id: reflectionIdToSave,
                content: writing.content,
                contentBlocks: preparedContent.contentBlocks,
                attachments: preparedContent.attachments,
                writtenDate: reflection?.writtenDate || new Date().toISOString(),
            };
            if (reflection) {
                await updateReflection(entry.id, reflection.id, updatedReflection);
            } else {
                await addReflection(entry.id, updatedReflection);
            }
            if (reflection) {
                router.replace({ pathname: '/reflection/[id]', params: { id: reflection.id, entryId: entry.id } });
            } else {
                router.replace('/(tabs)/journal');
            }
        } catch (error) {
            Alert.alert('Could not save reflection', error?.message || 'Please try again.');
        }
    };

    return (
        <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
            <EntryHeader title="LOOKING BACK" saveTitle="Save" active={writing.hasWritingContent} hasEntry={writing.hasWritingContent} onPress={saveReflection} />
            <View style={{ height: 1, backgroundColor: colors.divider, marginTop: 10 }} />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={{ marginHorizontal: spacing.lg, marginVertical: spacing.xl, padding: spacing.lg, borderLeftWidth: 3, borderLeftColor: colors.primary, backgroundColor: colors.surface }}>
                        <Text style={{ fontFamily: 'Inter_500Medium', color: colors.mutedForeground, paddingBottom: spacing.sm }}>Reflecting on {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                        <Text numberOfLines={4} style={{ fontFamily: 'Fraunces_400Regular', fontStyle: 'italic', color: colors.mutedForeground, fontSize: fSize.secondary, lineHeight: fSize.secondary * 1.4 }}>{entry.content}</Text>
                    </View>
                    <InputText fixedTitle={`Looking back: ${entry.title}`} placeholderText="What do you notice, reading this now?" blocks={writing.blocks} onTextBlockChange={writing.updateTextBlock} onAttachmentReviewed={writing.markAttachmentReviewed} onRemoveAttachment={writing.removeAttachment} />
                </ScrollView>
                <Toolbar onAddAttachments={writing.addAttachments} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Reflection;
