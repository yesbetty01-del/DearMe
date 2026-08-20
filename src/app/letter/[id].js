import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { letterStore } from '../../store/letterStore';
import useTheme from '../../store/useTheme';
import { router, useLocalSearchParams } from 'expo-router';
import Icon from '../../components/icon';
import { todayFormatted } from '../../utils/date';

const Id = () => {
    const { colors, spacing, fSize } = useTheme();
    const styles = createStyles(colors, spacing, fSize);
    const { id } = useLocalSearchParams();
    const letter = letterStore.find(
        (item) => (item.id === id)
    );
    const deliveredToday = letter?.deliveryDate === todayFormatted;

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.pill}
                    onPress={() => router.back()}
                >
                    <Icon name={'chevron-left'} color={colors.foreground} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.pill}
                >
                    <Icon name={'more-horizontal'} color={colors.foreground} />
                </TouchableOpacity>
            </View>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: spacing.xxxl }}
            >
                {letter.mood &&
                    <View style={[styles.moodContainer, { backgroundColor: colors[letter.moodColor] }]}>
                        <Icon name={letter?.mood} color={colors.onPrimary} />
                        <Text style={styles?.moodText}>{letter.moodName}</Text>
                    </View>
                }
                {letter.title &&
                    <Text style={styles.title}>{letter.title}</Text>
                }
                <Text style={styles.date}>{`arrived ${deliveredToday ? "Today" : letter.deliveryDate}`}</Text>
                <View style={{ width: '100%', height: 1, backgroundColor: colors.divider, marginVertical: spacing.lg }} />
                {letter.image &&
                    <Image source={letter.image} style={styles.imageStyle} />
                }
                <Text style={styles.content}>{letter.content}</Text>
                <View style={{ width: '100%', height: 1, backgroundColor: colors.divider, marginVertical: spacing.lg }} />
                <Text style={[styles.date, { alignSelf: 'flex-end' }]}>{`written ${letter.writtenDate}`}</Text>
                <Pressable
                    style={[
                        styles.moodContainer,
                        {
                            flexDirection: 'row',
                            marginVertical: spacing.xl,
                            alignSelf: 'flex-end',
                            borderWidth: 1,
                            borderColor: colors.border
                        }]}
                    onPress={() => {router.push({
                        pathname: '/write/reply',
                        params: {letterId: letter.id}
                    })}}
                >
                    <Icon name={'corner-up-left'} />
                    <Text style={{fontSize: fSize.caption, fontFamily: 'Inter_500Medium', color: colors.mutedForeground}}>Reply</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors, spacing, fSize) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.sm,
    },
    pill: {
        padding: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 9999,
        borderColor: colors.border,
        backgroundColor: colors.surface
    },
    scrollView: {
        flex: 1,
        paddingTop: spacing.md,
    },
    moodContainer: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: spacing.sm,
        gap: spacing.xs,
        alignSelf: 'flex-start',
        backgroundColor: colors.surface,
        marginBottom: spacing.lg
    },
    moodText: {
        color: colors.onPrimary,
        fontSize: fSize.caption,
        fontFamily: 'Inter_400Regular'
    },
    title: {
        fontFamily: 'Fraunces_400Regular',
        fontSize: fSize.sectionTitle,
        color: colors.foreground,
        marginBottom: spacing.lg
    },
    date: {
        fontFamily: 'Inter_500Medium',
        fontSize: fSize.caption,
        color: colors.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 1.2
    },
    imageStyle: {
        height: 200,
        width: '100%',
        borderRadius: spacing.md,
        marginBottom: spacing.lg,
        flex: 1
    },
    content: {
        fontSize: fSize.body,
        lineHeight: fSize.body * 1.5,
        color: colors.foreground,
    }
})

export default Id;
