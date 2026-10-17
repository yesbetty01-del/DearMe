import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLetterStore, isLetterAvailable, getDeliveryDateKey, toLocalDateKey } from '../../store/letterStore';
import useTheme from '../../store/useTheme';
import { router, useLocalSearchParams } from 'expo-router';
import Icon from '../../components/icon';
import EntryContent from '../../components/entryContent';
import OverflowMenu from '../../components/overflowMenu';
import ConfirmationDialog from '../../components/confirmationDialog';
import { getGapLabel } from '../../utils/date';

const Id = () => {
    const { colors, spacing, fSize } = useTheme();
    const styles = createStyles(colors, spacing, fSize);
    const { id } = useLocalSearchParams();
    const letters = useLetterStore((state) => state.letters);
    const refreshArrivals = useLetterStore((state) => state.refreshArrivals);
    const letter = letters.find((item) => item.id === id);
    const deleteLetter = useLetterStore((state) => state.deleteLetter);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const available = letter ? isLetterAvailable(letter) : false;
    useEffect(() => { refreshArrivals(); }, [refreshArrivals]);

    const letterActions = [
        { label: 'Delete', destructive: true, onPress: () => setConfirmDelete(true) },
    ];

    if (!letter) return null;

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <ConfirmationDialog
                visible={confirmDelete}
                title="Delete letter?"
                message="This letter and its replies will be permanently deleted."
                confirmLabel="Delete"
                icon="trash-2"
                confirmColor={colors.destructive}
                onCancel={() => setConfirmDelete(false)}
                onConfirm={async () => {
                    setConfirmDelete(false);
                    try {
                        await deleteLetter(letter.id);
                        router.replace('/(tabs)/letters');
                    } catch (error) {
                        Alert.alert('Could not delete letter', error?.message || 'Please try again.');
                    }
                }}
            />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.pill}
                    onPress={() => router.back()}
                >
                    <Icon name={'chevron-left'} color={colors.foreground} />
                </TouchableOpacity>
                <OverflowMenu actions={letterActions} accessibilityLabel="Letter options" />
            </View>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: spacing.xxxl }}
            >
                {!available ? (
                    <View style={{ flex: 1, alignItems: 'center', paddingTop: spacing.xxxl }}>
                        <View style={[styles.pill, { marginBottom: spacing.lg }]}><Icon name="lock" color={colors.primary} size={24} /></View>
                        <Text style={styles.title}>Sealed letter</Text>
                        <Text style={styles.date}>SEALED UNTIL</Text>
                        <Text style={[styles.title, { fontSize: fSize.body, marginTop: spacing.sm }]}>
                            {new Date(`${getDeliveryDateKey(letter.deliveryDate)}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Text>
                        <Text style={[styles.content, { color: colors.mutedForeground, textAlign: 'center' }]}>This letter’s contents stay hidden until it arrives.</Text>
                    </View>
                ) : <>
                {letter.mood &&
                    <View style={[styles.moodContainer, { backgroundColor: colors[letter.moodColor] }]}>
                        <Icon name={letter?.mood} color={colors.onPrimary} />
                        <Text style={styles?.moodText}>{letter.moodName}</Text>
                    </View>
                }
                {letter.title &&
                    <Text style={styles.title}>{letter.title}</Text>
                }
                <Text style={styles.date}>{`arrived ${getDeliveryDateKey(letter.deliveryDate) === toLocalDateKey(new Date())
                    ? 'Today'
                    : new Date(`${getDeliveryDateKey(letter.deliveryDate)}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}</Text>
                <View style={{ width: '100%', height: 1, backgroundColor: colors.divider, marginVertical: spacing.lg }} />
                {letter.image &&
                    <Image source={letter.image} style={styles.imageStyle} />
                }
                <EntryContent content={letter.content} contentBlocks={letter.contentBlocks} attachments={letter.attachments} textStyle={styles.content} />
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
                {!!letter.replies?.length && <>
                    <View style={{ marginTop: spacing.xl }}>
                        <Text style={[styles.date, { marginBottom: spacing.md }]}>YOUR REPLIES</Text>
                        {letter.replies.map((reply) => {
                            const replyDate = reply.writtenDate ?? reply.writtenOn ?? reply.date ?? reply.createdAt ?? reply.timestamp;
                            const sealedDate = letter.writtenDate ?? letter.sealedOn ?? letter.createdAt ?? letter.timestamp;

                            return (
                                <Pressable
                                    key={reply.id}
                                    onPress={() => router.push({ pathname: '/reply/[id]', params: { id: reply.id, letterId: letter.id } })}
                                    style={{
                                        position: 'relative',
                                        marginBottom: spacing.md,
                                        paddingVertical: spacing.lg,
                                        paddingRight: spacing.lg,
                                        paddingLeft: spacing.xxxl,
                                        borderRadius: spacing.md,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        backgroundColor: colors.surface,
                                    }}
                                >
                                    <View style={{ position: 'absolute', left: spacing.lg, top: spacing.lg }}>
                                        <Icon name="corner-down-right" color={colors.primary} size={14} />
                                    </View>
                                    <Text style={styles.date}>
                                        {replyDate} · {getGapLabel(sealedDate, replyDate)}
                                    </Text>
                                    <Text style={[styles.replyText, { marginTop: spacing.sm }]}>{reply.content}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </>}
                </>}
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
        zIndex: 5,
        overflow: 'visible',
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
    },
    replyText: {
        fontFamily: 'Fraunces_400Regular',
        fontSize: fSize.secondary,
        lineHeight: fSize.secondary * 1.6,
        color: colors.foreground,
    }
})

export default Id;
