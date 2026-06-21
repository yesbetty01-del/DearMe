import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import useTheme from '../store/useTheme';
import Icon from './icon';

const ArrivedLetterCard = ({ letter }) => {
    const { colors, fSize, spacing } = useTheme();

    return (
        <View>
            
            <Pressable style={{
                marginTop: spacing.lg,
                padding: spacing.xl,
                borderRadius: spacing.md,
                backgroundColor: colors.surface,
                borderWidth: 0.5,
                borderColor: colors.border,
            }} >
                <View style={{
                    paddingVertical: spacing.xs,
                    paddingHorizontal: spacing.md,
                    backgroundColor: colors.success,
                    alignSelf: 'flex-start',
                    marginBottom: spacing.sm,
                    borderRadius: spacing.xs
                }}>
                    <Text style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 11,
                        color: colors.onPrimary,
                        letterSpacing: 1.2
                    }}>
                        DELIVERED TODAY
                    </Text>
                </View>
                <Text style={{
                    fontFamily: 'Fraunces_400Regular',
                    fontSize: fSize.cardTitle,
                    color: colors.foreground
                }}>
                    {letter?.title}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md }}>
                    <Text style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 10,
                        color: colors.mutedForeground,
                        letterSpacing: 1.2
                    }} >
                        SENT MAR 14, 2025
                    </Text>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={{
                            fontFamily: 'Inter_500Medium',
                            fontSize: fSize.caption,
                            color: colors.primary
                        }}>
                            Read & reply
                        </Text>
                        <Icon name={'chevron-right'} color={colors.primary} />
                    </View>

                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({})

export default ArrivedLetterCard;
