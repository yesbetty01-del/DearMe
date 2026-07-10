import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import useTheme from '../../store/useTheme';
import { router } from 'expo-router';

const WriteFab = ({onPress}) => {
    const { colors } = useTheme();
    const styles = CreateStyles(colors);
    return (
        <Pressable
            style={styles.fab}
            onPress={onPress}
        >
            <Feather name='edit-3' size={22} color={colors.onPrimary} />
        </Pressable>
    );
}

const CreateStyles = (colors) => StyleSheet.create({
    fab: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        //marginBottom: 15,
        position: 'absolute',
        left: '50%',
        transform: [{ translateX: -24 }],
        top: -10,
    }
})

export default WriteFab;
