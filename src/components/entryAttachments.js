import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, Text, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import useTheme from '../store/useTheme';
import Icon from './icon';
import ConfirmationDialog from './confirmationDialog';

const EntryAttachments = ({ attachments = [], onAttachmentReviewed, onRemoveAttachment }) => {
    const { colors, fSize, spacing } = useTheme();
    const [selectedImage, setSelectedImage] = useState(null);
    const [attachmentToRemove, setAttachmentToRemove] = useState(null);
    if (!attachments.length) return null;

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingVertical: spacing.xs }}>
            {attachments.map((attachment, index) => (
                <View key={attachment.id || `${attachment.uri}-${index}`} style={{ position: 'relative' }}>
                    {attachment.type === 'image' ? (
                        <Pressable
                            onPress={() => setSelectedImage(attachment.uri)}
                            accessibilityRole="button"
                            accessibilityLabel={`Open ${attachment.name || 'attached image'}`}
                        >
                            <Image
                                source={{ uri: attachment.uri }}
                                accessibilityLabel={attachment.name || 'Attached image'}
                                style={{ width: 96, height: 96, borderRadius: 8, backgroundColor: colors.surface }}
                            />
                        </Pressable>
                    ) : (
                        <VoiceAttachment attachment={attachment} onReviewed={onAttachmentReviewed} />
                    )}
                    {!!onRemoveAttachment && (
                        <Pressable
                            onPress={() => setAttachmentToRemove(attachment)}
                            accessibilityRole="button"
                            accessibilityLabel={`Remove ${attachment.name || 'attachment'}`}
                            style={{ position: 'absolute', top: 2, right: 2, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.background }}
                        >
                            <Icon name="x" color={colors.foreground} size={14} />
                        </Pressable>
                    )}
                </View>
            ))}
            <Modal visible={Boolean(selectedImage)} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.96)' }}>
                    {selectedImage && <Image source={{ uri: selectedImage }} resizeMode="contain" style={{ flex: 1, width: '100%' }} />}
                    <Pressable
                        onPress={() => setSelectedImage(null)}
                        accessibilityRole="button"
                        accessibilityLabel="Close image preview"
                        style={{ position: 'absolute', top: 48, right: 24, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Icon name="x" color="#FFFFFF" size={26} />
                    </Pressable>
                </View>
            </Modal>
            <ConfirmationDialog
                visible={Boolean(attachmentToRemove)}
                title={`Remove ${attachmentToRemove?.type === 'audio' ? 'voice note' : 'image'}?`}
                message="This attachment will be removed from the entry."
                confirmLabel="Remove"
                icon="trash-2"
                confirmColor={colors.destructive}
                onCancel={() => setAttachmentToRemove(null)}
                onConfirm={() => {
                    if (attachmentToRemove) onRemoveAttachment?.(attachmentToRemove.uri);
                    setAttachmentToRemove(null);
                }}
            />
        </View>
    );
};

const VoiceAttachment = ({ attachment, onReviewed }) => {
    const { colors, spacing, fSize } = useTheme();
    const player = useAudioPlayer(attachment.uri);
    const status = useAudioPlayerStatus(player);

    useEffect(() => {
        if (status.didJustFinish && !attachment.reviewed) onReviewed?.(attachment.uri);
    }, [status.didJustFinish, attachment.uri, attachment.reviewed, onReviewed]);

    const togglePlayback = async () => {
        try {
            await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
            if (status.playing) {
                player.pause();
            } else {
                if (status.didJustFinish) await player.seekTo(0);
                player.play();
            }
        } catch (error) {
            Alert.alert('Could not play voice note', error?.message || 'Please try again.');
        }
    };

    return (
        <Pressable onPress={togglePlayback} accessibilityRole="button" accessibilityLabel={status.playing ? 'Pause voice note' : 'Play voice note'} style={{ minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 19, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt }}>
            <Icon name={status.playing ? 'pause' : 'play'} color={colors.primary} />
            <Text style={{ color: colors.foreground, fontSize: fSize.secondary }}>
                {status.playing ? 'Pause voice note' : attachment.reviewed ? 'Listen again' : 'Listen to voice note'}
            </Text>
        </Pressable>
    );
};

export default EntryAttachments;
