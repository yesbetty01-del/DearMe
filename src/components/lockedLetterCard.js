import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import useTheme from '../store/useTheme';
import Icon from './icon';

const parseDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const LockedLetterCard = ({ letter }) => {
    const { colors, spacing } = useTheme();
    const now = new Date();
    const arrives = parseDate(letter.deliveryDate);
    const sealed = parseDate(letter.writtenDate);
    const daysLeft = arrives ? Math.max(0, Math.ceil((new Date(arrives.toDateString()) - new Date(now.toDateString())) / 86400000)) : 0;
    const totalDays = arrives && sealed ? Math.max(1, Math.ceil((arrives - sealed) / 86400000)) : 1;
    const elapsedDays = sealed ? Math.max(0, Math.ceil((now - sealed) / 86400000)) : 0;
    const progress = Math.min(1, elapsedDays / totalDays);
    const styles = createStyles(colors, spacing);

    return (
        <Pressable onPress={() => router.push(`/letter/${letter.id}`)} style={styles.card}>
            <ImageBackground source={letter.image || require('../../image/image.png')} style={styles.image} imageStyle={styles.imageShape}>
                <LinearGradient colors={['rgba(35,42,31,0.16)', 'rgba(35,42,31,0.88)']} style={styles.scrim}>
                    <View style={styles.topRow}>
                        <View style={styles.sealedPill}>
                            <Icon name="lock" color="#fff" size={12} />
                            <Text style={styles.sealedText}>SEALED</Text>
                        </View>
                        <View style={styles.openIcon}><Icon name="arrow-up-right" color="#fff" size={15} /></View>
                    </View>
                    <View>
                        <Text style={styles.title}>{letter.title}</Text>
                        <View style={styles.stats}>
                            <View style={styles.statCell}>
                                <Text style={styles.statLabel}>OPENS IN</Text>
                                <Text style={styles.days}>{daysLeft}<Text style={styles.dayUnit}> {daysLeft === 1 ? 'day' : 'days'}</Text></Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statCell}>
                                <Text style={styles.statLabel}>ARRIVES</Text>
                                <Text style={styles.arrival}>{arrives ? arrives.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : letter.deliveryDate}</Text>
                                <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </Pressable>
    );
};

const createStyles = (colors, spacing) => StyleSheet.create({
    card: { height: 245, borderRadius: spacing.md, overflow: 'hidden', marginTop: spacing.md },
    image: { flex: 1 },
    imageShape: { borderRadius: spacing.md },
    scrim: { flex: 1, justifyContent: 'space-between', padding: spacing.md },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sealedPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6 },
    sealedText: { fontFamily: 'Inter_500Medium', color: '#fff', fontSize: 9, letterSpacing: 1.2 },
    openIcon: { height: 34, width: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.15)' },
    title: { fontFamily: 'Fraunces_400Regular', fontSize: 20, lineHeight: 26, color: '#fff', marginBottom: spacing.md },
    stats: { flexDirection: 'row', alignItems: 'stretch', borderRadius: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.12)' },
    statCell: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.25)' },
    statLabel: { fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.7)', fontSize: 9, letterSpacing: 1.2 },
    days: { fontFamily: 'Fraunces_400Regular', color: '#fff', fontSize: 23, marginTop: 3 },
    dayUnit: { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.75)' },
    arrival: { fontFamily: 'Fraunces_400Regular', color: '#fff', fontSize: 12, marginTop: 5 },
    progressTrack: { height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 7, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2, backgroundColor: '#fff' },
});

export default LockedLetterCard;
