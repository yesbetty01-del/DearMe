import { useState } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme'
import Header from '../../components/header';
import Icon from '../../components/icon';
import Chip from '../../components/chip';
import useJournal from '../../hook/useJournal';
import JournalEntryCard from '../../components/journalEntryCard';

const Journal = () => {
    const { colors, spacing, fSize } = useTheme();
    const styles = createStyles(colors, spacing, fSize);
    const [selectedChip, setSelectedChip] = useState('All');
    const journals = useJournal();
    return (
        <SafeAreaView style={styles.container}>

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
                data={journals}
                keyExtractor={(item) => (item.id)}
                contentContainerStyle={{}}
                renderItem={({ item }) => (
                    <>
                        {item.showMonthHeader && (
                            <Text style={styles.monthHeader}>
                                {item.monthHeader}
                            </Text>
                        )}
                        <JournalEntryCard journal={item} />
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
        }
    });
};

export default Journal;
