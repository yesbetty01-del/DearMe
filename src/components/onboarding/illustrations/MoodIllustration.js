import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const moods = [
    { id: 'calm', color: '#7a9b8e', icon: 'smile' },
    { id: 'warm', color: '#d99a5b', icon: 'sun' },
    { id: 'cloudy', color: '#8a94a6', icon: 'cloud' },
    { id: 'quiet', color: '#6b6f8c', icon: 'moon' },
    { id: 'alive', color: '#c66b52', icon: 'flame' },
];

function MoodIcon({ name }) {
    if (name === 'flame') {
        return <Ionicons name="flame-outline" size={20} color="#ffffff" />;
    }

    return <Feather name={name} size={20} color="#ffffff" />;
}

export default function MoodIllustration({ colors }) {
    const labelEntrance = useRef(new Animated.Value(0)).current;
    const moodEntrances = useRef(moods.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(100),
            Animated.stagger(
                80,
                moodEntrances.map((value) =>
                    Animated.spring(value, {
                        toValue: 1,
                        useNativeDriver: true,
                        stiffness: 180,
                        damping: 16,
                    }),
                ),
            ),
        ]).start();

        Animated.timing(labelEntrance, {
            toValue: 1,
            delay: 600,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [labelEntrance, moodEntrances]);

    return (
        <View style={styles.container}>
            {moods.map((mood, index) => {
                const angle = (index / moods.length) * Math.PI * 2 - Math.PI / 2;
                const entrance = moodEntrances[index];
                const moodStyle = {
                    backgroundColor: mood.color,
                    shadowColor: mood.color,
                    opacity: entrance,
                    transform: [
                        {
                            translateX: entrance.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, Math.cos(angle) * 92],
                            }),
                        },
                        {
                            translateY: entrance.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, Math.sin(angle) * 92],
                            }),
                        },
                        {
                            scale: entrance.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.4, 1],
                            }),
                        },
                    ],
                };

                return (
                    <Animated.View key={mood.id} style={[styles.moodDot, moodStyle]}>
                        <MoodIcon name={mood.icon} />
                    </Animated.View>
                );
            })}
            <Animated.Text
                style={[styles.label, { color: colors.foreground, opacity: labelEntrance }]}
            >
                {'how does\ntoday feel?'}
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 254,
        height: 270,
        alignItems: 'center',
        justifyContent: 'center',
    },
    moodDot: {
        position: 'absolute',
        left: 99,
        top: 107,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 50,
        shadowOpacity: 0.45,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 10 },
    },
    label: {
        textAlign: 'center',
        fontFamily: 'Fraunces_400Regular',
        fontSize: 19,
        lineHeight: 23,
    },
});
