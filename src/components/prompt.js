import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { getPrompt } from '../utils/date';
import useTheme from '../store/useTheme';

const Prompt = () => {
    const { colors, fSize, spacing } = useTheme();

    return (
        <Text style={{
            fontFamily: 'Fraunces_400Regular',
            fontSize: fSize.body,
            color: colors.foreGround
        }}>
            {getPrompt()}
        </Text>
    );
}

export default Prompt;
