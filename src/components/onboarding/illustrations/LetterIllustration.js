import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ease = Easing.bezier(0.32, 0.72, 0, 1);

export default function LetterIllustration({ colors }) {
    const envelopeEntrance = useRef(new Animated.Value(0)).current;
    const foldEntrance = useRef(new Animated.Value(0)).current;
    const lockEntrance = useRef(new Animated.Value(0)).current;
    const countdownEntrance = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(envelopeEntrance, {
            toValue: 1,
            duration: 700,
            easing: ease,
            useNativeDriver: true,
        }).start();

        Animated.sequence([
            Animated.delay(300),
            Animated.timing(foldEntrance, {
                toValue: 1,
                duration: 800,
                easing: ease,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.sequence([
            Animated.delay(900),
            Animated.spring(lockEntrance, {
                toValue: 1,
                useNativeDriver: true,
                stiffness: 260,
                damping: 13,
            }),
        ]).start();

        Animated.sequence([
            Animated.delay(1100),
            Animated.timing(countdownEntrance, {
                toValue: 1,
                duration: 600,
                easing: ease,
                useNativeDriver: true,
            }),
        ]).start();
    }, [countdownEntrance, envelopeEntrance, foldEntrance, lockEntrance]);

    const envelopeStyle = {
        backgroundColor: colors.primary,
        opacity: envelopeEntrance,
        transform: [
            {
                translateY: envelopeEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                }),
            },
        ],
    };
    const countdownStyle = {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        opacity: countdownEntrance,
        transform: [
            {
                translateY: countdownEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                }),
            },
            {
                rotate: countdownEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-4deg'],
                }),
            },
        ],
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.envelope, envelopeStyle]}>
                <Animated.View
                    style={[
                        styles.foldLeft,
                        {
                            transform: [
                                { rotate: '36.6deg' },
                                { scaleX: foldEntrance },
                            ],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.foldRight,
                        {
                            transform: [
                                { rotate: '-36.6deg' },
                                { scaleX: foldEntrance },
                            ],
                        },
                    ]}
                />
                <Animated.View
                    style={[styles.lockBadge, { transform: [{ scale: lockEntrance }] }]}
                >
                    <Ionicons name="lock-closed-outline" size={17} color="#f5f1e8" />
                </Animated.View>
            </Animated.View>

            <Animated.View style={[styles.countdown, countdownStyle]}>
                <Text style={[styles.date, { color: colors.mutedForeground }]}>OPENS IN</Text>
                <Text style={[styles.countdownDays, { color: colors.foreground }]}>
                    209 <Text style={styles.days}>days</Text>
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 260,
        height: 260,
        alignItems: 'center',
        justifyContent: 'center',
    },
    envelope: {
        width: 210,
        height: 150,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
    },
    foldLeft: {
        position: 'absolute',
        left: -4,
        top: 47,
        width: 121,
        height: 1.5,
        backgroundColor: 'rgba(245,241,232,0.55)',
    },
    foldRight: {
        position: 'absolute',
        left: 93,
        top: 47,
        width: 121,
        height: 1.5,
        backgroundColor: 'rgba(245,241,232,0.55)',
    },
    lockBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#c66b52',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    countdown: {
        position: 'absolute',
        bottom: 8,
        right: 0,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        elevation: 4,
    },
    date: {
        fontFamily: 'Inter_500Medium',
        fontSize: 9,
        letterSpacing: 1.5,
    },
    countdownDays: {
        marginTop: 2,
        fontFamily: 'Fraunces_400Regular',
        fontSize: 22,
    },
    days: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: '#8a8472',
    },
});
