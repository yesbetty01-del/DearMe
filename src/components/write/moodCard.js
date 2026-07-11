import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import Icon from '../icon';
import { Octicons }from '@expo/vector-icons';
import useTheme from '../../store/useTheme';

const MoodCard = ({ onPress, moodIcon, moodColor, mood, selected}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    return (
        <Pressable style={[styles.moodPill, selected && styles.selectedPill, selected && {backgroundColor: moodColor}]} onPress={onPress}>
            
            {moodIcon === 'flame' ? (
                <Octicons name='flame' size={19} color={selected ? colors.onPrimary : moodColor} />
            ) : (
                 <Icon name={moodIcon} color={selected ? colors.onPrimary : moodColor} />
            )}
             
            <Text style={[styles.mood, {color: moodColor}, selected && styles.selectedMood]} > {mood} </Text>
        </Pressable>
    );
}

const createStyles = (colors) => StyleSheet.create({
    moodPill: {
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 0.5,
        borderColor: colors.border,
    },
    selectedPill: {
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mood: {
        fontSize: 11
    },
    selectedMood: {
        color: colors.onPrimary,
        fontSize: 11
    }
})

export default MoodCard;
