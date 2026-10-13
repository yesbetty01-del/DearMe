import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ease = Easing.bezier(0.32, 0.72, 0, 1);
const lineWidths = [1, 0.88, 0.94, 0.6];

export default function JournalIllustration({ colors }) {
    const entrance = useRef(new Animated.Value(0)).current;
    const lineEntrances = useRef(lineWidths.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        Animated.timing(entrance, {
            toValue: 1,
            duration: 800,
            easing: ease,
            useNativeDriver: true,
        }).start();

        Animated.sequence([
            Animated.delay(500),
            Animated.stagger(
                150,
                lineEntrances.map((value) =>
                    Animated.timing(value, {
                        toValue: 1,
                        duration: 600,
                        easing: ease,
                        useNativeDriver: true,
                    }),
                ),
            ),
        ]).start();
    }, [entrance, lineEntrances]);

    const backPageStyle = {
        backgroundColor: colors.secondary,
        borderColor: colors.border,
        opacity: entrance,
        transform: [
            {
                translateX: entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-22, -9],
                }),
            },
            { rotate: '-7deg' },
        ],
    };
    const frontPageStyle = {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        opacity: entrance,
        transform: [
            {
                translateX: entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [22, 7],
                }),
            },
            {
                translateY: entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                }),
            },
            { rotate: '4deg' },
        ],
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.backPage, backPageStyle]} />
            <Animated.View style={[styles.frontPage, frontPageStyle]}>
                <Text style={[styles.date, { color: colors.mutedForeground }]}>JUN 05</Text>
                <Text style={[styles.pageTitle, { color: colors.foreground }]}>
                    A quiet kind of joy
                </Text>
                {lineWidths.map((width, index) => (
                    <Animated.View
                        key={width}
                        style={[
                            styles.pageLine,
                            {
                                width: `${width * 100}%`,
                                backgroundColor: colors.borderStrong,
                                opacity: lineEntrances[index],
                                transform: [{ scaleX: lineEntrances[index] }],
                            },
                        ]}
                    />
                ))}
                <View style={[styles.penBadge, { backgroundColor: colors.primary }]}>
                    <Feather name="edit-3" size={14} color={colors.onPrimary} />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 240,
        height: 260,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backPage: {
        position: 'absolute',
        width: 170,
        height: 220,
        borderRadius: 16,
        borderWidth: 1,
    },
    frontPage: {
        width: 170,
        height: 220,
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
    },
    date: {
        fontFamily: 'Inter_500Medium',
        fontSize: 9,
        letterSpacing: 1.5,
    },
    pageTitle: {
        marginTop: 8,
        fontFamily: 'Fraunces_400Regular',
        fontSize: 17,
        lineHeight: 21,
    },
    pageLine: {
        height: 3,
        marginTop: 10,
        borderRadius: 2,
    },
    penBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        marginTop: 'auto',
    },
});
