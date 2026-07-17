import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import useTheme from '../store/useTheme';

const Icon = ({name, color, size }) => {
    const {colors} = useTheme();

    return (
       <Feather name={name} size = {size || 19} color={color || colors.mutedForeground} />
    );
}

const styles = StyleSheet.create({})

export default Icon;
