import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const ease = Easing.bezier(0.32, 0.72, 0, 1);
const threadPoints = [
    { x: 104, y: 123 },
    { x: 107, y: 137 },
    { x: 114, y: 150 },
    { x: 125, y: 160 },
    { x: 139, y: 168 },
    { x: 155, y: 177 },
    { x: 171, y: 190 },
];
const replyLineWidths = [92, 70];

export default function ReplyIllustration({ colors }) {
    const pastLetterEntrance = useRef(new Animated.Value(0)).current;
    const replyEntrance = useRef(new Animated.Value(0)).current;
    const threadProgress = useRef(new Animated.Value(0)).current;
    const lineEntrances = useRef(replyLineWidths.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        Animated.timing(pastLetterEntrance, {
            toValue: 1,
            duration: 700,
            easing: ease,
            useNativeDriver: true,
        }).start();

        Animated.sequence([
            Animated.delay(500),
            Animated.timing(replyEntrance, {
                toValue: 1,
                duration: 700,
                easing: ease,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.sequence([
            Animated.delay(400),
            Animated.timing(threadProgress, {
                toValue: 1,
                duration: 600,
                easing: ease,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.sequence([
            Animated.delay(1000),
            Animated.stagger(
                150,
                lineEntrances.map((value) =>
                    Animated.timing(value, {
                        toValue: 1,
                        duration: 500,
                        easing: ease,
                        useNativeDriver: true,
                    }),
                ),
            ),
        ]).start();
    }, [lineEntrances, pastLetterEntrance, replyEntrance, threadProgress]);

    const pastLetterStyle = {
        backgroundColor: colors.secondary,
        borderColor: colors.border,
        opacity: pastLetterEntrance,
        transform: [
            {
                translateY: pastLetterEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                }),
            },
            {
                rotate: pastLetterEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-3deg'],
                }),
            },
        ],
    };
    const todayReplyStyle = {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        opacity: replyEntrance,
        transform: [
            {
                translateY: replyEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                }),
            },
            {
                rotate: replyEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '2deg'],
                }),
            },
        ],
    };

    return (
        <View style={styles.container}>
            {threadPoints.map((point, index) => {
                const opacity = threadProgress.interpolate({
                    inputRange: [index / threadPoints.length, (index + 1) / threadPoints.length],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                });

                return (
                    <Animated.View
                        key={`${point.x}-${point.y}`}
                        style={[
                            styles.threadDot,
                            {
                                left: point.x,
                                top: point.y,
                                backgroundColor: colors.primary,
                                opacity,
                            },
                        ]}
                    />
                );
            })}

            <Animated.View style={[styles.pastLetter, pastLetterStyle]}>
                <View style={styles.replyMeta}>
                    <Ionicons name="mail-open-outline" size={12} color={colors.primary} />
                    <Text style={[styles.replyEyebrow, { color: colors.primary }]}>
                        Opened Apr 12
                    </Text>
                </View>
                <Text style={[styles.pastQuote, { color: colors.foreground }]}>
                    "I hope it was less bad than you thought. It usually is."
                </Text>
                <Text style={[styles.pastSignoff, { color: colors.mutedForeground }]}>
                    - You, six months ago
                </Text>
            </Animated.View>

            <Animated.View style={[styles.todayReply, todayReplyStyle]}>
                <View style={styles.replyMeta}>
                    <Feather
                        name="corner-down-right"
                        size={12}
                        color={colors.mutedForeground}
                    />
                    <Text style={[styles.replyEyebrow, { color: colors.mutedForeground }]}>
                        Your reply
                    </Text>
                </View>
                <Text style={[styles.todayQuote, { color: colors.foreground }]}>
                    Dear past me - you were right.
                </Text>
                {replyLineWidths.map((width, index) => (
                    <Animated.View
                        key={width}
                        style={[
                            styles.replyLine,
                            {
                                width: `${width}%`,
                                backgroundColor: colors.borderStrong,
                                opacity: lineEntrances[index],
                                transform: [{ scaleX: lineEntrances[index] }],
                            },
                        ]}
                    />
                ))}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 300,
        height: 300,
    },
    threadDot: {
        position: 'absolute',
        width: 3,
        height: 3,
        borderRadius: 2,
        zIndex: 2,
    },
    pastLetter: {
        position: 'absolute',
        top: 10,
        left: 8,
        width: 210,
        padding: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 16,
        zIndex: 1,
    },
    todayReply: {
        position: 'absolute',
        right: 8,
        bottom: 8,
        width: 210,
        padding: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 16,
        elevation: 5,
        zIndex: 3,
    },
    replyMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    replyEyebrow: {
        fontFamily: 'Inter_500Medium',
        fontSize: 9,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    pastQuote: {
        marginTop: 8,
        fontFamily: 'Fraunces_400Regular',
        fontSize: 14,
        fontStyle: 'italic',
        lineHeight: 18,
    },
    pastSignoff: {
        marginTop: 8,
        fontFamily: 'Inter_400Regular',
        fontSize: 10,
    },
    todayQuote: {
        marginTop: 8,
        fontFamily: 'Fraunces_400Regular',
        fontSize: 14,
        lineHeight: 18,
    },
    replyLine: {
        height: 3,
        marginTop: 8,
        borderRadius: 2,
        alignSelf: 'flex-start',
    },
});
