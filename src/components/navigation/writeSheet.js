import { forwardRef, useMemo } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import OptionCard from '../optionCard';
import useTheme from '../../store/useTheme';

const WriteSheet = forwardRef((props, ref) => {
    const snapPoints = useMemo(() => ['35%'], []);
    const { colors } = useTheme();
    const handlePress = (route) => {
        ref.current?.dismiss();
        router.push(route);
    }
    return (
        <BottomSheetModal
            ref={ref}
            index={1}
            snapPoints={snapPoints}
            enablePanDownToClose
            backgroundStyle={{backgroundColor: colors.surface}}
        >
            <BottomSheetView style={{flex: 1, padding: 24}}>
                <Text style={{fontFamily: 'Fraunces_400Regular', fontSize: 20, color: colors.foreground, marginBottom: 24}}>
                    What would you like to write?
                </Text>
                <View style={styles.content}>
                    <OptionCard name={'book-open'} label={'Journal'} description={'Write a journal entry'} onPress={() => handlePress('/write/journal')} />
                    <OptionCard name={'send'} label={'Letter'} description={'Write a letter to your future self'} onPress={() => handlePress('/write/letter')} />
                </View>
            </BottomSheetView>

        </BottomSheetModal>
    )
})

const styles = StyleSheet.create({
    content: {
        flex: 1,
        gap: 24,
    }
})

export default WriteSheet;
