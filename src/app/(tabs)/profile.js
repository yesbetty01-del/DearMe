import React from 'react';
import { StyleSheet, View } from 'react-native';
import useTheme from '../../store/useTheme'

const Profile = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    return (
        <View style={styles.container}>
            
        </View>
    );
}

const createStyles = (colors) => {
    return StyleSheet.create({
        container: {
            backgroundColor: colors.background,
            flex: 1,
        },
    });
};

export default Profile;
