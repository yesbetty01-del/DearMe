import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme';
import Header from '../../components/header';
import Chip from '../../components/chip';
import { useLetters } from '../../store/letterStore';
import LetterCard from '../../components/letterCard';
import LetterReplyCard from '../../components/letterReplyCard';
import Icon from '../../components/icon';
import { parseCalendarDate } from '../../utils/date';
import { getItems } from '../../utils/storage';

const getWrittenDate = (item) => {
    if (item.type === 'reply') {
        return item.reply.writtenDate
            ?? item.reply.writtenOn
            ?? item.reply.date
            ?? item.reply.createdAt
            ?? item.reply.timestamp;
    }

    return item.letter.writtenDate
        ?? item.letter.sealedOn
        ?? item.letter.createdAt
        ?? item.letter.timestamp;
};

const getItemId = (item) => item.type === 'reply' ? item.reply.id : item.letter.id;

const compareRecentItems = (first, second) => {
    const firstDate = parseCalendarDate(getWrittenDate(first))?.getTime() ?? 0;
    const secondDate = parseCalendarDate(getWrittenDate(second))?.getTime() ?? 0;
    if (firstDate !== secondDate) return secondDate - firstDate;

    const firstCreatedAt = Number(getItemId(first)) || 0;
    const secondCreatedAt = Number(getItemId(second)) || 0;
    return secondCreatedAt - firstCreatedAt;
};

const Letters = () => {
    const { colors, spacing } = useTheme();
    const styles = createStyles(colors, spacing);
    const [selectedChip, setSelectedChip] = useState('All');
    const [hideLockedLetters, setHideLockedLetters] = useState(true);
    const letters = useLetters();

    useFocusEffect(useCallback(() => {
        let isActive = true;
        getItems('profileSettings').then((savedSettings) => {
            if (!isActive) return;
            try {
                setHideLockedLetters(savedSettings ? JSON.parse(savedSettings).hideLockedLetters === true : false);
            } catch (error) {
                console.error('Could not load profile settings:', error);
                setHideLockedLetters(false);
            }
        });
        return () => { isActive = false; };
    }, []));

    const visibleLetters = useMemo(
        () => hideLockedLetters ? letters.filter((letter) => letter.status !== 'scheduled') : letters,
        [hideLockedLetters, letters],
    );

    const replies = useMemo(
        () => visibleLetters.flatMap((letter) =>
            (letter.replies || []).map((reply) => ({ letter, reply })),
        ),
        [visibleLetters],
    );

    const allItems = useMemo(() => {
        const items = [
            ...visibleLetters.map((letter) => ({ type: 'letter', letter })),
            ...replies.map((item) => ({ type: 'reply', ...item })),
        ];

        return items.sort(compareRecentItems);
    }, [visibleLetters, replies]);

    const replyItems = useMemo(
        () => replies
            .map((item) => ({ type: 'reply', ...item }))
            .sort(compareRecentItems),
        [replies],
    );

    const filteredLetters = useMemo(() => {
        if (selectedChip === 'Locked') {
            return visibleLetters
                .filter((letter) => letter.status === 'scheduled')
                .sort((first, second) => compareRecentItems(
                    { type: 'letter', letter: first },
                    { type: 'letter', letter: second },
                ));
        }
        if (selectedChip === 'Delivered') {
            return visibleLetters
                .filter((letter) => letter.status === 'delivered')
                .sort((first, second) => compareRecentItems(
                    { type: 'letter', letter: first },
                    { type: 'letter', letter: second },
                ));
        }
        return visibleLetters;
    }, [visibleLetters, selectedChip]);

    const listItems = selectedChip === 'All'
        ? allItems
        : selectedChip === 'Replies'
            ? replyItems
            : filteredLetters.map((letter) => ({ type: 'letter', letter }));

    const renderItem = ({ item }) => item.type === 'reply'
        ? <LetterReplyCard letter={item.letter} reply={item.reply} />
        : <LetterCard letter={item.letter} />;

    const keyExtractor = (item) => item.type === 'reply'
        ? `${item.letter.id}-${item.reply.id}`
        : item.letter.id;
    const emptyState = {
        All: {
            icon: 'mail',
            title: 'Your letters will be here',
            message: 'Letters you write to your future self will find a home here.',
        },
        Locked: hideLockedLetters
            ? {
                icon: 'eye-off',
                title: 'Locked letters are hidden',
                message: 'You can show them any time by turning off “Hide locked letters” in Privacy settings.',
            }
            : {
                icon: 'lock',
                title: 'No locked letters yet',
                message: 'Letters you schedule for later will appear here until they arrive.',
            },
        Delivered: {
            icon: 'mail-open',
            title: 'No delivered letters yet',
            message: 'When a letter is ready to open, you’ll find it here.',
        },
        Replies: {
            icon: 'message-circle',
            title: 'No replies yet',
            message: 'Replies to your letters will appear here.',
        },
    }[selectedChip];

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header header="Letters" />
            <View style={[styles.filters, { gap: spacing.sm }]}>
                <Chip
                    label="All"
                    selected={selectedChip === 'All'}
                    onPress={() => setSelectedChip('All')}
                />
                <Chip
                    label="Locked"
                    selected={selectedChip === 'Locked'}
                    onPress={() => setSelectedChip('Locked')}
                />
                <Chip
                    label="Delivered"
                    selected={selectedChip === 'Delivered'}
                    onPress={() => setSelectedChip('Delivered')}
                />
                <Chip
                    label="Replies"
                    selected={selectedChip === 'Replies'}
                    onPress={() => setSelectedChip('Replies')}
                />
            </View>

            <FlatList
                data={listItems}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListEmptyComponent={(
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Icon name={emptyState.icon} size={19} color={colors.primary} />
                        </View>
                        <Text style={styles.emptyTitle}>{emptyState.title}</Text>
                        <Text style={styles.emptyMessage}>{emptyState.message}</Text>
                    </View>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={listItems.length ? styles.listContent : styles.emptyList}
            />
        </SafeAreaView>
    );
};

const createStyles = (colors, spacing) => StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.background,
    },
    filters: {
        flexDirection: 'row',
    },
    listContent: { paddingBottom: spacing.lg },
    emptyList: { flexGrow: 1, justifyContent: 'center', paddingBottom: spacing.xl },
    emptyState: {
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.border,
        borderRadius: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xl * 2,
    },
    emptyIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    emptyTitle: {
        color: colors.foreground,
        fontFamily: 'Fraunces_400Regular',
        fontSize: 18,
        textAlign: 'center',
    },
    emptyMessage: {
        color: colors.mutedForeground,
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
    },
});

export default Letters;
