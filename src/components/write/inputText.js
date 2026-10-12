import { useState } from 'react';
import { View, TextInput } from 'react-native';
import useTheme from '../../store/useTheme';

const InputText = ({placeholderText, fixedTitle, title, onChangeTitle, value, onChangeText}) => {
    const { colors, fSize, spacing } = useTheme();
    const [localTitle, setLocalTitle] = useState(fixedTitle ?? '');
    const [content, setContent] = useState('');
    return (
        <View style={{paddingHorizontal: spacing.lg}}>
            <TextInput
            placeholder='Title'
            placeholderTextColor={colors.mutedForeground}
            value={title ?? localTitle}
            onChangeText={onChangeTitle ?? setLocalTitle}
            style={{fontFamily: 'Fraunces_400Regular', fontSize: fSize.cardTitle, color: colors.foreground}}
        />
        <View style={{height: 1, width: '100%', backgroundColor: colors.divider}} />
        <TextInput
            placeholder={placeholderText}
            placeholderTextColor={colors.mutedForeground}
            value={value ?? content}
            onChangeText={onChangeText ?? setContent}
            multiline
            textAlignVertical='top'
            style={{
                fontFamily: 'Fraunces_400Regular',
                fontSize: fSize.body,
                color: colors.foreground,
                minHeight: 300,
                paddingBottom: 24,
                verticalAlign: 'top'
            }}
        />
        </View>
        
    );
}

export default InputText;
