import React, {useState} from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import {  SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme'
import Header from '../../components/header';
import Chip from '../../components/chip';
import { letterStore } from '../../store/letterStore';
import LetterCard from '../../components/letterCard';

const Letters = () => {
    const { colors, spacing } = useTheme();
    const styles = createStyles(colors, spacing);
    const [selectedChip, setSelectedChip] = useState('All');
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header header={'Letters'} />
            <View style={{flexDirection: 'row', gap: spacing.sm,}}>
                <Chip
                    label='All'
                    selected={selectedChip === 'All'}
                    onPress={() => setSelectedChip('All')}
                />
                <Chip
                    label='Locked'
                    selected={selectedChip === 'Locked'}
                    onPress={() => setSelectedChip('Locked')}
                />
                <Chip
                    label='Delivered'
                    selected={selectedChip === 'Delivered'}
                    onPress={() => setSelectedChip('Delivered')}
                />
                <Chip
                    label='Replies'
                    selected={selectedChip === 'Replies'}
                    onPress={() => setSelectedChip('Replies')}
                />    
            </View>

            <FlatList
                data={letterStore}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: spacing.lg}}
                renderItem={({ item }) => (
                    <>
                    <LetterCard title={item.title} status={item.status} content={item.content} deliveryDate={item.deliveryDate} writtenDate={item.writtenDate} />
                    <LetterCard title={item.title} status={item.status} content={item.content} deliveryDate={item.deliveryDate} writtenDate={item.writtenDate} />
                    </>
                )}
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

export default Letters;
