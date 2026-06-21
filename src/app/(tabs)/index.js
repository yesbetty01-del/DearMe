import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme'
import Date from '../../components/date';
import Header from '../../components/header';
import PromptCard from '../../components/promptCard';
import ArrivedLetterCard from '../../components/arrivedLetterCard';
import useLetters from '../../store/useLetters';
import Section from '../../components/section';

const Index = () => {
    const { colors, spacing } = useTheme();
    const letters = useLetters();
    const styles = createStyles(colors, spacing);
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <FlatList
                contentContainerStyle={{paddingBottom: spacing.lg, paddingTop: spacing.md}}
                data={letters}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <>
                        <Date />
                        <Header header={'DearMe'} />
                        <View style={{ marginVertical: spacing.xl }}>
                            <PromptCard />
                        </View>
                        
                        {letters.length > 0 && (
                            <Section title={'A letter has arrived'} />
                        )}
                        
                    </>
                }
                renderItem={({ item }) => (
                    <ArrivedLetterCard letter={item} />
                )}
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
            paddingHorizontal: spacing.xl,
        },
    });
};

export default Index;
