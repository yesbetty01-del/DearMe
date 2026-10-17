import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import useTheme from '../store/useTheme';
import Icon from './icon';
import { getDeliveryDateKey, toLocalDateKey } from '../store/letterStore';
import { parseCalendarDate } from '../utils/date';

const ArrivedLetterCard = ({ letter }) => {
    const { colors, fSize, spacing } = useTheme();
    const deliveredToday = getDeliveryDateKey(letter?.deliveryDate) === toLocalDateKey(new Date());
    const writtenDate = parseCalendarDate(letter?.writtenDate)?.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }) || '';

    if (!deliveredToday) {
        return null;
    }

    return (
        <View>
            
            <Pressable onPress={() => router.push(`/letter/${letter.id}`)} style={{
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
                    backgroundColor: colors.deliveredBag,
                    alignSelf: 'flex-start',
                    marginBottom: spacing.sm,
                    borderRadius: spacing.xs
                }}>
                    <Text style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 11,
                        color: colors.mutedForeground,
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
                        {writtenDate}
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
