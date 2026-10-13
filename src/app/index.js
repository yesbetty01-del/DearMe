import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import useTheme from '../store/useTheme';

const moods = [
    { name: 'calm', color: '#7a9b8e' },
    { name: 'warm', color: '#d99a5b' },
    { name: 'cloudy', color: '#8a94a6' },
    { name: 'quiet', color: '#6b6f8c' },
    { name: 'alive', color: '#c66b52' },
];

export default function Splash() {
    const router = useRouter();
    const { colors } = useTheme();
    const moodAnimations = useRef(moods.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        const timer = setTimeout(() => router.replace('/(tabs)'), 3000);
        return () => clearTimeout(timer);
    }, [router]);

    useEffect(() => {
        const animation = Animated.parallel(
            moodAnimations.map((value, index) =>
                Animated.timing(value, {
                    toValue: 1,
                    delay: 1300 + index * 100,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ),
        );

        animation.start();
        return () => animation.stop();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.iconContainer}>
                <Ionicons name="mail" size={45} color="#DBDDD7" />
                <MaterialIcons name="eco" size={50} color="#72604D" style={styles.topIcon} />
            </View>

            <Text style={[styles.title, { color: colors.primary }]}>DearMe</Text>

            <View style={styles.moods} accessibilityLabel="Five moods">
                {moods.map((mood, index) => (
                    <Animated.View
                        key={mood.name}
                        accessibilityLabel={mood.name}
                        style={[
                            styles.moodDot,
                            { backgroundColor: mood.color },
                            {
                                opacity: moodAnimations[index],
                                transform: [{
                                    translateY: moodAnimations[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [6, 0],
                                    })
                                }],
                            },
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topIcon: {
        position: 'absolute',
        top: 5,
    },
    title: {
        fontSize: 55,
        lineHeight: 66,
        marginTop: 24,
        fontFamily: 'Fraunces_500Medium',
    },
    moods: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 24,
    },
    moodDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
