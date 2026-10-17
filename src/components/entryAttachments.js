import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, Text, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import useTheme from '../store/useTheme';
import Icon from './icon';
import ConfirmationDialog from './confirmationDialog';
import useAttachmentUri from '../hook/useAttachmentUri';

const EntryAttachments = ({ attachments = [], onAttachmentReviewed, onRemoveAttachment }) => {
    const { colors, fSize, spacing } = useTheme();
    const [selectedImage, setSelectedImage] = useState(null);
    const [attachmentToRemove, setAttachmentToRemove] = useState(null);
    if (!attachments.length) return null;

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingVertical: spacing.xs }}>
            {attachments.map((attachment, index) => (
                <AttachmentItem
                    key={attachment.id || attachment.storageId || `${attachment.uri}-${index}`}
                    attachment={attachment}
                    colors={colors}
                    onOpenImage={setSelectedImage}
                    onRemove={onRemoveAttachment ? setAttachmentToRemove : null}
                    onReviewed={onAttachmentReviewed}
                />
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
                    if (attachmentToRemove) onRemoveAttachment?.(attachmentToRemove.id || attachmentToRemove.uri || attachmentToRemove.storageId);
                    setAttachmentToRemove(null);
                }}
            />
        </View>
    );
};

const AttachmentItem = ({ attachment, colors, onOpenImage, onRemove, onReviewed }) => {
    const uri = useAttachmentUri(attachment);
    const attachmentLabel = attachment.name || (attachment.type === 'audio' ? 'voice note' : 'attached image');

    return (
        <View style={{ position: 'relative' }}>
            {attachment.type === 'image' ? (
                <Pressable
                    onPress={() => uri && onOpenImage(uri)}
                    disabled={!uri}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${attachmentLabel}`}
                >
                    {uri && (
                        <Image
                            source={{ uri }}
                            accessibilityLabel={attachmentLabel}
                            style={{ width: 96, height: 96, borderRadius: 8, backgroundColor: colors.surface }}
                        />
                    )}
                    {!uri && <View style={{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: colors.surface }}><ActivityIndicator color={colors.primary} /></View>}
                </Pressable>
            ) : uri ? (
                <VoiceAttachment attachment={{ ...attachment, uri }} onReviewed={onReviewed} />
            ) : (
                <View style={{ minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderRadius: 19, backgroundColor: colors.surfaceAlt }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={{ color: colors.mutedForeground }}>Loading voice note</Text>
                </View>
            )}
            {!!onRemove && (
                <Pressable
                    onPress={() => onRemove(attachment)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${attachmentLabel}`}
                    style={{ position: 'absolute', top: 2, right: 2, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.background }}
                >
                    <Icon name="x" color={colors.foreground} size={14} />
                </Pressable>
            )}
        </View>
    );
};

const VoiceAttachment = ({ attachment, onReviewed }) => {
    const { colors, spacing, fSize } = useTheme();
    const player = useAudioPlayer(attachment.uri);
    const status = useAudioPlayerStatus(player);

    useEffect(() => {
        if (status.didJustFinish && !attachment.reviewed) onReviewed?.(attachment.id || attachment.storageId || attachment.uri);
    }, [status.didJustFinish, attachment.id, attachment.storageId, attachment.uri, attachment.reviewed, onReviewed]);

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
