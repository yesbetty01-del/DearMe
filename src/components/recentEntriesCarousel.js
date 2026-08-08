import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ImageBackground } from 'react-native';
import Section from './section';
import useTheme from '../store/useTheme';
import Icon from './icon';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router'

const RecentEntriesCarousel = ({ journal }) => {
    const { colors, fSize, spacing } = useTheme();
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-us', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        })
    }
    return (
        <View style={{ marginTop: spacing.xl }}>

            <View style={[styles.header, { marginBottom: spacing.md, paddingHorizontal: spacing.xl }]}>
                <Section title={'Recent entries'} />
                <Pressable onPress={() => router.push('/journal')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 11,
                        color: colors.mutedForeground,
                        letterSpacing: 1.2
                    }}>
                        ALL ENTRIES
                    </Text>
                    <Icon name={'chevron-right'} />
                </Pressable>
            </View>

            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}
            >
                {journal.slice(0, 3).map((item, index) => (
                    <Pressable onPress={() => router.push(`entry/${item.id}`)} key={item.id} style={{
                        height: 220,
                        width: 180,
                        borderRadius: spacing.md,
                        overflow: 'hidden'
                    }}>
                        <ImageBackground source={item.image} style={{ flex: 1 }} >
                            <LinearGradient
                                colors={["transparent", "transparent", "rgba(0,0,0,0.9)"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={{ flex: 1 }}
                            >
                                <View style={{ justifyContent: 'flex-end', flex: 1, padding: spacing.sm }} >
                                    <Text style={{
                                        fontFamily: 'Inter_400Regular',
                                        fontSize: fSize.caption,
                                        color: colors.mutedForeground
                                    }}>
                                        {formatDate(item.date)}
                                    </Text>
                                    <Text style={{
                                        fontFamily: 'Fraunces_400Regular',
                                        fontSize: fSize.secondary,
                                        color: '#f5f1e8'
                                    }}>
                                        {item.title}
                                    </Text>
                                </View>
                            </LinearGradient>


                        </ImageBackground>

                    </Pressable>
                ))}

            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
    }
})

export default RecentEntriesCarousel;
