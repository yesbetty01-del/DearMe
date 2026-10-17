import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function PasswordField({ colors, value, onChangeText, onSubmitEditing, placeholder, style }) {
    const [visible, setVisible] = useState(false);

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderStrong }, style]}>
            <TextInput
                autoFocus
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmitEditing}
                returnKeyType="done"
                secureTextEntry={!visible}
                placeholder={placeholder}
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                style={[styles.input, { color: colors.foreground }]}
            />
            <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Hide password' : 'Show password'} onPress={() => setVisible((current) => !current)} style={styles.toggle}>
                <Text style={[styles.toggleText, { color: colors.primary }]}>{visible ? 'Hide' : 'Show'}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%', maxWidth: 320, minHeight: 50, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, marginBottom: 16 },
    input: { flex: 1, minWidth: 0, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16 },
    toggle: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 14 },
    toggleText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
});
