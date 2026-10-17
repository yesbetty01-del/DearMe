import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme';
import EntryHeader from '../../components/write/entryHeader';
import MoodSelector from '../../components/write/moodSelector';
import InputText from '../../components/write/inputText';
import Toolbar from '../../components/write/toolbar';
import { router, useLocalSearchParams } from 'expo-router';
import { useLetterStore, isLetterAvailable } from '../../store/letterStore';
import useWritingContent from '../../hook/useWritingContent';
import {
    prepareContentBlocksForSave,
} from '../../utils/attachmentStorage';

const Reply = () => {
    const draftId = useRef(`${Date.now()}`);
    const { colors, spacing, fSize } = useTheme();
    const styles = createStyles(colors, spacing, fSize);
    const { letterId, replyId } = useLocalSearchParams();
    const [saveError, setSaveError] = useState(false);
    const letters = useLetterStore((state) => state.letters);
    const addReply = useLetterStore((state) => state.addReply);
    const updateReply = useLetterStore((state) => state.updateReply);
    const refreshArrivals = useLetterStore((state) => state.refreshArrivals);
    const letter = letters.find((item) => item.id === letterId);
    const existingReply = letter?.replies?.find((reply) => reply.id === replyId);
    const initialBlocks = existingReply?.contentBlocks?.length
        ? existingReply.contentBlocks
        : existingReply
            ? [
                ...(existingReply.content ? [{ id: `text-${replyId}`, type: 'text', value: existingReply.content }] : []),
                ...(existingReply.attachments || []),
            ]
        : undefined;
    const writing = useWritingContent(initialBlocks);
    useEffect(() => { refreshArrivals(); }, [refreshArrivals]);
    if (!letter) {
        return null;
    }
    const available = isLetterAvailable(letter);

    const saveReply = async () => {
        if (!available || !writing.hasWritingContent) return;
        try {
            const replyIdToSave = existingReply?.id || draftId.current;
            const preparedContent = await prepareContentBlocksForSave({
                blocks: writing.contentBlocks,
            });
            const reply = {
                ...(existingReply || {}),
                id: replyIdToSave,
                content: writing.content,
                contentBlocks: preparedContent.contentBlocks,
                attachments: preparedContent.attachments,
                writtenDate: existingReply?.writtenDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            };
            if (existingReply) {
                await updateReply(letter.id, existingReply.id, reply);
                router.replace({ pathname: '/reply/[id]', params: { id: existingReply.id, letterId: letter.id } });
            } else {
                await addReply(letter.id, reply);
                router.replace('/(tabs)/letters');
            }
        } catch (error) {
            setSaveError(true);
        }
    };

    return (
        <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
            <EntryHeader title={'REPLY TO LETTER'} saveTitle={'Save'} active={available && writing.hasWritingContent} hasEntry={writing.hasWritingContent} onPress={saveReply} />
            <View style={{ width: '100%', height: 1, backgroundColor: colors.divider, marginTop: 10 }} />
            <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
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
                    {available && <InputText fixedTitle={`In reply to: ${letter.title}`} placeholderText={'Start writing...'} blocks={writing.blocks} onTextBlockChange={writing.updateTextBlock} onAttachmentReviewed={writing.markAttachmentReviewed} onRemoveAttachment={writing.removeAttachment} />}
                    {saveError && <Text style={[styles.prevLetter, { marginHorizontal: spacing.lg, color: colors.primary }]}>We could not save your reply. Please try again.</Text>}
                </ScrollView>
                <Toolbar onAddAttachments={writing.addAttachments} />
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
