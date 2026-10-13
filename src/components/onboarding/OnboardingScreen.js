import { useMemo, useState } from 'react';
import {
    PanResponder,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import useTheme from '../../store/useTheme';
import { setItems } from '../../utils/storage';
import onboardingSlides from '../../data/onboardingSlides';
import OnboardingSlide from './OnboardingSlide';

export default function OnboardingScreen() {
    const [step, setStep] = useState(0);
    const { colors } = useTheme();
    const router = useRouter();
    const { height } = useWindowDimensions();
    const slide = onboardingSlides[step];
    const isLastSlide = step === onboardingSlides.length - 1;
    const artHeight = Math.max(250, Math.min(340, height * 0.39));

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, gesture) =>
                    Math.abs(gesture.dx) > 15 &&
                    Math.abs(gesture.dx) > Math.abs(gesture.dy),
                onPanResponderRelease: (_, gesture) => {
                    if (gesture.dx < -60 && step < onboardingSlides.length - 1) {
                        setStep(step + 1);
                    }
                    if (gesture.dx > 60 && step > 0) {
                        setStep(step - 1);
                    }
                },
            }),
        [step],
    );

    const finishOnboarding = async () => {
        await setItems('onboardingCompleted', 'true');
        router.replace('/(tabs)');
    };

    const handleNext = () => {
        if (isLastSlide) {
            finishOnboarding();
            return;
        }

        setStep(step + 1);
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={['top', 'bottom']}
        >
            <View style={styles.topBar}>
                <Text style={[styles.brand, { color: colors.foreground }]}>
                    Dear<Text style={styles.brandEmphasis}>Me</Text>
                </Text>
                {!isLastSlide && (
                    <Pressable onPress={finishOnboarding} hitSlop={12}>
                        <Text style={[styles.skipButton, { color: colors.mutedForeground }]}>
                            Skip
                        </Text>
                    </Pressable>
                )}
            </View>

            <View style={styles.slideContainer} {...panResponder.panHandlers}>
                <OnboardingSlide
                    key={slide.illustration}
                    slide={slide}
                    step={step}
                    colors={colors}
                    artHeight={artHeight}
                />
            </View>

            <View style={styles.footer}>
                <View
                    style={styles.pagination}
                    accessibilityLabel={`Step ${step + 1} of ${onboardingSlides.length}`}
                >
                    {onboardingSlides.map((item, index) => {
                        const isActive = index === step;
                        const indicatorStyle = {
                            backgroundColor: isActive ? colors.primary : `${colors.primary}33`,
                            width: isActive ? 24 : 6,
                        };

                        return (
                            <Pressable
                                key={item.eyebrow}
                                onPress={() => setStep(index)}
                                accessibilityRole="button"
                                accessibilityLabel={`Go to step ${index + 1}`}
                                accessibilityState={{ selected: isActive }}
                                style={[styles.pageIndicator, indicatorStyle]}
                            />
                        );
                    })}
                </View>

                <Pressable
                    onPress={handleNext}
                    accessibilityRole="button"
                    accessibilityLabel={isLastSlide ? 'Begin writing' : 'Next'}
                    style={[
                        styles.nextButton,
                        {
                            backgroundColor: colors.primary,
                            paddingHorizontal: isLastSlide ? 20 : 0,
                        },
                    ]}
                >
                    {isLastSlide && (
                        <Text style={[styles.nextLabel, { color: colors.onPrimary }]}>
                            Begin writing
                        </Text>
                    )}
                    <Feather name="arrow-right" size={17} color={colors.onPrimary} />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        height: 46,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    brand: {
        fontFamily: 'Fraunces_400Regular',
        fontSize: 20,
    },
    brandEmphasis: {
        fontStyle: 'italic',
    },
    skipButton: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
    },
    slideContainer: {
        flex: 1,
    },
    footer: {
        paddingHorizontal: 32,
        paddingTop: 12,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pageIndicator: {
        height: 6,
        borderRadius: 3,
    },
    nextButton: {
        height: 48,
        minWidth: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 10,
    },
    nextLabel: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
    },
});
