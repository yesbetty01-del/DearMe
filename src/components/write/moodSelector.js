import { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import useTheme from '../../store/useTheme';
import MoodCard from './moodCard';

const MoodSelector = ({ selectedMood, onSelectMood }) => {
    const { colors, spacing, fSize } = useTheme();
    const [localMood, setLocalMood] = useState('');
    const currentMood = selectedMood ?? localMood;
    const selectMood = onSelectMood ?? setLocalMood;
    return (
        <View style={{marginTop: 16, paddingHorizontal: spacing.lg}}>
            <Text style={{fontFamily: 'Inter_400Regular', fontSize: fSize.secondary, color: colors.mutedForeground, letterSpacing: 1.2}}>
                HOW ARE YOU FEELING?
            </Text>
            <View style={{flexDirection: 'row', gap: spacing.sm, marginTop: 14}}>
            <MoodCard
                moodIcon={'smile'}
                moodColor={colors.moodCalm}
                mood={'Calm'}
                selected={currentMood === 'Calm'}
                onPress={() => selectMood('Calm')}
            />
            <MoodCard
                moodIcon={'sun'}
                moodColor={colors.moodWarm}
                mood={'Warm'}
                selected={currentMood === 'Warm'}
                onPress={() => selectMood('Warm')}
            />
            <MoodCard
                moodIcon={'cloud'}
                moodColor={colors.moodCloud}
                mood={'Cloudy'}
                selected={currentMood === 'Cloudy'}
                onPress={() => selectMood('Cloudy')}
            />
            <MoodCard
                moodIcon={'moon'}
                moodColor={colors.moodQuiet}
                mood={'Quiet'}
                selected={currentMood === 'Quiet'}
                onPress={() => selectMood('Quiet')}
            />
            <MoodCard
                moodIcon={'flame'}
                moodColor={colors.moodAlive}
                mood={'Alive'}
                selected={currentMood === 'Alive'}
                onPress={() => selectMood('Alive')}
            />
        </View>
        </View>
        
    );
}

const styles = StyleSheet.create({})

export default MoodSelector;
