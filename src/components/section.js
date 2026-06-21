import React from 'react';
import { StyleSheet, Text } from 'react-native';
import useTheme from '../store/useTheme';

const Section = ({title}) => {
    const { colors, fSize } = useTheme();
    return (
        <Text style={{
            fontFamily: 'Fraunces_400Regular',
            fontSize: fSize.sectionTitle,
            color: colors.foreground
        }}>
            {title}
        </Text>
    );
}

const styles = StyleSheet.create({})

export default Section;
