import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import useTheme from '../store/useTheme';
import Icon from '../components/icon';
import PasswordField from '../components/passwordField';
import { PatternGrid, PinLockScreen } from '../components/appLockGate';
import { clearAppLock, getAppLock, saveAppLock, verifyAppLock } from '../utils/appLock';

const methods = [
    { id: 'PIN', icon: 'hash', title: 'PIN', description: 'A private 4-digit code entered with an on-screen keypad.' },
    { id: 'Password', icon: 'key', title: 'Password', description: 'Use a password with letters, numbers, and symbols.' },
    { id: 'Biometrics', icon: 'smartphone', title: 'Biometrics', description: 'Unlock with Face ID, Touch ID, or your fingerprint.' },
];

export default function AppLockSettings() {
    const { colors, spacing } = useTheme();
    const [lock, setLock] = useState(undefined);
    const [message, setMessage] = useState('');
    const [pendingAction, setPendingAction] = useState(null);
    const [confirmCredential, setConfirmCredential] = useState('');
    const [confirmPattern, setConfirmPattern] = useState([]);
    const styles = createStyles(colors, spacing);

    const refreshLock = useCallback(async () => {
        const savedLock = await getAppLock();
        setLock(savedLock);
    }, []);

    useFocusEffect(useCallback(() => {
        refreshLock().catch((error) => {
            console.error('Could not read app lock:', error);
            setMessage('Your lock settings could not be loaded.');
            setLock(null);
        });
    }, [refreshLock]));

    const applyMethod = async (method) => {
        setMessage('');
        if (method === 'Biometrics') {
            try {
                const available = await LocalAuthentication.hasHardwareAsync() && await LocalAuthentication.isEnrolledAsync();
                if (!available) {
                    setMessage('Set up Face ID, Touch ID, or a fingerprint in your device settings first.');
                    return;
                }
                await saveAppLock(method);
                await refreshLock();
            } catch (error) {
                setMessage(error?.message || 'Biometric lock could not be enabled.');
            }
            return;
        }

        router.push({ pathname: '/app-lock/setup', params: { lockMethod: method } });
    };

    const finishAction = async (action) => {
        setPendingAction(null);
        setConfirmCredential('');
        setConfirmPattern([]);
        setMessage('');

        if (action.type === 'remove') {
            try {
                await clearAppLock();
                setLock(null);
                setMessage('App lock removed.');
            } catch (error) {
                setMessage(error?.message || 'App lock could not be removed.');
            }
            return;
        }

        await applyMethod(action.method);
    };

    const beginAction = async (action) => {
        setMessage('');
        if (lock?.method === 'Biometrics') {
            try {
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: action.type === 'remove' ? 'Confirm removal of app lock' : 'Confirm your current app lock',
                    cancelLabel: 'Cancel',
                });
                if (result.success) await finishAction(action);
            } catch (error) {
                setMessage(error?.message || 'Confirmation failed.');
            }
            return;
        }

        setConfirmCredential('');
        setConfirmPattern([]);
        setPendingAction(action);
    };

    const confirmCurrentLock = async (enteredCredential) => {
        try {
            const credential = lock?.method === 'Pattern' ? confirmPattern.join(',') : enteredCredential;
            const valid = await verifyAppLock(credential);
            if (!valid) {
                setConfirmCredential('');
                setConfirmPattern([]);
                setMessage('That did not match. Try again.');
                return;
            }
            await finishAction(pendingAction);
        } catch (error) {
            setMessage(error?.message || 'Could not verify your current lock.');
        }
    };

    const cancelAction = () => {
        setPendingAction(null);
        setConfirmCredential('');
        setConfirmPattern([]);
        setMessage('');
    };

    const selectMethod = (method) => lock
        ? beginAction({ type: 'change', method })
        : applyMethod(method);
    const removeLock = () => beginAction({ type: 'remove' });

    if (pendingAction && lock?.method === 'PIN') {
        return <PinLockScreen
            colors={colors}
            title={pendingAction.type === 'remove' ? 'Remove app lock?' : 'Confirm your PIN'}
            subtitle={pendingAction.type === 'remove' ? 'Enter your PIN to remove app lock.' : 'Enter your current PIN to continue.'}
            message={message}
            value={confirmCredential}
            onChange={setConfirmCredential}
            onComplete={confirmCurrentLock}
            onCancel={cancelAction}
        />;
    }

    return (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
                    <Icon name="arrow-left" color={colors.foreground} size={18} />
                    <Text style={styles.backText}>Profile</Text>
                </Pressable>

                <Text style={styles.title}>App lock</Text>
                <Text style={styles.intro}>Choose how you would like to protect your private writing on this device.</Text>

                {lock ? (
                    <View style={styles.currentLock}>
                        <View style={styles.currentCopy}>
                            <Text style={styles.currentLabel}>CURRENT LOCK</Text>
                            <Text style={styles.currentMethod}>{lock.method === 'Pattern' ? 'Pattern (existing)' : lock.method}</Text>
                        </View>
                        <Pressable accessibilityRole="button" onPress={removeLock} style={styles.removeButton}>
                            <Text style={styles.removeText}>Remove lock</Text>
                        </Pressable>
                    </View>
                ) : null}

                {pendingAction && lock ? (
                    <View style={styles.confirmPanel}>
                        <Text style={styles.confirmTitle}>
                            {pendingAction.type === 'remove' ? 'Confirm your current lock to remove it.' : 'Confirm your current lock to continue.'}
                        </Text>
                        {lock.method === 'Password' ? (
                            <PasswordField colors={colors} value={confirmCredential} onChangeText={setConfirmCredential} onSubmitEditing={() => confirmCurrentLock(confirmCredential)} placeholder="Current password" />
                        ) : (
                            <PatternGrid colors={colors} pattern={confirmPattern} onSelect={(index) => setConfirmPattern((current) => current.includes(index) ? current : [...current, index])} onClear={() => setConfirmPattern([])} />
                        )}
                        <View style={styles.confirmActions}>
                            <Pressable accessibilityRole="button" onPress={cancelAction} style={styles.cancelButton}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </Pressable>
                            <Pressable accessibilityRole="button" onPress={() => confirmCurrentLock(confirmCredential)} style={styles.confirmButton}>
                                <Text style={styles.confirmButtonText}>Confirm</Text>
                            </Pressable>
                        </View>
                        {message ? <Text style={styles.message}>{message}</Text> : null}
                    </View>
                ) : null}

                <Text style={styles.sectionTitle}>{lock ? 'Change lock method' : 'Choose a lock method'}</Text>
                <View style={styles.methods}>
                    {methods.map((method) => (
                        <Pressable
                            key={method.id}
                            accessibilityRole="button"
                            disabled={lock === undefined}
                            onPress={() => selectMethod(method.id)}
                            style={({ pressed }) => [styles.methodRow, lock === undefined && styles.disabled, pressed && styles.pressed]}
                        >
                            <View style={styles.methodIcon}>
                                <Icon name={method.icon} color={colors.primary} size={18} />
                            </View>
                            <View style={styles.methodCopy}>
                                <Text style={styles.methodTitle}>{method.title}</Text>
                                <Text style={styles.methodDescription}>{method.description}</Text>
                            </View>
                            <Icon name="chevron-right" color={colors.mutedForeground} size={16} />
                        </Pressable>
                    ))}
                </View>

                {message && !pendingAction ? <Text style={styles.message}>{message}</Text> : null}
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const createStyles = (colors, spacing) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
    backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.sm, paddingVertical: spacing.md },
    backText: { color: colors.foreground, fontSize: 13 },
    title: { color: colors.foreground, fontSize: 32, fontFamily: 'Fraunces_400Regular', marginTop: spacing.md },
    intro: { color: colors.mutedForeground, fontSize: 14, lineHeight: 21, marginTop: spacing.xs, marginBottom: spacing.xl },
    currentLock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, marginBottom: spacing.xl, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    currentCopy: { gap: 4 },
    currentLabel: { color: colors.mutedForeground, fontSize: 10, letterSpacing: 1.5 },
    currentMethod: { color: colors.foreground, fontSize: 16, fontFamily: 'Fraunces_400Regular' },
    removeButton: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
    removeText: { color: colors.destructive, fontSize: 12 },
    confirmPanel: { alignItems: 'center', padding: spacing.md, marginBottom: spacing.xl, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    confirmTitle: { color: colors.foreground, fontSize: 14, lineHeight: 20, fontFamily: 'Inter_500Medium', textAlign: 'center', marginBottom: spacing.md },
    confirmActions: { width: '100%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
    cancelButton: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
    cancelText: { color: colors.mutedForeground, fontSize: 13 },
    confirmButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, backgroundColor: colors.destructive },
    confirmButtonText: { color: colors.destructiveFg, fontSize: 13, fontFamily: 'Inter_500Medium' },
    sectionTitle: { color: colors.mutedForeground, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: spacing.sm },
    methods: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface },
    methodRow: { minHeight: 80, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
    pressed: { opacity: 0.68 },
    disabled: { opacity: 0.45 },
    methodIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md, backgroundColor: colors.secondary },
    methodCopy: { flex: 1, marginRight: spacing.sm },
    methodTitle: { color: colors.foreground, fontSize: 14, fontFamily: 'Inter_500Medium' },
    methodDescription: { color: colors.mutedForeground, fontSize: 11, lineHeight: 16, marginTop: 3 },
    message: { color: colors.destructive, fontSize: 12, lineHeight: 18, marginTop: spacing.md },
});
