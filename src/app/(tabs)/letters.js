import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme';
import Header from '../../components/header';
import Chip from '../../components/chip';
import { useLetters } from '../../store/letterStore';
import LetterCard from '../../components/letterCard';
import LetterReplyCard from '../../components/letterReplyCard';
import { parseCalendarDate } from '../../utils/date';

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
    const letters = useLetters();

    const replies = useMemo(
        () => letters.flatMap((letter) =>
            (letter.replies || []).map((reply) => ({ letter, reply })),
        ),
        [letters],
    );

    const allItems = useMemo(() => {
        const items = [
            ...letters.map((letter) => ({ type: 'letter', letter })),
            ...replies.map((item) => ({ type: 'reply', ...item })),
        ];

        return items.sort(compareRecentItems);
    }, [letters, replies]);

    const replyItems = useMemo(
        () => replies
            .map((item) => ({ type: 'reply', ...item }))
            .sort(compareRecentItems),
        [replies],
    );

    const filteredLetters = useMemo(() => {
        if (selectedChip === 'Locked') {
            return letters
                .filter((letter) => letter.status === 'scheduled')
                .sort((first, second) => compareRecentItems(
                    { type: 'letter', letter: first },
                    { type: 'letter', letter: second },
                ));
        }
        if (selectedChip === 'Delivered') {
            return letters
                .filter((letter) => letter.status === 'delivered')
                .sort((first, second) => compareRecentItems(
                    { type: 'letter', letter: first },
                    { type: 'letter', letter: second },
                ));
        }
        return letters;
    }, [letters, selectedChip]);

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
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: spacing.lg }}
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
});

export default Letters;
