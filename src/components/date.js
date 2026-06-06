import React from 'react';
import { StyleSheet, Text } from 'react-native';
import useTheme from '../store/useTheme';
import { day, month, dateNo } from '../utils/date';

const Date = () => {
    const { colors, fSize, spacing } = useTheme();
    const styles = createStyles(colors, fSize, spacing);
    return (
        <Text style={styles.dateText}>
            {day}, {month} {dateNo}
        </Text>
    );
}

const createStyles = (colors, fSize, spacing) => StyleSheet.create({
    dateText: {
        color: colors.mutedForeground,
        fontSize: fSize.caption,
        letterSpacing: 1.2,
        fontFamily: 'Inter_400Regular',
        textTransform: 'uppercase',
    }
});

export default Date;
