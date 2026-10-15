import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import Icon from '../icon';
import useTheme from '../../store/useTheme';

const copyToAttachmentsDirectory = async (sourceUri, extension) => {
    if (!FileSystem.documentDirectory) return sourceUri;

    const directory = `${FileSystem.documentDirectory}attachments/`;
    const directoryInfo = await FileSystem.getInfoAsync(directory);
    if (!directoryInfo.exists) await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

    const destination = `${directory}${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    await FileSystem.copyAsync({ from: sourceUri, to: destination });
    return destination;
};

const Toolbar = ({ onAddAttachments = () => {} }) => {
    const { colors, spacing } = useTheme();
    const styles = createStyles(colors, spacing);
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(recorder);
    const [recordingStatus, setRecordingStatus] = useState('closed');
    const busy = useRef(false);
    const recordingSessionRef = useRef(false);
    const isRecording = recordingStatus === 'recording';
    const recorderModalVisible = recordingStatus !== 'closed';

    useEffect(() => () => {
        if (recordingSessionRef.current) {
            recorder.stop()
                .catch(() => {})
                .finally(() => setAudioModeAsync({ allowsRecording: false }).catch(() => {}));
        }
    }, [recorder]);

    const showError = (message) => Alert.alert('Could not complete action', message);

    const addImage = async (useCamera) => {
        try {
            const permission = useCamera
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                showError(useCamera ? 'Allow camera access in Settings to take a photo.' : 'Allow photo library access in Settings to attach an image.');
                return;
            }
            const result = useCamera
                ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, base64: Platform.OS === 'web' })
                : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, base64: Platform.OS === 'web' });
            if (!result.canceled && result.assets?.length) {
                const imageAttachments = await Promise.all(result.assets.map(async (asset) => {
                    if (Platform.OS === 'web' && asset.base64) {
                        return { type: 'image', uri: `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`, name: asset.fileName || 'Image' };
                    }

                    const extension = asset.fileName?.split('.').pop() || asset.mimeType?.split('/').pop() || 'jpg';
                    const uri = await copyToAttachmentsDirectory(asset.uri, extension);
                    return { type: 'image', uri, name: asset.fileName || 'Image' };
                }));
                onAddAttachments(imageAttachments);
            }
        } catch (error) {
            showError(error?.message || 'Please try again.');
        }
    };

    const startRecording = async () => {
        if (busy.current) return;
        busy.current = true;
        try {
            if (recordingStatus === 'paused') {
                recorder.record();
                setRecordingStatus('recording');
                return;
            }

            const permission = await AudioModule.requestRecordingPermissionsAsync();
            if (!permission.granted) {
                showError('Allow microphone access in Settings to record a voice note.');
                return;
            }
            await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
            await recorder.prepareToRecordAsync();
            recorder.record();
            recordingSessionRef.current = true;
            setRecordingStatus('recording');
        } catch (error) {
            await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
            showError(error?.message || 'Please try again.');
        } finally {
            busy.current = false;
        }
    };

    const pauseRecording = () => {
        recorder.pause();
        setRecordingStatus('paused');
    };

    const stopRecording = async () => {
        if (busy.current) return;
        busy.current = true;
        try {
            if (recordingSessionRef.current) {
                await recorder.stop();
                await setAudioModeAsync({ allowsRecording: false });
                recordingSessionRef.current = false;
                if (recorder.uri) {
                    const uri = await copyToAttachmentsDirectory(recorder.uri, 'm4a');
                    onAddAttachments([{ type: 'audio', uri, name: 'Voice recording', reviewed: false }]);
                }
            }
            setRecordingStatus('closed');
        } catch (error) {
            recordingSessionRef.current = false;
            await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
            showError(error?.message || 'The voice note could not be saved. Please try again.');
            setRecordingStatus('closed');
        } finally {
            busy.current = false;
        }
    };

    const elapsedSeconds = Math.floor((recorderState.durationMillis || 0) / 1000);
    const recordingTime = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`;

    return (
        <View style={styles.wrapper}>
            <Modal
                visible={recorderModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => recordingStatus === 'ready' && setRecordingStatus('closed')}
            >
                <View style={styles.recordingOverlay}>
                    <View style={styles.recordingModal}>
                        {recordingStatus === 'ready' ? (
                            <>
                                <Icon name="mic" color={colors.primary} size={28} />
                                <Text style={styles.recordingTitle}>Voice note</Text>
                                <Pressable accessibilityRole="button" onPress={startRecording} style={styles.stopRecordingButton}>
                                    <Icon name="mic" color={colors.onPrimary} size={16} />
                                    <Text style={styles.stopRecordingText}>Start recording</Text>
                                </Pressable>
                                <Pressable accessibilityRole="button" onPress={() => setRecordingStatus('closed')} style={styles.cancelRecordingButton}>
                                    <Text style={styles.cancelRecordingText}>Cancel</Text>
                                </Pressable>
                            </>
                        ) : (
                            <>
                                <View style={[styles.recordingIndicator, recordingStatus === 'paused' && styles.pausedIndicator]} />
                                <Text style={styles.recordingTitle}>{recordingStatus === 'paused' ? 'Recording paused' : 'Recording voice note'}</Text>
                                <Text style={styles.recordingTimer}>{recordingTime}</Text>
                                <View style={styles.recordingActions}>
                                    <Pressable accessibilityRole="button" onPress={recordingStatus === 'recording' ? pauseRecording : startRecording} style={[styles.secondaryRecordingButton, styles.recordingActionButton]}>
                                        <Icon name={recordingStatus === 'recording' ? 'pause' : 'play'} color={colors.primary} size={16} />
                                        <Text style={styles.secondaryRecordingText}>{recordingStatus === 'recording' ? 'Pause' : 'Resume'}</Text>
                                    </Pressable>
                                    <Pressable accessibilityRole="button" onPress={stopRecording} style={[styles.stopRecordingButton, styles.recordingActionButton]}>
                                        <Icon name="square" color={colors.onPrimary} size={15} />
                                        <Text style={styles.stopRecordingText}>Stop</Text>
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            <View style={styles.container}>
                <Action icon="image" label="Choose image" onPress={() => addImage(false)} />
                <Action icon="camera" label="Take photo" onPress={() => addImage(true)} />
                <Action icon="mic" label="Record voice note" onPress={() => setRecordingStatus('ready')} />
            </View>
        </View>
    );
};

const Action = ({ icon, label, onPress }) => {
    const { colors } = useTheme();
    return (
        <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.6 }]}>
            <Icon name={icon} color={colors.mutedForeground} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});

const createStyles = (colors, spacing) => StyleSheet.create({
    wrapper: { borderTopWidth: 0.7, borderColor: colors.border },
    container: { alignItems: 'center', justifyContent: 'space-evenly', flexDirection: 'row', paddingVertical: spacing.xs },
    recordingOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, backgroundColor: colors.overlay },
    recordingModal: { width: '100%', maxWidth: 340, alignItems: 'center', padding: spacing.xl, borderRadius: spacing.lg, backgroundColor: colors.surface },
    recordingIndicator: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#D9534F', marginBottom: spacing.md },
    pausedIndicator: { backgroundColor: colors.mutedForeground },
    recordingTitle: { color: colors.foreground, fontFamily: 'Inter_500Medium', fontSize: 16, marginTop: spacing.sm },
    recordingTimer: { color: colors.mutedForeground, fontSize: 24, marginTop: spacing.md, fontVariant: ['tabular-nums'] },
    recordingActions: { width: '100%', flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginTop: spacing.xl },
    stopRecordingButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: spacing.lg, backgroundColor: colors.primary },
    stopRecordingText: { color: colors.onPrimary, fontFamily: 'Inter_500Medium' },
    secondaryRecordingButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: spacing.lg, backgroundColor: colors.accent },
    recordingActionButton: { flex: 1 },
    secondaryRecordingText: { color: colors.primary, fontFamily: 'Inter_500Medium' },
    cancelRecordingButton: { padding: spacing.md, marginTop: spacing.xs },
    cancelRecordingText: { color: colors.mutedForeground },
});

export default Toolbar;
