import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import useTheme from '../../store/useTheme';
import TodayDate from '../../components/date';
import Header from '../../components/header';
import PromptCard from '../../components/promptCard';
import ArrivedLetterCard from '../../components/arrivedLetterCard';
import LockedLetterCard from '../../components/lockedLetterCard';
import FeaturedReflectionCard from '../../components/home/featuredReflectionCard';
import WeekMoodTracker from '../../components/home/weekMoodTracker';
import EarlierEntriesList from '../../components/home/earlierEntriesList';
import { useLetters, useLetterStore, getDeliveryDateKey, toLocalDateKey } from '../../store/letterStore';
import Section from '../../components/section';
import journalStore from '../../store/journalStore';
import { getItems } from '../../utils/storage';
import LoadingScreen from '../../components/loadingScreen';

const parseDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const Home = () => {
    const { colors, spacing } = useTheme();
    const journals = journalStore();
    const letterStore = useLetters();
    const lettersReady = useLetterStore((state) => state.isReady);
    const [hideLockedLetters, setHideLockedLetters] = useState(true);
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    useFocusEffect(useCallback(() => {
        let isActive = true;
        setSettingsLoaded(false);
        getItems('profileSettings')
            .then((savedSettings) => {
                if (!isActive) return;
                try {
                    setHideLockedLetters(savedSettings ? JSON.parse(savedSettings).hideLockedLetters === true : false);
                } catch (error) {
                    console.error('Could not load profile settings:', error);
                    setHideLockedLetters(false);
                }
            })
            .catch((error) => console.error('Could not load profile settings:', error))
            .finally(() => { if (isActive) setSettingsLoaded(true); });
        return () => { isActive = false; };
    }, []));
    const today = toLocalDateKey(new Date());
    const sortedJournals = useMemo(() => [...journals].sort((a, b) => new Date(b.date) - new Date(a.date)), [journals]);
    const featuredEntry = useMemo(() => journals.length
        ? journals[Math.floor(Math.random() * journals.length)]
        : null, [journals]);
    const waitingLetter = useMemo(() => (hideLockedLetters ? [] : letterStore)
        .filter((letter) => letter.status === 'scheduled')
        .sort((a, b) => (parseDate(a.deliveryDate)?.getTime() ?? Infinity) - (parseDate(b.deliveryDate)?.getTime() ?? Infinity))[0], [hideLockedLetters, letterStore]);
    const arrivedToday = letterStore.filter((letter) => letter.status === 'delivered' && getDeliveryDateKey(letter.deliveryDate) === today);

    if (!lettersReady || !settingsLoaded) return <LoadingScreen />;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
            <FlatList
                contentContainerStyle={{ paddingBottom: spacing.xl, paddingTop: spacing.md }}
                data={[]}
                ListHeaderComponent={
                    <View style={{ paddingHorizontal: spacing.xl }}>
                        <TodayDate />
                        <Header header="DearMe" />
                        <View style={{ marginTop: spacing.xl }}><PromptCard /></View>
                        <WeekMoodTracker entries={journals} />
                        {!!arrivedToday.length && (
                            <View style={{ marginTop: spacing.xl }}>
                                <Section title="A letter has arrived" />
                                {arrivedToday.map((letter) => (
                                    <ArrivedLetterCard key={letter.id} letter={letter} />
                                ))}
                            </View>
                        )}
                        <FeaturedReflectionCard entry={featuredEntry} />
                        {waitingLetter && (
                            <View style={{ marginTop: spacing.xl }}>
                                <Section title="On its way to you" />
                                <LockedLetterCard letter={waitingLetter} />
                            </View>
                        )}
                    </View>
                }
                ListFooterComponent={(
                    <EarlierEntriesList
                        entries={sortedJournals.slice(0, 3)}
                    />
                )}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

export default Home;
