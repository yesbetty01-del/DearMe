import { useMemo, useState } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme'
import Header from '../../components/header';
import Icon from '../../components/icon';
import Chip from '../../components/chip';
import useJournal from '../../hook/useJournal';
import JournalEntryCard from '../../components/journalEntryCard';
import ReflectionCard from '../../components/reflectionCard';
import HighlightedText from '../../components/highlightedText';
import { getTimestamp, parseCalendarDate } from '../../utils/date';
import { router } from 'expo-router';

const Journal = () => {
    const { colors, spacing, fSize } = useTheme();
    const styles = createStyles(colors, spacing, fSize);
    const [selectedChip, setSelectedChip] = useState('All');
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState('');
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
    const searchTerm = query.trim().toLocaleLowerCase();
    const matchesEntry = (entry) => `${entry.title || ''} ${entry.content || ''}`
        .toLocaleLowerCase()
        .includes(searchTerm);
    const matchesReflection = (item) => `${item.entry.title || ''} ${item.reflection.content || ''}`
        .toLocaleLowerCase()
        .includes(searchTerm);
    const feed = useMemo(() => {
        const items = selectedChip === 'Reflections' ? reflections : journals;
        if (!searchTerm) return items;

        const filteredItems = items.filter((item) => {
            if (selectedChip === 'Reflections') {
                return matchesReflection(item);
            }

            if (selectedChip === 'Journals') return matchesEntry(item);

            return matchesEntry(item) || (item.reflections || []).some((reflection) =>
                `${item.title || ''} ${reflection.content || ''}`.toLocaleLowerCase().includes(searchTerm));
        });

        if (selectedChip !== 'Reflections') return filteredItems;

        return filteredItems.map((item, index) => {
            const previousMonth = index
                ? parseCalendarDate(filteredItems[index - 1].writtenDate)?.toLocaleString('en-US', { month: 'long', year: 'numeric' }) || ''
                : null;
            return {
                ...item,
                showMonthHeader: item.monthHeader !== previousMonth,
            };
        });
    }, [journals, reflections, selectedChip, query]);
    const resultCount = selectedChip === 'All'
        ? feed.length + feed.reduce((count, entry) => count + (entry.reflections || []).filter((reflection) =>
            !searchTerm
            || `${entry.title || ''} ${reflection.content || ''}`.toLocaleLowerCase().includes(searchTerm),
        ).length, 0)
        : feed.length;
    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <View>
                    <Header header={'Journal'} />
                    <Text style={styles.resultCount}>
                        {resultCount} {selectedChip === 'Reflections'
                            ? (resultCount === 1 ? 'reflection' : 'reflections')
                            : (resultCount === 1 ? 'item' : 'items')}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <Pressable
                        accessibilityLabel={searchOpen ? 'Close search' : 'Search journal'}
                        accessibilityRole="button"
                        onPress={() => {
                            setSearchOpen((open) => !open);
                            setQuery('');
                        }}
                        hitSlop={8}
                        style={styles.searchButton}
                    >
                        <Icon name={searchOpen ? 'x' : 'search'} />
                    </Pressable>
                </View>
            </View>

            {searchOpen && (
                <View style={styles.searchField}>
                    <Icon name="search" size={14} />
                    <TextInput
                        autoFocus
                        accessibilityLabel="Search your entries"
                        placeholder="Search your entries…"
                        placeholderTextColor={colors.mutedForeground}
                        value={query}
                        onChangeText={setQuery}
                        returnKeyType="search"
                        style={styles.searchInput}
                    />
                    {!!query && (
                        <Pressable
                            accessibilityLabel="Clear search"
                            accessibilityRole="button"
                            onPress={() => setQuery('')}
                            hitSlop={8}
                        >
                            <Icon name="x" size={13} />
                        </Pressable>
                    )}
                </View>
            )}

            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Chip
                    label="All"
                    selected={selectedChip === 'All'}
                    onPress={() => setSelectedChip('All')}
                />
                <Chip
                    label="Journals"
                    selected={selectedChip === 'Journals'}
                    onPress={() => setSelectedChip('Journals')}
                />
                <Chip
                    label="Reflections"
                    selected={selectedChip === 'Reflections'}
                    onPress={() => setSelectedChip('Reflections')}
                />
            </View>

            <FlatList
                data={feed}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => (selectedChip === 'Reflections' ? `${item.entry.id}-${item.id}` : item.id)}
                contentContainerStyle={feed.length ? {} : styles.emptyList}
                ListEmptyComponent={(
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}><Icon name="book-open" size={18} color={colors.primary} /></View>
                        <Text style={styles.emptyTitle}>
                            {query.trim() ? 'Nothing matches that' : selectedChip === 'Reflections' ? 'No reflections yet' : 'No entries here yet'}
                        </Text>
                        <Text style={styles.emptyText}>
                            {query.trim()
                                ? `We couldn't find anything for "${query}". Try a different word.`
                                : selectedChip === 'Reflections'
                                    ? 'Open a past entry and tap "Add a reflection" to look back on it.'
                                    : 'Entries you write will collect here.'}
                        </Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <>
                        {item.showMonthHeader && (
                            <Text style={styles.monthHeader}>
                                {item.monthHeader}
                            </Text>
                        )}
                        {selectedChip === 'Reflections' ? (
                            <ReflectionCard entry={item.entry} reflection={item.reflection} searchQuery={query} />
                        ) : selectedChip === 'All' && item.reflections?.length ? (
                            <View style={[styles.entryGroup, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                                <JournalEntryCard journal={item} grouped searchQuery={query} />
                                {reflectionsByEntry(item)
                                    .filter((reflection) => !searchTerm || `${item.title || ''} ${reflection.content || ''}`.toLocaleLowerCase().includes(searchTerm))
                                    .map((reflection) => (
                                    <Pressable
                                        key={reflection.id}
                                        onPress={() => router.push({ pathname: '/reflection/[id]', params: { id: reflection.id, entryId: item.id } })}
                                        style={[styles.reflectionPreview, { borderColor: colors.border }]}
                                    >
                                        <Icon name="corner-down-right" color={colors[item.moodColor] || colors.primary} size={13} />
                                        <HighlightedText numberOfLines={1} style={[styles.previewText, { color: colors.mutedForeground }]} query={query}>{reflection.content}</HighlightedText>
                                        <Text style={[styles.previewDate, { color: colors.mutedForeground }]}>{parseCalendarDate(reflection.writtenDate || reflection.writtenOn || reflection.date || reflection.createdAt || reflection.timestamp)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || ''}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        ) : (
                            <JournalEntryCard journal={item} searchQuery={query} />
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
        searchInput: {
            color: colors.foreground,
            fontFamily: 'Inter_400Regular',
            fontSize: fSize.caption,
            flex: 1,
            paddingVertical: 0,
        },
        searchField: {
            minHeight: 42,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: spacing.xl,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.sm,
        },
        searchButton: {
            width: 36,
            height: 36,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
        },
        resultCount: {
            color: colors.mutedForeground,
            fontFamily: 'Inter_400Regular',
            fontSize: fSize.caption,
            marginTop: 2,
        },
        emptyList: { flexGrow: 1, justifyContent: 'center' },
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
            fontSize: fSize.secondary,
            textAlign: 'center',
        },
        emptyText: {
            color: colors.mutedForeground,
            fontFamily: 'Inter_400Regular',
            fontSize: fSize.caption,
            lineHeight: fSize.caption * 1.5,
            textAlign: 'center',
        },
        entryGroup: { overflow: 'hidden', borderWidth: 1, borderRadius: spacing.md, marginBottom: spacing.sm },
        reflectionPreview: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, borderStyle: 'dashed', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
        previewText: { flex: 1, fontFamily: 'Fraunces_400Regular', fontStyle: 'italic', fontSize: fSize.caption },
        previewDate: { fontFamily: 'Inter_400Regular', fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase' },
    });
};

export default Journal;
