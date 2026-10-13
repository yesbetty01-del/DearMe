import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import useTheme from '../../store/useTheme';
import Icon from '../icon';

const LetterSealAnimation = ({ visible, onComplete }) => {
    const { colors, spacing, fSize } = useTheme();
    const { width, height } = useWindowDimensions();
    const [animationFinished, setAnimationFinished] = useState(false);

    useEffect(() => {
        if (visible) setAnimationFinished(false);
    }, [visible]);

    useEffect(() => {
        if (!visible || !animationFinished) return undefined;

        const timeout = setTimeout(onComplete, 1500);
        return () => clearTimeout(timeout);
    }, [visible, animationFinished, onComplete]);

    return (
        <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
            <View style={[styles.screen, { backgroundColor: colors.background }]}>
                {visible && !animationFinished && <LottieView
                    source={require('../../../assets/Letter turns into paper plane and flies away.json')}
                    autoPlay
                    loop={false}
                    resizeMode="contain"
                    onAnimationFinish={(isCancelled) => {
                        if (!isCancelled) setAnimationFinished(true);
                    }}
                    style={{ width, height, alignSelf: 'center' }}
                />}
                {animationFinished && (
                    <View style={[styles.confirmation, { backgroundColor: colors.background}]}>
                        <Icon name="lock" color={colors.success} size={40} />
                        <Text style={{ color: colors.success, fontFamily: 'Fraunces_500Medium', fontSize: fSize.sectionTitle, marginTop: spacing.md }}>
                            Sealed
                        </Text>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    confirmation: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});

export default LetterSealAnimation;
