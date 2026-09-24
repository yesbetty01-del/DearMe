import {useState} from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme';
import EntryHeader from '../../components/write/entryHeader';
import MoodSelector from '../../components/write/moodSelector';
import InputText from '../../components/write/inputText';
import Toolbar from '../../components/write/toolbar';
import DatePickerButton from '../../components/write/datePickerButton';
import DatePicker from '../../components/write/datePicker';
import ScheduleConfirmation from '../../components/write/scheduleConfirmation';

const Letter = () => {
    const { colors } = useTheme();
    const [arrivalDate, setArrivalDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [visible, setVisible] = useState(false);
    const [content, setContent] = useState('');

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);

        if (selectedDate) {
            setArrivalDate(selectedDate);
        }
    };
    return (

        <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
            <EntryHeader title={'FUTURE LETTER'} saveTitle={'Seal'} active={arrivalDate && content.trim().length > 0} onPress={() => setVisible(true)} />
            <ScheduleConfirmation visible={visible} onClose={() => setVisible(false)} />
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
                    <MoodSelector />
                    <InputText placeholderText={'Dear me...'} value={content} onChangeText={setContent} />
                </ScrollView>
                <Toolbar />
            </KeyboardAvoidingView>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({})

export default Letter;
