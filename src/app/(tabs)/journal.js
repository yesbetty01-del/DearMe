import {useState} from 'react';
import { StyleSheet, View } from 'react-native';
import {  SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme'
import Header from '../../components/header';
import Icon from '../../components/icon';
import Chip from '../../components/chip';

const Journal = () => {
    const { colors, spacing } = useTheme();
    const styles = createStyles(colors, spacing);
    const [selectedChip, setSelectedChip] = useState('All');
    return (
        <SafeAreaView style={styles.container}>

            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <Header header={'Journal'} />
                <View style={{flexDirection: 'row', gap: spacing.md}}>
                    <Icon name={'search'} />
                    <Icon name={'filter'} />
                </View>
            </View>

            <View style={{flexDirection: 'row', gap: spacing.sm}}>
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

export default Journal;
