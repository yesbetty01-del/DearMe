import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme'
import Date from '../../components/date';
import Header from '../../components/header';
import PromptCard from '../../components/promptCard';
import ArrivedLetterCard from '../../components/arrivedLetterCard';
import { letterStore } from '../../store/letterStore';
import Section from '../../components/section';
import journalStore from '../../store/journalStore';
import RecentEntriesCarousel from '../../components/recentEntriesCarousel';

const Index = () => {
    const { colors, spacing } = useTheme();
    const journals = journalStore();
    const styles = createStyles(colors, spacing);
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <FlatList
                contentContainerStyle={{paddingBottom: spacing.lg, paddingTop: spacing.md}}
                data={letterStore}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <>
                    <View style={{paddingHorizontal: spacing.xl}}>
                        <Date />
                        <Header header={'DearMe'} />
                        <View style={{ marginVertical: spacing.xl }}>
                            <PromptCard />
                        </View>
                        
                        {letterStore.length > 0 && (
                            <Section title={'A letter has arrived'} />
                        )}
                    </View>   
                    </>
                }
                renderItem={({ item }) => (
                    <View style={{paddingHorizontal: spacing.xl}}>
                        <ArrivedLetterCard letter={item} />
                    </View>
                    
                )}
                ListFooterComponent={
                    <>
                        <RecentEntriesCarousel journal={journals} />
                    </>
                }
                showsVerticalScrollIndicator={false}
                
            />
        </SafeAreaView>
    );
}

const createStyles = (colors, spacing) => {
    return StyleSheet.create({
        container: {
            backgroundColor: colors.background,
            flex: 1,
        },
    });
};

export default Index;
