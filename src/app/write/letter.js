import { useState } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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

const Letter = () => {
    const { colors } = useTheme();
    const [arrivalDate, setArrivalDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [visible, setVisible] = useState(false);
    const [showSealAnimation, setShowSealAnimation] = useState(false);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [mood, setMood] = useState(null);
    const addLetter = useLetterStore((state) => state.addLetter);

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);

        if (selectedDate) {
            setArrivalDate(selectedDate);
        }
    };

    const sealLetter = async () => {
        const deliveryDate = toLocalDateKey(arrivalDate);
        if (!deliveryDate) throw new Error('Choose a valid arrival date before sealing.');

        const moodNames = { Calm: 'CALM', Warm: 'WARM', Cloudy: 'CLOUDY', Quiet: 'QUIET', Alive: 'ALIVE' };
        const moodDetails = {
            Calm: ['smile', 'moodCalm'], Warm: ['sun', 'moodWarm'], Cloudy: ['cloud', 'moodCloud'],
            Quiet: ['moon', 'moodQuiet'], Alive: ['flame', 'moodAlive'],
        };
        await addLetter({
            id: `${Date.now()}`,
            title: title.trim() || 'To my future self',
            content: content.trim(),
            ...(mood ? { mood: moodDetails[mood][0], moodName: moodNames[mood], moodColor: moodDetails[mood][1] } : {}),
            writtenDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            deliveryDate,
            status: 'scheduled',
            replies: [],
        });
    };

    return (

        <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
            <EntryHeader title={'FUTURE LETTER'} saveTitle={'Seal'} active={arrivalDate && content.trim().length > 0} onPress={() => setVisible(true)} />
            <ScheduleConfirmation
                visible={visible}
                onClose={() => setVisible(false)}
                onSeal={sealLetter}
                onSealed={() => setShowSealAnimation(true)}
            />
            <LetterSealAnimation
                visible={showSealAnimation}
                onComplete={() => router.replace('/(tabs)/letters')}
            />
            <View style={{ width: '100%', height: 1, backgroundColor: colors.divider, marginTop: 10 }} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                <ScrollView
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
                    <MoodSelector selectedMood={mood} onSelectMood={setMood} />
                    <InputText placeholderText={'Dear me...'} title={title} onChangeTitle={setTitle} value={content} onChangeText={setContent} />
                </ScrollView>
                <Toolbar />
            </KeyboardAvoidingView>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({})

export default Letter;
