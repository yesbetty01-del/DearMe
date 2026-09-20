import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import useTheme from '../../store/useTheme';
import Icon from '../icon';

const DatePickerButton = ({onPress, date}) => {
    const { colors, fSize, spacing } = useTheme();
    const formatedDate = date
        ? date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }) : 'CHOOSE AN ARRIVAL DATE';

    return (
        <View style={{paddingHorizontal: spacing.lg, marginTop: 16}}>
            <Text style={{fontFamily: 'Inter_400Regular', fontSize: fSize.secondary, color: colors.mutedForeground, letterSpacing: 1.2}}>
                ARRIVE ON
            </Text>
            <Pressable
                style={{
                    marginTop: 10,
                    padding: spacing.lg,
                    alignItems: 'center',
                    flexDirection: 'row',
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: spacing.md,
                    backgroundColor: colors.surface
                }}
                onPress={onPress}
            >
                <Icon name={'calendar'} />
                <Text style={{
                    paddingLeft: spacing.lg,
                    fontFamily: 'Inter400_Regular',
                    fontSize: fSize.secondary,
                    color: colors.mutedForeground,
                    letterSpacing: 1.2
                }}>
                    {formatedDate}
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({})

export default DatePickerButton;
