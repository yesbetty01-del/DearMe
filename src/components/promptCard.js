import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import useTheme from '../store/useTheme';
import Icon from './icon';

const MOODS = [
    { label: 'Calm', icon: 'smile', color: 'moodCalm' },
    { label: 'Warm', icon: 'sun', color: 'moodWarm' },
    { label: 'Cloudy', icon: 'cloud', color: 'moodCloud' },
    { label: 'Quiet', icon: 'moon', color: 'moodQuiet' },
    { label: 'Alive', icon: 'flame', color: 'moodAlive' },
];

const PromptCard = () => {
    const { colors, spacing } = useTheme();
    const [selectedMood, setSelectedMood] = useState(null);
    const styles = createStyles(colors, spacing);

    return (
        <View style={styles.card}>
            <Text style={styles.eyebrow}>HOW DOES TODAY FEEL?</Text>
            <View style={styles.moods}>
                {MOODS.map((mood) => {
                    const active = selectedMood === mood.label;
                    const moodColor = colors[mood.color] || colors.primary;
                    return (
                        <Pressable key={mood.label} onPress={() => setSelectedMood(active ? null : mood.label)} style={styles.mood} accessibilityRole="button" accessibilityState={{ selected: active }}>
                            <View style={[styles.moodCircle, { borderColor: active ? moodColor : colors.border, backgroundColor: active ? moodColor : 'transparent' }]}>
                                <Icon name={mood.icon} size={18} color={active ? colors.onPrimary : moodColor} />
                            </View>
                            <Text style={[styles.moodLabel, { color: active ? colors.foreground : colors.mutedForeground }]}>{mood.label}</Text>
                        </Pressable>
                    );
                })}
            </View>
            {!!selectedMood && (
                <Pressable
                    onPress={() => router.push({ pathname: '/write/journal', params: { mood: selectedMood } })}
                    style={styles.promptAction}
                    accessibilityRole="button"
                >
                    <View style={[styles.writeIcon, { backgroundColor: colors[MOODS.find((mood) => mood.label === selectedMood)?.color] || colors.primary }]}><Icon name="feather" color={colors.onPrimary} size={16} /></View>
                    <Text style={styles.promptText}>Write about feeling {selectedMood.toLowerCase()}</Text>
                    <Icon name="arrow-right" color={colors.mutedForeground} size={16} />
                </Pressable>
            )}
        </View>
    );
};

const createStyles = (colors, spacing) => StyleSheet.create({
    card: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: spacing.md, padding: spacing.lg },
    eyebrow: { fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.mutedForeground, letterSpacing: 1.2 },
    moods: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, marginBottom: spacing.md },
    mood: { alignItems: 'center', gap: spacing.xs, minWidth: 42 },
    moodCircle: { width: 42, height: 42, borderWidth: 1, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
    moodLabel: { fontFamily: 'Inter_400Regular', fontSize: 10 },
    promptAction: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border, paddingTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    writeIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    promptText: { flex: 1, fontFamily: 'Fraunces_400Regular', fontSize: 15, color: colors.foreground },
});

export default PromptCard;
