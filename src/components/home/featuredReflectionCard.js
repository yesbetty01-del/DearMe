import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import useTheme from '../../store/useTheme';
import Icon from '../icon';
import Section from '../section';

const moodColorName = { calm: 'moodCalm', warm: 'moodWarm', cloudy: 'moodCloud', quiet: 'moodQuiet', alive: 'moodAlive' };

const getAgeLabel = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Recent reflection';
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const days = Math.max(0, Math.floor((today - date) / 86400000));
    if (days === 0) return 'Today';
    if (days < 7) return 'This week';
    if (days < 14) return 'A week ago';
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    const months = (today.getFullYear() - date.getFullYear()) * 12 + today.getMonth() - date.getMonth();
    if (months < 2) return 'A month ago';
    if (months < 12) return `${months} months ago`;
    const years = Math.floor(months / 12);
    return years === 1 ? 'A year ago' : `${years} years ago`;
};

const FeaturedReflectionCard = ({ entry }) => {
    const { colors, spacing } = useTheme();
    const styles = createStyles(colors, spacing);
    if (!entry) return null;
    const moodColor = colors[moodColorName[(entry.moodName || '').toLowerCase()]] || colors.primary;
    const dateLabel = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const excerpt = (entry.content || '').replace(/\s+/g, ' ').trim();

    return (
        <View style={styles.section}>
            <View style={styles.heading}>
                <Section title={getAgeLabel(entry.date)} />
                <Pressable onPress={() => router.push('/journal')} style={styles.link}>
                    <Text style={styles.linkText}>ALL ENTRIES</Text><Icon name="chevron-right" size={15} />
                </Pressable>
            </View>
            <Pressable onPress={() => router.push(`/entry/${entry.id}`)} style={styles.card}>
                {entry.image ? (
                    <ImageBackground source={entry.image} style={styles.image} />
                ) : null}
                <View style={styles.body}>
                    <View style={styles.metadata}>
                        <View style={[styles.moodDot, { backgroundColor: moodColor }]} />
                        <Text style={styles.metaText}>{dateLabel} </Text>
                    </View>
                    <Text style={styles.title}>{entry.title}</Text>
                    {!!excerpt && <Text numberOfLines={2} style={styles.excerpt}>{excerpt}</Text>}
                </View>
            </Pressable>
        </View>
    );
};

const createStyles = (colors, spacing) => StyleSheet.create({
    section: { marginTop: spacing.xl },
    heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    link: { flexDirection: 'row', alignItems: 'center' },
    linkText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: colors.mutedForeground, letterSpacing: 1 },
    card: { overflow: 'hidden', borderRadius: spacing.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
    image: { height: 160, width: '100%' },
    body: { padding: spacing.md },
    metadata: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    moodDot: { height: 8, width: 8, borderRadius: 4 },
    metaText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.mutedForeground, letterSpacing: 0.7 },
    title: { fontFamily: 'Fraunces_400Regular', fontSize: 19, lineHeight: 25, color: colors.foreground, marginTop: spacing.sm },
    excerpt: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, color: colors.mutedForeground, marginTop: spacing.xs },
});

export default FeaturedReflectionCard;
