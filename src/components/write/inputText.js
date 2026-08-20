import { useState } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import useTheme from '../../store/useTheme';

const InputText = ({placeholderText, fixedTitle}) => {
    const { colors, fSize, spacing } = useTheme();
    const [title, setTitle] = useState(fixedTitle ?? '');
    const [content, setContent] = useState('');
    return (
        <View style={{paddingHorizontal: spacing.lg}}>
            <TextInput
            placeholder='Title'
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            style={{fontFamily: 'Fraunces_400Regular', fontSize: fSize.cardTitle, color: colors.foreground}}
        />
        <View style={{height: 1, width: '100%', backgroundColor: colors.divider}} />
        <TextInput
            placeholder={placeholderText}
            placeholderTextColor={colors.mutedForeground}
            value={content}
            onChangeText={setContent}
            multiline
            //scrollEnabled={false}
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

const styles = StyleSheet.create({})

export default InputText;
