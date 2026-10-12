import DateTimePicker from '@react-native-community/datetimepicker';

const DatePicker = ({ date, onChange }) => {
    return(
        <DateTimePicker
            value={date || new Date()}
            mode='date'
            display='calendar'
            minimumDate={new Date()}
            onChange={onChange}
            
        />
    )
}
export default DatePicker;