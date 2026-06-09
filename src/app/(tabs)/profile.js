import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../store/useTheme'
import Header from '../../components/header';
import Icon from '../../components/icon';

const Profile = () => {
    const { colors, spacing } = useTheme();
    const styles = createStyles(colors, spacing);
    return (
        <SafeAreaView style={styles.container}>

            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <Header header={'Profile'} />
                <Icon name='settings' />
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

export default Profile;
