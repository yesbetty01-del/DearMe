import { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import useTheme from '../../store/useTheme';
import MoodCard from './moodCard';

const MoodSelector = () => {
    const { colors, spacing, fSize } = useTheme();
    const [selectedMood, setSelectedMood] = useState('');
    return (
        <View style={{marginTop: 16}}>
            <Text style={{fontFamily: 'Inter_400Regular', fontSize: fSize.secondary, color: colors.mutedForeground, letterSpacing: 1.2}}>
                HOW ARE YOU FEELING?
            </Text>
            <View style={{flexDirection: 'row', gap: spacing.sm, marginTop: 14}}>
            <MoodCard
                moodIcon={'smile'}
                moodColor={colors.moodCalm}
                mood={'Calm'}
                selected={selectedMood === 'Calm'}
                onPress={() => setSelectedMood('Calm')}
            />
            <MoodCard
                moodIcon={'sun'}
                moodColor={colors.moodWarm}
                mood={'Warm'}
                selected={selectedMood === 'Warm'}
                onPress={() => setSelectedMood('Warm')}
            />
            <MoodCard
                moodIcon={'cloud'}
                moodColor={colors.moodCloud}
                mood={'Cloudy'}
                selected={selectedMood === 'Cloudy'}
                onPress={() => setSelectedMood('Cloudy')}
            />
            <MoodCard
                moodIcon={'moon'}
                moodColor={colors.moodQuiet}
                mood={'Quiet'}
                selected={selectedMood === 'Quiet'}
                onPress={() => setSelectedMood('Quiet')}
            />
            <MoodCard
                moodIcon={'flame'}
                moodColor={colors.moodAlive}
                mood={'Alive'}
                selected={selectedMood === 'Alive'}
                onPress={() => setSelectedMood('Alive')}
            />
        </View>
        </View>
        
    );
}

const styles = StyleSheet.create({})

export default MoodSelector;
