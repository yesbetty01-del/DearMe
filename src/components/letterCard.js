import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import useTheme from '../store/useTheme';
import Icon from './icon';
import { router } from 'expo-router';
import { letterStore } from '../store/letterStore';

const LetterCard = ({ id, title, status, content, deliveryDate, writtenDate }) => {
    const { colors, fSize, spacing } = useTheme();

    return (
        <View>

            <Pressable
                onPress={() => router.push(`letter/${id}`)}
                style={{
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
                    backgroundColor: status === 'scheduled' ? colors.scheduledBag : colors.deliveredBag,
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
                        {status === 'scheduled' ? 'FUTURE LETTER' : 'DELIVERED'}
                    </Text>
                </View>
                <Text style={{
                    fontFamily: 'Fraunces_400Regular',
                    fontSize: fSize.cardTitle,
                    color: colors.foreground
                }}>
                    {title}
                </Text>
                {status === 'delivered' && (
                    <Text numberOfLines={2} style={{
                        fontFamily: 'Fraunces_400Regular',
                        fontSize: fSize.secondary,
                        color: colors.mutedForeground
                    }}>
                        {content}
                    </Text>
                )}
                <View style={{ width: '100%', height: 1, backgroundColor: colors.divider, marginVertical: 10 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ gap: spacing.xs }}>
                        <Text style={{
                            fontFamily: 'Inter_500Medium',
                            fontSize: fSize.caption,
                            color: colors.mutedForeground,
                            letterSpacing: 1.2
                        }} >
                            {status === 'scheduled' ? 'ARRIVES' : 'OPENED'}
                        </Text>
                        <Text style={{
                            fontFamily: 'Inter_500Medium',
                            fontSize: fSize.secondary,
                            color: colors.foreground,
                        }} >
                            {deliveryDate}
                        </Text>
                    </View>
                    <View style={{ gap: spacing.xs }}>
                        <Text style={{
                            fontFamily: 'Inter_500Medium',
                            fontSize: fSize.caption,
                            color: colors.mutedForeground,
                            letterSpacing: 1.2,
                            alignSelf: 'flex-end'
                        }}>
                            WRITTEN
                        </Text>
                        <Text style={{
                            fontFamily: 'Inter_500Medium',
                            fontSize: fSize.secondary,
                            color: colors.foreground,
                        }}>{writtenDate}</Text>
                    </View>
                </View>

            </Pressable >
        </View >
    );
}

const styles = StyleSheet.create({})

export default LetterCard;
