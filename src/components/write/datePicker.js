import DateTimePicker from '@react-native-community/datetimepicker';

const DatePicker = ({ date, onChange, mode = 'date' }) => {
    return(
        <DateTimePicker
            value={date || new Date()}
            mode={mode}
            display={mode === 'date' ? 'calendar' : 'clock'}
            {...(mode === 'date' ? { minimumDate: new Date() } : {})}
            onChange={onChange}
            
        />
    )
}
export default DatePicker;
