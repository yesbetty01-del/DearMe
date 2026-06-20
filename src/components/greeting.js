import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { getGreeting } from '../utils/date';
import useTheme from '../store/useTheme';

const Greeting = () => {
    const { colors, fSize, spacing } = useTheme();
    
    return (
        <Text style={{
            fontFamily: 'Inter_500Medium',
            fontSize: fSize.caption,
            color: colors.mutedForeground,
            letterSpacing: 1.2
        }}>
            {getGreeting()}
        </Text>
    );
}

export default Greeting;
