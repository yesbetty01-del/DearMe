import {useState} from 'react';
import { StyleSheet, View, Text, Modal, Pressable } from 'react-native';
import useTheme from '../../store/useTheme';
import Icon from '../icon';

const ScheduleConfirmation = ({visible, onClose}) => {
    const { colors, spacing, fSize } = useTheme();
    return (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <Modal
                visible={visible}
                animationType="slide"
                transparent={true}
                onRequestClose={onClose}
            >
                <View style={[styles.overlay, {backgroundColor: colors.overlay}]}>
                    <View style={[styles.modal, {backgroundColor: colors.surface}]}>
                        <View style={{
                            backgroundColor:colors.accent,
                            padding: spacing.md,
                            borderRadius: 9999
                        }}>
                            <Icon name={'lock'} color={colors.primaryHover} />
                        </View>                        
                        <Text style={{
                            fontFamily: 'Fraunces_500Medium',
                            fontSize: fSize.body,
                            color: colors.foreground,
                            marginTop: spacing.md
                        }}>
                            Seal this letter?
                        </Text>
                        <Text style={{
                            fontFamily: 'Inter_400Regular',
                            fontSize: fSize.secondary,
                            marginTop: spacing.md,
                            color: colors.mutedForeground,
                            textAlign: 'center'
                        }}>
                            Once sealed, you won't be able to read or edit this letter until the arrival date.
                        </Text>
                        <Pressable
                            style={{
                                marginTop: spacing.xl,
                                backgroundColor: colors.primary,
                                paddingVertical: spacing.sm,
                                width: '100%',
                                alignItems: 'center',
                                borderRadius: spacing.lg,
                            }}
                        >
                            <Text style={{color: colors.onPrimary}}>
                                Seal Letter
                            </Text>
                        </Pressable>
                        <Pressable
                            style={{
                                marginTop: spacing.md,
                            }}
                            onPress={onClose}
                        >
                            <Text style={{
                                color: colors.mutedForeground
                            }}>Keep editing</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        alignItems: 'center',
        width: '85%',
        padding: 24,
        borderRadius: 12,
    },
})

export default ScheduleConfirmation;
