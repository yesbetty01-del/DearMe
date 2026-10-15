import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import journalStore from '../../store/journalStore';
import useTheme from '../../store/useTheme';
import { router, useLocalSearchParams } from 'expo-router';
import Icon from '../../components/icon';
import { parseCalendarDate, getGapLabel, getTimestamp } from '../../utils/date';

const Id = () => {
    const { colors, spacing, fSize } = useTheme();
    const styles = createStyles(colors, spacing, fSize);
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-us', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        })
    }
    const {id} = useLocalSearchParams();
    const journals = journalStore();
    const journal = journals.find(
        (item) => item.id === id
    );
    const reflections = [...(journal?.reflections || [])].sort((a, b) => {
        const aDate = a.writtenDate || a.writtenOn || a.date || a.createdAt || a.timestamp;
        const bDate = b.writtenDate || b.writtenOn || b.date || b.createdAt || b.timestamp;
        return getTimestamp(bDate) - getTimestamp(aDate);
    });

    if(!journal){
        return(
            <View>
                <Text>no journal</Text>
            </View>
        )
    }
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
                contentContainerStyle={{paddingBottom: spacing.xxxl}}
            >
                {journal.mood &&
                    <View style={[styles.moodContainer, {backgroundColor: colors[journal.moodColor]}]}>
                        <Icon name={journal.mood} color={colors.onPrimary}/>
                        <Text style={styles.moodText}>{journal.moodName}</Text>
                    </View>
                }
                {journal.title &&
                    <Text style={styles.title}>{journal.title}</Text>
                }
                <Text style={styles.date}>{formatDate(journal.date)}</Text>
                {journal.image &&
                    <Image source={journal.image} style={styles.imageStyle} />
                }
                <Text style={styles.content}>{journal.content}</Text>
                <View style={{ width: '100%', height: 1, backgroundColor: colors.divider, marginVertical: spacing.lg }} />
                <Pressable
                    style={[styles.reflectButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                    onPress={() => router.push({ pathname: '/write/reflection', params: { entryId: journal.id } })}
                >
                    <Icon name="corner-down-right" color={colors.primary} size={15} />
                    <Text style={{ fontFamily: 'Inter_500Medium', color: colors.primary }}>Add a reflection</Text>
                </Pressable>
                {!!reflections.length && <View style={{ marginTop: spacing.xl }}>
                    <Text style={[styles.date, { marginBottom: spacing.md }]}>REFLECTIONS</Text>
                    {reflections.map((reflection) => {
                        const reflectedOn = reflection.writtenDate || reflection.writtenOn || reflection.date || reflection.createdAt || reflection.timestamp;
                        return (
                            <View key={reflection.id} style={[styles.reflectionNote, { borderColor: colors.border, backgroundColor: colors.surface, marginBottom: spacing.md, padding: spacing.lg, paddingLeft: spacing.xxxl }]}>
                                <View style={{ position: 'absolute', left: spacing.lg, top: spacing.lg }}>
                                    <Icon name="corner-down-right" color={colors.primary} size={14} />
                                </View>
                                <Text style={styles.date}>{`${parseCalendarDate(reflectedOn)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || ''} · ${getGapLabel(journal.date, reflectedOn, true)}`}</Text>
                                <Text style={[styles.reflectionText, { color: colors.foreground, fontSize: fSize.secondary }]}>{reflection.content}</Text>
                            </View>
                        );
                    })}
                </View>}
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors, spacing, fSize) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.xl,
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
        backgroundColor: colors.surface
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
        marginVertical: spacing.lg
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
        marginTop: spacing.lg,
        flex: 1
    },
    content: {
        fontSize: fSize.body,
        lineHeight: fSize.body * 1.5,
        color: colors.foreground,
        marginTop: spacing.lg
    },
    reflectButton: {
        alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 7,
        paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderRadius: 9999,
    },
    reflectionNote: { borderWidth: 1, borderRadius: 16 },
    reflectionText: { fontFamily: 'Fraunces_400Regular', lineHeight: fSize.secondary * 1.6, marginTop: spacing.sm },
})

export default Id;
