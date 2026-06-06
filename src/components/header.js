import React from 'react';
import { StyleSheet, Text } from 'react-native';
import useTheme from '../store/useTheme';

const Header = ({header}) => {
    const { colors, fSize } = useTheme();
    const styles = createStyles(colors, fSize);
    return (
        <Text style={styles.headerText}>
            {header}
        </Text>
    );
}

const createStyles = (colors, fSize) => StyleSheet.create({
    headerText: {
        color: colors.foreground,
        fontSize: fSize.screenTitle,
        fontFamily: 'Fraunces_400Regular',
    }
});

export default Header;
