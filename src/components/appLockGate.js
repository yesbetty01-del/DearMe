import { useCallback, useEffect, useState } from 'react';
import { AppState, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import useTheme from '../store/useTheme';
import { getAppLock, saveAppLock, verifyAppLock } from '../utils/appLock';
import PasswordField from './passwordField';

const METHODS = ['PIN', 'Password', 'Biometrics'];

export default function AppLockGate() {
    const { colors } = useTheme();
    const router = useRouter();
    const params = useGlobalSearchParams();
    const pathname = usePathname();
    const [lock, setLock] = useState(undefined);
    const [credential, setCredential] = useState('');
    const [pattern, setPattern] = useState([]);
    const [firstCredential, setFirstCredential] = useState(null);
    const [message, setMessage] = useState('');
    const [locked, setLocked] = useState(false);
    const [setupMethod, setSetupMethod] = useState(null);

    const refreshLock = useCallback(async () => {
        const saved = await getAppLock();
        setLock(saved);
        setLocked(Boolean(saved));
    }, []);
    const reloadLock = useCallback(async () => {
        const saved = await getAppLock();
        setLock(saved);
        if (!saved) setLocked(false);
    }, []);

    useEffect(() => { refreshLock().catch((error) => console.error('Could not read app lock:', error)); }, [refreshLock]);
    useEffect(() => { reloadLock().catch((error) => console.error('Could not refresh app lock:', error)); }, [pathname, reloadLock]);

    useEffect(() => {
        let wasBackgrounded = false;
        const subscription = AppState.addEventListener('change', (state) => {
            if (state !== 'active') wasBackgrounded = true;
            else if (wasBackgrounded) {
                wasBackgrounded = false;
                refreshLock().catch((error) => console.error('Could not refresh app lock:', error));
            }
        });
        return () => subscription.remove();
    }, [refreshLock]);

    useEffect(() => {
        if (lock?.method !== 'Biometrics' || !locked) return;
        let active = true;
        LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock DearMe', cancelLabel: 'Cancel' })
            .then((result) => { if (active && result.success) setLocked(false); })
            .catch((error) => setMessage(error?.message || 'Biometric unlock is unavailable.'));
        return () => { active = false; };
    }, [lock, locked]);

    useEffect(() => {
        const method = params.lockMethod;
        if (METHODS.includes(method)) setSetupMethod(method);
        else setSetupMethod(null);
    }, [params.lockMethod]);

    const finishSetup = async (value) => {
        if (setupMethod === 'PIN' && !/^\d{4}$/.test(value)) { setMessage('Enter all four digits.'); return; }
        if (setupMethod === 'Password' && value.length < 6) { setMessage('Use at least six characters.'); return; }
        if (!firstCredential) {
            setFirstCredential(value);
            setCredential('');
            setMessage('Enter it again to confirm.');
            return;
        }
        if (firstCredential !== value) {
            setFirstCredential(null);
            setCredential('');
            setMessage('Those did not match. Start again.');
            return;
        }
        try {
            await saveAppLock(setupMethod, value);
        } catch (error) {
            setMessage(error?.message || 'The lock could not be saved. Please try again.');
            return;
        }
        setSetupMethod(null);
        setCredential('');
        setFirstCredential(null);
        setMessage('');
        await reloadLock();
        router.back();
    };

    const authenticateBiometrics = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock DearMe', cancelLabel: 'Cancel' });
            if (result.success) { setLocked(false); setMessage(''); }
        } catch (error) {
            setMessage(error?.message || 'Biometric unlock is unavailable.');
        }
    };

    const unlock = async () => {
        return unlockCredential(credential);
    };

    const unlockCredential = async (value) => {
        if (lock?.method === 'Pattern') value = pattern.join(',');
        if (await verifyAppLock(value)) {
            setLocked(false);
            setCredential('');
            setPattern([]);
            setMessage('');
        } else {
            setCredential('');
            setPattern([]);
            setMessage('That did not match. Try again.');
        }
    };

    if (setupMethod) {
        if (setupMethod === 'PIN') {
            return <PinLockScreen
                colors={colors}
                title={firstCredential ? 'Confirm your PIN' : 'Choose a PIN'}
                subtitle={firstCredential ? 'Enter the same four digits again.' : "Four digits you'll remember."}
                message={message}
                value={credential}
                onChange={setCredential}
                onComplete={finishSetup}
                onCancel={() => { setSetupMethod(null); setFirstCredential(null); setCredential(''); setMessage(''); router.back(); }}
            />;
        }
        return <LockSurface colors={colors} title="Set up password" message={message}>
            <PasswordField colors={colors} value={credential} onChangeText={setCredential} onSubmitEditing={() => finishSetup(credential)} placeholder={firstCredential ? 'Enter password again' : 'At least 6 characters'} />
            <ActionButton colors={colors} label={firstCredential ? 'Save password' : 'Continue'} onPress={() => finishSetup(credential)} />
            <Pressable accessibilityRole="button" onPress={() => { setSetupMethod(null); setFirstCredential(null); setCredential(''); setMessage(''); router.back(); }} style={styles.cancelButton}>
                <Text style={[styles.cancel, { color: colors.mutedForeground }]}>Cancel</Text>
            </Pressable>
        </LockSurface>;
    }

    if (lock === undefined) return <LockSurface colors={colors} title="Preparing DearMe" message="" />;
    if (!locked) return null;
    if (lock.method === 'PIN') {
        return <PinLockScreen colors={colors} title="Enter your PIN" subtitle="Enter your four-digit PIN." message={message} value={credential} onChange={setCredential} onComplete={unlockCredential} />;
    }
    return <LockSurface colors={colors} title={lock.method === 'Pattern' ? 'Draw your pattern' : lock.method === 'Password' ? 'Enter your password' : 'Welcome back'} message={message}>
        {lock.method === 'Pattern' ? <PatternGrid colors={colors} pattern={pattern} onSelect={(index) => setPattern((current) => current.includes(index) ? current : [...current, index])} onClear={() => setPattern([])} /> : lock.method === 'Password' ? (
            <PasswordField colors={colors} value={credential} onChangeText={setCredential} onSubmitEditing={unlock} placeholder="Password" />
        ) : null}
        {lock.method === 'Biometrics'
            ? <ActionButton colors={colors} label="Try biometrics" onPress={authenticateBiometrics} />
            : <ActionButton colors={colors} label="Unlock" onPress={unlock} />}
    </LockSurface>;
}

export function PinLockScreen({ colors, title, subtitle, message, value, onChange, onComplete, onCancel }) {
    const handleChange = (nextValue) => {
        onChange(nextValue);
        if (nextValue.length === 4) onComplete(nextValue);
    };

    return <SafeAreaView style={[styles.pinScreen, { backgroundColor: colors.background }]}>
        <View style={styles.pinNavigation}>
            {onCancel ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onCancel} style={[styles.pinBack, { borderColor: colors.border }]}>
                    <Feather name="chevron-left" size={18} color={colors.foreground} />
                </Pressable>
            ) : <View style={styles.pinBackPlaceholder} />}
        </View>
        <View style={styles.pinHeader}>
            <Text style={[styles.pinLabel, { color: colors.primary }]}>PIN</Text>
            <Text style={[styles.pinTitle, { color: colors.foreground }]}>{title}</Text>
            {subtitle ? <Text style={[styles.pinSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
            {message ? <Text style={[styles.message, { color: colors.destructive }]}>{message}</Text> : null}
            <PinDots colors={colors} value={value} />
        </View>
        <PinPad colors={colors} value={value} onChange={handleChange} fullScreen />
    </SafeAreaView>;
}

function LockSurface({ colors, title, message, children }) {
    return <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.lockContent}>
                    <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
                    {message ? <Text style={[styles.message, { color: colors.destructive }]}>{message}</Text> : null}
                    {children}
                </View>
            </ScrollView>
        </SafeAreaView>
    </KeyboardAvoidingView>;
}

function PinDots({ colors, value }) {
    return <View style={styles.pinDots} accessibilityLabel={value.length + ' of 4 digits entered'}>
        {Array.from({ length: 4 }, (_, index) => (
            <View key={index} style={[styles.pinDot, { borderColor: colors.foreground, backgroundColor: index < value.length ? colors.foreground : 'transparent' }]} />
        ))}
    </View>;
}

export function PinPad({ colors, value, onChange, fullScreen = false }) {
    const addDigit = (digit) => onChange(value.length < 4 ? value + digit : value);
    const rows = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], [null, '0', 'delete']];

    return (
        <View style={[styles.keypad, fullScreen && styles.keypadFullScreen]}>
            {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={[styles.keypadRow, fullScreen && styles.keypadRowFullScreen]}>
                    {row.map((key, columnIndex) => key ? (
                        <Pressable
                            key={key}
                            accessibilityRole="button"
                            accessibilityLabel={key === 'delete' ? 'Delete last digit' : key === 'clear' ? 'Clear PIN' : key}
                            onPress={() => key === 'delete' ? onChange(value.slice(0, -1)) : addDigit(key)}
                            style={({ pressed }) => [styles.key, fullScreen && styles.keyFullScreen, pressed && styles.keyPressed]}
                        >
                            <View style={[styles.keySurface, fullScreen ? styles.pinKeySurface : { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={[styles.keyText, key === 'delete' ? styles.utilityKeyText : null, { color: key === 'delete' ? colors.mutedForeground : colors.foreground }]}>
                                    {key === 'delete' ? 'Delete' : key}
                                </Text>
                            </View>
                        </Pressable>
                    ) : <View key={`empty-${rowIndex}-${columnIndex}`} style={[styles.key, fullScreen && styles.keyFullScreen]} />)}
                </View>
            ))}
        </View>
    );
}

export function PatternGrid({ colors, pattern, onSelect, onClear }) {
    return <View style={styles.patternContainer}>
        <View style={styles.patternGrid}>
            {Array.from({ length: 9 }, (_, index) => <Pressable key={index} accessibilityRole="button" accessibilityLabel={`Pattern dot ${index + 1}`} onPress={() => onSelect(index)} style={[styles.patternDot, { borderColor: colors.primary, backgroundColor: pattern.includes(index) ? colors.primary : colors.surface }]} />)}
        </View>
        {onClear && pattern.length > 0 ? <Pressable accessibilityRole="button" onPress={onClear} style={styles.patternClear}><Text style={{ color: colors.mutedForeground }}>Clear pattern</Text></Pressable> : null}
    </View>;
}

function ActionButton({ colors, label, onPress }) {
    return <Pressable onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, opacity: pressed ? 0.75 : 1 }]}><Text style={[styles.buttonText, { color: colors.onPrimary }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
    container: { ...StyleSheet.absoluteFillObject, zIndex: 20 },
    safeArea: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
    lockContent: { width: '100%', maxWidth: 440, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
    title: { fontSize: 25, fontFamily: 'Fraunces_400Regular', marginBottom: 18, textAlign: 'center' },
    message: { textAlign: 'center', marginBottom: 14, fontSize: 13 },
    button: { minWidth: 180, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 24, alignItems: 'center', marginTop: 16 },
    buttonText: { fontFamily: 'Inter_500Medium', fontSize: 14 },
    cancelButton: { marginTop: 8, padding: 10 },
    cancel: { padding: 4 },
    pinScreen: { ...StyleSheet.absoluteFillObject, zIndex: 20 },
    pinNavigation: { height: 42, justifyContent: 'center', paddingHorizontal: 16 },
    pinBack: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    pinBackText: { fontSize: 22, lineHeight: 24 },
    pinBackPlaceholder: { width: 30, height: 30 },
    pinHeader: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 16 },
    pinLabel: { fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 9 },
    pinTitle: { fontSize: 23, fontFamily: 'Fraunces_400Regular', textAlign: 'center' },
    pinSubtitle: { fontSize: 12, marginTop: 5 },
    pinDots: { flexDirection: 'row', gap: 13, minHeight: 12, alignItems: 'center', justifyContent: 'center', marginTop: 34 },
    pinDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 1 },
    keypad: { width: 240, alignSelf: 'center', gap: 8, marginTop: 34 },
    keypadRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
    keypadFullScreen: { width: '100%', flex: 1, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 16, gap: 2 },
    keypadRowFullScreen: { flex: 1, gap: 0 },
    key: { width: 68, height: 54, alignItems: 'center', justifyContent: 'center' },
    keyFullScreen: { flex: 1 },
    keyPressed: { opacity: 0.68 },
    keySurface: { flex: 1, borderWidth: 1, borderRadius: 18, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', margin: 3 },
    pinKeySurface: { backgroundColor: 'transparent', borderWidth: 0, borderRadius: 0, margin: 0 },
    keyText: { fontSize: 20, fontFamily: 'Fraunces_500Medium' },
    utilityKeyText: { fontSize: 12 },
    patternContainer: { alignItems: 'center' },
    patternGrid: { width: 210, height: 210, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-around' },
    patternDot: { width: 42, height: 42, borderWidth: 2, borderRadius: 21, margin: 14 },
    patternClear: { padding: 8 },
});
