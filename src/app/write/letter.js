import { useState } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import useTheme from '../../store/useTheme';
import EntryHeader from '../../components/write/entryHeader';
import MoodSelector from '../../components/write/moodSelector';
import InputText from '../../components/write/inputText';
import Toolbar from '../../components/write/toolbar';
import DatePickerButton from '../../components/write/datePickerButton';
import DatePicker from '../../components/write/datePicker';
import ScheduleConfirmation from '../../components/write/scheduleConfirmation';
import LetterSealAnimation from '../../components/write/letterSealAnimation';
import { useLetterStore, toLocalDateKey } from '../../store/letterStore';
import useWritingContent from '../../hook/useWritingContent';

const Letter = () => {
    const { colors } = useTheme();
    const { editId } = useLocalSearchParams();
    const letters = useLetterStore((state) => state.letters);
    const existingLetter = letters.find((letter) => letter.id === editId);
    const [arrivalDate, setArrivalDate] = useState(() => existingLetter
        ? new Date(`${toLocalDateKey(existingLetter.deliveryDate)}T${existingLetter.deliveryTime || '12:00'}:00`)
        : null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [visible, setVisible] = useState(false);
    const [showSealAnimation, setShowSealAnimation] = useState(false);
    const [title, setTitle] = useState(existingLetter?.title || '');
    const [mood, setMood] = useState(existingLetter?.moodName ? existingLetter.moodName[0] + existingLetter.moodName.slice(1).toLowerCase() : null);
    const initialBlocks = existingLetter?.contentBlocks?.length
        ? existingLetter.contentBlocks
        : existingLetter
            ? [
                ...(existingLetter.content ? [{ id: `text-${editId}`, type: 'text', value: existingLetter.content }] : []),
                ...(existingLetter.attachments || []),
            ]
        : undefined;
    const writing = useWritingContent(initialBlocks);
    const addLetter = useLetterStore((state) => state.addLetter);
    const updateLetter = useLetterStore((state) => state.updateLetter);

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);

        if (selectedDate) {
            setArrivalDate(selectedDate);
            setShowTimePicker(true);
        }
    };

    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);

        if (selectedTime) {
            setArrivalDate((currentDate) => {
                const arrivalDateTime = new Date(currentDate || selectedTime);
                arrivalDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
                return arrivalDateTime;
            });
        }
    };

    const sealLetter = async () => {
        if (!writing.hasWritingContent) throw new Error('Write a message or attach an image or voice note before sealing this letter.');
        const deliveryDate = toLocalDateKey(arrivalDate);
        if (!deliveryDate) throw new Error('Choose a valid arrival date before sealing.');

        const moodNames = { Calm: 'CALM', Warm: 'WARM', Cloudy: 'CLOUDY', Quiet: 'QUIET', Alive: 'ALIVE' };
        const moodDetails = {
            Calm: ['smile', 'moodCalm'], Warm: ['sun', 'moodWarm'], Cloudy: ['cloud', 'moodCloud'],
            Quiet: ['moon', 'moodQuiet'], Alive: ['flame', 'moodAlive'],
        };
        const updatedLetter = {
            ...(existingLetter || {}),
            id: existingLetter?.id || `${Date.now()}`,
            title: title.trim() || 'To my future self',
            content: writing.content,
            contentBlocks: writing.contentBlocks,
            attachments: writing.attachments,
            ...(mood ? { mood: moodDetails[mood][0], moodName: moodNames[mood], moodColor: moodDetails[mood][1] } : {}),
            writtenDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            deliveryDate,
            deliveryTime: arrivalDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            status: 'scheduled',
            replies: [],
        };
        if (existingLetter) {
            updatedLetter.replies = existingLetter.replies || [];
            await updateLetter(existingLetter.id, updatedLetter);
        } else {
            await addLetter(updatedLetter);
        }
    };

    return (

        <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
            <EntryHeader title={'FUTURE LETTER'} saveTitle={'Seal'} active={Boolean(arrivalDate && writing.hasWritingContent)} hasEntry={writing.hasWritingContent} onPress={() => setVisible(true)} />
            <ScheduleConfirmation
                visible={visible}
                onClose={() => setVisible(false)}
                onSeal={sealLetter}
                onSealed={() => setShowSealAnimation(true)}
            />
            <LetterSealAnimation
                visible={showSealAnimation}
                onComplete={() => router.replace(existingLetter ? `/letter/${existingLetter.id}` : '/(tabs)/letters')}
            />
            <View style={{ width: '100%', height: 1, backgroundColor: colors.divider, marginTop: 10 }} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                >
                    <DatePickerButton onPress={() => setShowDatePicker(true)} date={arrivalDate} />
                    {showDatePicker && (
                        <DatePicker
                            date={arrivalDate}
                            onChange={handleDateChange}
                        />
                    )}
                    {showTimePicker && (
                        <DatePicker
                            date={arrivalDate}
                            mode='time'
                            onChange={handleTimeChange}
                        />
                    )}
                    <MoodSelector selectedMood={mood} onSelectMood={setMood} />
                    <InputText placeholderText={'Dear me...'} title={title} onChangeTitle={setTitle} blocks={writing.blocks} onTextBlockChange={writing.updateTextBlock} onAttachmentReviewed={writing.markAttachmentReviewed} onRemoveAttachment={writing.removeAttachment} />
                </ScrollView>
                <Toolbar onAddAttachments={writing.addAttachments} />
            </KeyboardAvoidingView>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({})

export default Letter;
