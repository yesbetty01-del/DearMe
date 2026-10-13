import { StyleSheet, Text, View } from 'react-native';
import Illustration from './Illustration';

export default function OnboardingSlide({ slide, colors, artHeight, step }) {
    return (
        <View style={styles.slide}>
            <View
                style={[
                    styles.artFrame,
                    {
                        height: artHeight,
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <Illustration type={slide.illustration} colors={colors} />
            </View>

            <View style={styles.copy}>
                <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
                    {String(step + 1).padStart(2, '0')} - {slide.eyebrow}
                </Text>
                <Text style={[styles.title, { color: colors.foreground }]}>
                    {slide.titleParts.map((part, index) => (
                        <Text
                            key={`${part.text}-${index}`}
                            style={part.emphasis ? styles.titleEmphasis : null}
                        >
                            {part.text}
                        </Text>
                    ))}
                </Text>
                <Text style={[styles.body, { color: colors.mutedForeground }]}>
                    {slide.body}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        paddingTop: 20,
    },
    artFrame: {
        marginHorizontal: 24,
        borderRadius: 28,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    copy: {
        paddingHorizontal: 32,
        paddingTop: 28,
    },
    eyebrow: {
        fontFamily: 'Inter_500Medium',
        fontSize: 10,
        letterSpacing: 2.8,
        textTransform: 'uppercase',
    },
    title: {
        marginTop: 12,
        fontFamily: 'Fraunces_400Regular',
        fontSize: 32,
        lineHeight: 36,
        letterSpacing: -0.4,
    },
    titleEmphasis: {
        fontFamily: 'Fraunces_300Light',
    },
    body: {
        marginTop: 12,
        fontFamily: 'Inter_300Light',
        fontSize: 14,
        lineHeight: 22,
    },
});
