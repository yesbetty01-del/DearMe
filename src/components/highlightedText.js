import React from 'react';
import { Text } from 'react-native';
import useTheme from '../store/useTheme';

const HighlightedText = ({ children, query, style, ...textProps }) => {
    const { colors } = useTheme();
    const text = String(children || '');
    const term = query?.trim();
    if (!term) return <Text style={style} {...textProps}>{text}</Text>;

    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedTerm})`, 'ig'));

    return (
        <Text style={style} {...textProps}>
            {parts.map((part, index) => part.toLocaleLowerCase() === term.toLocaleLowerCase()
                ? <Text key={`${index}-${part}`} style={{ backgroundColor: colors.accent, color: colors.foreground }}>{part}</Text>
                : part)}
        </Text>
    );
};

export default HighlightedText;
