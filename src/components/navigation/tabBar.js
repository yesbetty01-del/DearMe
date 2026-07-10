import { useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import useTheme from '../../store/useTheme';
import WriteFab from './writeFab';
import WriteSheet from './writeSheet';

const TabBar = ({ state, descriptors, navigation, props }) => {
    const { colors } = useTheme();
    const styles = CreateStyles(colors);
    const activeRoute = state.routes[state.index].name;
    const bottomSheetModalRef = useRef(null);
    const writeSheet = () => {
        bottomSheetModalRef.current?.present();
    };

    return (
        <>
            <View style={styles.container}>
                <Pressable
                    style={styles.tab}
                    onPress={() => navigation.navigate('index')}
                >
                    <Feather name="book" size={22} color={activeRoute === 'index' ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.label, activeRoute === 'index' && styles.activeLabel,]}>
                        Home
                    </Text>
                </Pressable>
                <Pressable
                    style={styles.tab}
                    onPress={() => navigation.navigate('journal')}
                >
                    <Feather name="book-open" size={22} color={activeRoute === 'journal' ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.label, activeRoute === 'journal' && styles.activeLabel,]}>
                        Journal
                    </Text>
                </Pressable>
                <View style={{ flex: 1 }} />
                <Pressable
                    style={styles.tab}
                    onPress={() => navigation.navigate('letters')}
                >
                    <Feather name="mail" size={22} color={activeRoute === 'letters' ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.label, activeRoute === 'letters' && styles.activeLabel,]}>
                        Letters
                    </Text>
                </Pressable>
                <Pressable
                    style={styles.tab}
                    onPress={() => navigation.navigate('profile')}
                >
                    <Feather name="user" size={22} color={activeRoute === 'profile' ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.label, activeRoute === 'profile' && styles.activeLabel,]}>
                        Profile
                    </Text>
                </Pressable>
                <WriteFab onPress={writeSheet} />

            </View>
            <WriteSheet ref={bottomSheetModalRef} />
        </>
    )
}
const CreateStyles = (colors) => StyleSheet.create({
    container: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: colors.surface,
        borderTopWidth: 0.5,
        borderTopColor: colors.divider,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    label: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    activeLabel: {
        color: colors.primary
    }
})

export default TabBar;