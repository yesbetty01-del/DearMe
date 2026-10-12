import React, { useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme';
import TodayDate from '../../components/date';
import Header from '../../components/header';
import PromptCard from '../../components/promptCard';
import ArrivedLetterCard from '../../components/arrivedLetterCard';
import LockedLetterCard from '../../components/lockedLetterCard';
import FeaturedReflectionCard from '../../components/home/featuredReflectionCard';
import WeekMoodTracker from '../../components/home/weekMoodTracker';
import EarlierEntriesList from '../../components/home/earlierEntriesList';
import { letterStore } from '../../store/letterStore';
import Section from '../../components/section';
import journalStore from '../../store/journalStore';
import { todayFormatted } from '../../utils/date';

const parseDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const Home = () => {
    const { colors, spacing } = useTheme();
    const journals = journalStore();
    const sortedJournals = useMemo(() => [...journals].sort((a, b) => new Date(b.date) - new Date(a.date)), [journals]);
    const featuredEntry = useMemo(() => journals.length
        ? journals[Math.floor(Math.random() * journals.length)]
        : null, [journals]);
    const waitingLetter = useMemo(() => letterStore
        .filter((letter) => letter.status === 'scheduled' || letter.status === 'waiting')
        .sort((a, b) => (parseDate(a.deliveryDate)?.getTime() ?? Infinity) - (parseDate(b.deliveryDate)?.getTime() ?? Infinity))[0], []);
    const arrivedToday = letterStore.filter((letter) => letter.deliveryDate === todayFormatted);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
            <FlatList
                contentContainerStyle={{ paddingBottom: spacing.xl, paddingTop: spacing.md }}
                data={arrivedToday}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <View style={{ paddingHorizontal: spacing.xl }}>
                        <TodayDate />
                        <Header header="DearMe" />
                        <View style={{ marginTop: spacing.xl }}><PromptCard /></View>
                        <WeekMoodTracker entries={journals} />
                        <FeaturedReflectionCard entry={featuredEntry} />
                        {waitingLetter && (
                            <View style={{ marginTop: spacing.xl }}>
                                <Section title="On its way to you" />
                                <LockedLetterCard letter={waitingLetter} />
                            </View>
                        )}
                        {!!arrivedToday.length && <Section title="A letter has arrived" />}
                    </View>
                }
                renderItem={({ item }) => <View style={{ paddingHorizontal: spacing.xl }}><ArrivedLetterCard letter={item} /></View>}
                ListFooterComponent={(
                    <EarlierEntriesList
                        entries={sortedJournals.filter((entry) => entry.id !== featuredEntry?.id).slice(0, 3)}
                    />
                )}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

export default Home;
