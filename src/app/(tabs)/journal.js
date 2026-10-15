import { useState } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme'
import Header from '../../components/header';
import Icon from '../../components/icon';
import Chip from '../../components/chip';
import useJournal from '../../hook/useJournal';
import JournalEntryCard from '../../components/journalEntryCard';
import ReflectionCard from '../../components/reflectionCard';
import { getTimestamp, parseCalendarDate } from '../../utils/date';
import { router } from 'expo-router';

const Journal = () => {
    const { colors, spacing, fSize } = useTheme();
    const styles = createStyles(colors, spacing, fSize);
    const [selectedChip, setSelectedChip] = useState('All');
    const journals = useJournal();
    const sortedReflections = journals.flatMap((entry) => (entry.reflections || []).map((reflection) => ({ entry, reflection, id: reflection.id, writtenDate: reflection.writtenDate || reflection.writtenOn || reflection.date || reflection.createdAt || reflection.timestamp })))
        .sort((a, b) => getTimestamp(b.writtenDate) - getTimestamp(a.writtenDate));
    const reflections = sortedReflections.map((item, index) => {
        const monthHeader = parseCalendarDate(item.writtenDate)?.toLocaleString('en-US', { month: 'long', year: 'numeric' }) || '';
        const previousMonth = index ? parseCalendarDate(sortedReflections[index - 1].writtenDate)?.toLocaleString('en-US', { month: 'long', year: 'numeric' }) || '' : null;
        return { ...item, monthHeader, showMonthHeader: monthHeader !== previousMonth };
    });
    const reflectionsByEntry = (entry) => [...(entry.reflections || [])].sort((a, b) => {
        const aDate = a.writtenDate || a.writtenOn || a.date || a.createdAt || a.timestamp;
        const bDate = b.writtenDate || b.writtenOn || b.date || b.createdAt || b.timestamp;
        return getTimestamp(bDate) - getTimestamp(aDate);
    });
    const feed = selectedChip === 'Reflections' ? reflections : journals;
    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Header header={'Journal'} />
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <Icon name={'search'} />
                    <Icon name={'filter'} />
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Chip
                    label='All'
                    selected={selectedChip === 'All'}
                    onPress={() => setSelectedChip('All')}
                />
                <Chip
                    label='Journals'
                    selected={selectedChip === 'Journals'}
                    onPress={() => setSelectedChip('Journals')}
                />
                <Chip
                    label='Reflections'
                    selected={selectedChip === 'Reflections'}
                    onPress={() => setSelectedChip('Reflections')}
                />
            </View>

            <FlatList
                data={feed}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => (item.id)}
                contentContainerStyle={{}}
                renderItem={({ item }) => (
                    <>
                        {item.showMonthHeader && (
                            <Text style={styles.monthHeader}>
                                {item.monthHeader}
                            </Text>
                        )}
                        {selectedChip === 'Reflections' ? (
                            <ReflectionCard entry={item.entry} reflection={item.reflection} />
                        ) : selectedChip === 'All' && item.reflections?.length ? (
                            <View style={[styles.entryGroup, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                                <JournalEntryCard journal={item} grouped />
                                {reflectionsByEntry(item).map((reflection) => (
                                    <Pressable
                                        key={reflection.id}
                                        onPress={() => router.push({ pathname: '/reflection/[id]', params: { id: reflection.id, entryId: item.id } })}
                                        style={[styles.reflectionPreview, { borderColor: colors.border }]}
                                    >
                                        <Icon name="corner-down-right" color={colors[item.moodColor] || colors.primary} size={13} />
                                        <Text numberOfLines={1} style={[styles.previewText, { color: colors.mutedForeground }]}>{reflection.content}</Text>
                                        <Text style={[styles.previewDate, { color: colors.mutedForeground }]}>{parseCalendarDate(reflection.writtenDate || reflection.writtenOn || reflection.date || reflection.createdAt || reflection.timestamp)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || ''}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        ) : (
                            <JournalEntryCard journal={item} />
                        )}
                    </>
                )}
            />
        </SafeAreaView>
    );
}

const createStyles = (colors, spacing, fSize) => {
    return StyleSheet.create({
        container: {
            backgroundColor: colors.background,
            flex: 1,
            paddingHorizontal: spacing.xl,
        },
        monthHeader: {
            fontFamily: 'Inter_400Regular',
            fontSize: fSize.secondary,
            color: colors.mutedForeground,
            letterSpacing: 1.2,
            paddingVertical: spacing.sm
        },
        entryGroup: { overflow: 'hidden', borderWidth: 1, borderRadius: spacing.md, marginBottom: spacing.sm },
        reflectionPreview: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, borderStyle: 'dashed', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
        previewText: { flex: 1, fontFamily: 'Fraunces_400Regular', fontStyle: 'italic', fontSize: fSize.caption },
        previewDate: { fontFamily: 'Inter_400Regular', fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase' },
    });
};

export default Journal;
