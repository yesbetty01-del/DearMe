import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import useTheme from '../../store/useTheme';
import journalStore, { addReflection } from '../../store/journalStore';
import EntryHeader from '../../components/write/entryHeader';
import InputText from '../../components/write/inputText';
import Toolbar from '../../components/write/toolbar';

const Reflection = () => {
    const { colors, spacing, fSize } = useTheme();
    const { entryId } = useLocalSearchParams();
    const entries = journalStore();
    const entry = entries.find((item) => item.id === entryId);
    const [content, setContent] = useState('');
    if (!entry) return null;

    const saveReflection = async () => {
        if (!content.trim()) return;
        await addReflection(entry.id, {
            id: `${Date.now()}`,
            content: content.trim(),
            writtenDate: new Date().toISOString(),
        });
        router.replace('/(tabs)/journal');
    };

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
            <EntryHeader title="LOOKING BACK" saveTitle="Save" active={!!content.trim()} onPress={saveReflection} />
            <View style={{ height: 1, backgroundColor: colors.divider, marginTop: 10 }} />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={{ marginHorizontal: spacing.lg, marginVertical: spacing.xl, padding: spacing.lg, borderLeftWidth: 3, borderLeftColor: colors.primary, backgroundColor: colors.surface }}>
                        <Text style={{ fontFamily: 'Inter_500Medium', color: colors.mutedForeground, paddingBottom: spacing.sm }}>Reflecting on {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                        <Text numberOfLines={4} style={{ fontFamily: 'Fraunces_400Regular', fontStyle: 'italic', color: colors.mutedForeground, fontSize: fSize.secondary, lineHeight: fSize.secondary * 1.4 }}>{entry.content}</Text>
                    </View>
                    <InputText fixedTitle={`Looking back: ${entry.title}`} placeholderText="What do you notice, reading this now?" value={content} onChangeText={setContent} />
                </ScrollView>
                <Toolbar />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Reflection;
