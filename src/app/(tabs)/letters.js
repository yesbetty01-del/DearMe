import React, {useState} from 'react';
import { StyleSheet, View } from 'react-native';
import {  SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme'
import Header from '../../components/header';
import Chip from '../../components/chip';

const Letters = () => {
    const { colors, spacing } = useTheme();
    const styles = createStyles(colors, spacing);
    const [selectedChip, setSelectedChip] = useState('All');
    return (
        <SafeAreaView style={styles.container}>
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
