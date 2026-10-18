import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import useTheme from '../../store/useTheme';
import journalStore from '../../store/journalStore';
import { useLetters } from '../../store/letterStore';
import Header from '../../components/header';
import Icon from '../../components/icon';
import ConfirmationDialog from '../../components/confirmationDialog';
import OptionCard from '../../components/optionCard';
import { createBackupFile, inspectBackupFile, restoreBackupFile } from '../../utils/backup';
import { getItems, setItems } from '../../utils/storage';
import LoadingScreen from '../../components/loadingScreen';
import { useAuth, useClerk, useUser } from '@clerk/expo';
import { getAppLock } from '../../utils/appLock';
import { syncNow } from '../../utils/syncQueue';
import themes from '../../utils/colors';
import { THEME_CATALOG, getThemeAccessState } from '../../utils/themeCatalog';
import { unlockThemeWithRewardedAd } from '../../services/themeUnlockService';
import { requestReminderPermission, syncReminderNotifications } from '../../services/reminderNotifications';

const PROFILE_SETTINGS_KEY = 'profileSettings';
const DEFAULT_SETTINGS = {
    arrivalReminders: true,
    yearlyReminders: false,
    appLock: '',
    hideLockedLetters: false,
    autoSync: false,
};

const Profile = () => {
    const { colors, spacing, theme, setTheme, unlockedThemeIds, refreshUnlockedThemes } = useTheme();
    const journals = journalStore();
    const letters = useLetters();
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [busyAction, setBusyAction] = useState(null);
    const [infoModal, setInfoModal] = useState(null);
    const [restoreConfirmation, setRestoreConfirmation] = useState(null);
    const [themePickerVisible, setThemePickerVisible] = useState(false);
    const [unlockingThemeId, setUnlockingThemeId] = useState(null);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const busy = busyAction !== null;
    const styles = createStyles(colors, spacing);

    useEffect(() => {
        Promise.all([getItems(PROFILE_SETTINGS_KEY), getAppLock()])
            .then(([savedSettings, lock]) => {
                let persistedSettings = {};
                if (savedSettings) {
                    try {
                        persistedSettings = JSON.parse(savedSettings);
                    } catch (error) {
                        console.error('Could not load profile settings:', error);
                    }
                }
                setSettings({ ...DEFAULT_SETTINGS, ...persistedSettings, appLock: lock?.method || '' });
            })
            .catch((error) => console.error('Could not load profile settings:', error))
            .finally(() => setSettingsLoaded(true));
    }, []);

    useEffect(() => {
        if (!settingsLoaded || !settings.arrivalReminders || Platform.OS === 'web') return;
        requestReminderPermission()
            .then((permitted) => permitted && syncReminderNotifications())
            .catch((error) => console.error('Could not enable arrival reminders:', error));
    }, [settingsLoaded]);

    useFocusEffect(useCallback(() => {
        getAppLock()
            .then((lock) => setSettings((current) => ({ ...current, appLock: lock?.method || '' })))
            .catch((error) => console.error('Could not refresh app lock:', error));
    }, []));

    const updateSetting = (key, value) => {
        const nextSettings = { ...settings, [key]: value };
        setSettings(nextSettings);
        setItems(PROFILE_SETTINGS_KEY, JSON.stringify(nextSettings));
    };

    const handleReminderChange = async (key, enabled) => {
        if (enabled) {
            try {
                const permitted = await requestReminderPermission();
                if (!permitted) {
                    setInfoModal({
                        title: 'Notifications are off',
                        message: 'Allow notifications in your device settings to receive reminders.',
                        icon: 'bell-off',
                    });
                    return;
                }
            } catch (error) {
                console.error('Could not request notification permission:', error);
                setInfoModal({ title: 'Notifications unavailable', message: 'DearMe could not enable notifications on this device.', icon: 'alert-circle' });
                return;
            }
        }
        const nextSettings = { ...settings, [key]: enabled };
        setSettings(nextSettings);
        try {
            await setItems(PROFILE_SETTINGS_KEY, JSON.stringify(nextSettings));
            await syncReminderNotifications();
        } catch (error) {
            console.error('Could not save reminder settings:', error);
        }
    };

    const handleSyncNow = async () => {
        if (busyAction === 'sync') return;
        setBusyAction('sync');
        setInfoModal({
            title: 'Syncing your data',
            message: 'Your local writing is being synchronized with your account now.',
            icon: 'refresh-cw',
            pending: true,
        });
        try {
            await syncNow();
            setInfoModal({ title: 'Sync complete', message: 'Your local data is up to date.', icon: 'check-circle' });
        } catch (error) {
            setInfoModal({
                title: 'Sync could not be completed',
                message: error?.message || 'Please try again when you are online.',
                icon: 'alert-circle',
            });
        } finally {
            setBusyAction(null);
        }
    };

    const chooseAppLock = () => router.push('/app-lock');

    const handleAutoSyncChange = (enabled) => {
        if (!enabled) {
            updateSetting('autoSync', false);
            return;
        }
        if (!isSignedIn) {
            setInfoModal({
                title: 'Account required',
                message: 'Sign in or create an account to turn on automatic sync.',
                icon: 'user',
                actionLabel: 'Sign in or sign up',
                onAction: () => router.push('/account'),
            });
            return;
        }
        updateSetting('autoSync', true);
    };

    const handleThemeUnlock = async (themeId) => {
        if (unlockingThemeId) return;
        setUnlockingThemeId(themeId);
        try {
            const result = await unlockThemeWithRewardedAd(themeId);
            if (result.status === 'unlocked' || result.status === 'already-available') {
                await refreshUnlockedThemes();
                const unlockedTheme = THEME_CATALOG.find((option) => option.id === themeId);
                if (unlockedTheme) setTheme(unlockedTheme.key);
                setThemePickerVisible(false);
                return;
            }

            const messages = {
                unavailable: 'Rewarded ads are not available right now. This theme has not been unlocked.',
                failed: 'The ad could not be completed. This theme has not been unlocked.',
                'save-failed': 'Your theme unlock could not be saved on this device. Please try again.',
            };
            setInfoModal({
                title: result.status === 'unavailable' ? 'Ad unavailable' : 'Theme not unlocked',
                message: messages[result.status] || 'The theme could not be unlocked. Please try again.',
                icon: 'alert-circle',
            });
        } catch (error) {
            console.error('Could not unlock theme:', error);
            setInfoModal({ title: 'Theme not unlocked', message: 'The theme could not be unlocked. Please try again.', icon: 'alert-circle' });
        } finally {
            setUnlockingThemeId(null);
        }
    };

    const contactUs = async () => {
        const emailUrl = 'mailto:?subject=DearMe%20support';
        try {
            await Linking.openURL(emailUrl);
        } catch (error) {
            setInfoModal({ title: 'Contact Us', message: 'No email app is available on this device.', icon: 'mail' });
        }
    };

    const exportBackup = async () => {
        if (busy) return;
        setBusyAction('export');
        try {
            const file = await createBackupFile();
            if (Platform.OS === 'web') {
                const blob = new Blob([await file.bytes()], { type: 'application/vnd.dearme.backup' });
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = file.uri.split('/').pop() || 'DearMe-backup.dearme';
                link.click();
                setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
                return;
            }
            if (!await Sharing.isAvailableAsync()) throw new Error('File sharing is not available on this device.');
            await Sharing.shareAsync(file.uri, {
                mimeType: 'application/vnd.dearme.backup',
                dialogTitle: 'Save your DearMe backup',
                UTI: 'com.dearme.backup',
            });
        } catch (error) {
            setInfoModal({
                title: 'Backup could not be created',
                message: error?.message || 'Please try again.',
                icon: 'alert-circle',
            });
        } finally {
            setBusyAction(null);
        }
    };

    const chooseBackup = async () => {
        if (busy) return;
        setBusyAction('restore');
        try {
            const selection = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
                multiple: false,
            });
            if (selection.canceled || !selection.assets?.[0]) {
                setBusyAction(null);
                return;
            }

            const selectedFile = selection.assets[0].file || selection.assets[0].uri;
            const backup = await inspectBackupFile(selectedFile);
            const { journals, reflections, letters, replies } = backup.summary;
            const confirmation = `This backup contains ${journals} journals, ${reflections} reflections, ${letters} letters, and ${replies} replies. Restoring it will replace all DearMe writing on this device.`;
            setRestoreConfirmation({ selectedFile, message: confirmation });
        } catch (error) {
            setBusyAction(null);
            setInfoModal({
                title: 'Backup could not be opened',
                message: error?.message || 'Choose a valid DearMe backup file.',
                icon: 'alert-circle',
            });
        }
    };

    const restoreSelectedBackup = async () => {
        const selectedFile = restoreConfirmation?.selectedFile;
        if (!selectedFile) return;
        setRestoreConfirmation(null);
        try {
            const result = await restoreBackupFile(selectedFile);
            setInfoModal({
                title: 'Restore complete',
                message: `${result.journals} journals and ${result.letters} letters restored.`,
                icon: 'check-circle',
            });
        } catch (error) {
            setInfoModal({
                title: 'Restore failed',
                message: error?.message || 'Please try again.',
                icon: 'alert-circle',
            });
        } finally {
            setBusyAction(null);
        }
    };

    const moods = [
        { id: 'moodCalm', label: 'Calm', color: colors.moodCalm },
        { id: 'moodWarm', label: 'Warm', color: colors.moodWarm },
        { id: 'moodCloud', label: 'Cloudy', color: colors.moodCloud },
        { id: 'moodQuiet', label: 'Quiet', color: colors.moodQuiet },
        { id: 'moodAlive', label: 'Alive', color: colors.moodAlive },
        { id: 'moodBloom', label: 'Bloom', color: colors.moodBloom },
    ];
    const moodCounts = moods
        .map((mood) => ({
            ...mood,
            count: journals.filter((entry) => entry.moodColor === mood.id).length,
        }))
        .filter((mood) => mood.count > 0);
    const sealedCount = letters.filter((letter) => letter.status === 'scheduled').length;
    const openedCount = letters.filter((letter) => letter.status === 'delivered').length;
    const totalMoodEntries = moodCounts.reduce((total, mood) => total + mood.count, 0);

    if (!settingsLoaded) return <LoadingScreen />;

    return (
        <SafeAreaView edges={['top','left', 'right']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Header header="Profile" />
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Choose theme"
                        onPress={() => setThemePickerVisible(true)}
                        style={({ pressed }) => [styles.themeButton, pressed && styles.pressed]}
                    >
                        <Icon name="sun" color={colors.foreground} size={18} />
                    </Pressable>
                </View>

                {process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
                    ? <AccountPanel colors={colors} spacing={spacing} styles={styles} onAuthStateChange={setIsSignedIn} />
                    : <View style={styles.profileEmptyState}>
                        <View style={styles.profileEmptyIcon}><Icon name="user" color={colors.mutedForeground} size={20} /></View>
                        <Text style={styles.profileEmptyTitle}>Your profile</Text>
                        <Text style={styles.profileEmptyText}>Your writing is saved on this device. Add a Clerk publishable key to enable account syncing.</Text>
                    </View>}

                <View style={styles.pagesCard}>
                    <Text style={styles.cardTitle}>Your pages</Text>
                    <View style={styles.statsRow}>
                        <Stat value={journals.length} label={journals.length === 1 ? 'entry' : 'entries'} styles={styles} />
                        <Stat value={sealedCount} label="sealed" styles={styles} />
                        <Stat value={openedCount} label="opened" styles={styles} />
                    </View>
                    {totalMoodEntries > 0 && (
                        <>
                            <View style={styles.moodBar}>
                                {moodCounts.map((mood) => (
                                    <View
                                        key={mood.id}
                                        style={{ flex: mood.count, backgroundColor: mood.color }}
                                    />
                                ))}
                            </View>
                            <View style={styles.legend}>
                                {moodCounts.map((mood) => (
                                    <View key={mood.id} style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: mood.color }]} />
                                        <Text style={styles.legendText}>{mood.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </View>

                <SettingsSection title="Reminders" styles={styles}>
                    <SettingSwitch
                        icon="mail"
                        label="Letter arrival"
                        description="Get notified when a letter arrives"
                        value={settings.arrivalReminders}
                        onValueChange={(value) => handleReminderChange('arrivalReminders', value)}
                        colors={colors}
                        styles={styles}
                    />
                    <SettingSwitch
                        icon="calendar"
                        label="Year-old entries"
                        description="Get notified when an entry is one year old"
                        value={settings.yearlyReminders}
                        onValueChange={(value) => handleReminderChange('yearlyReminders', value)}
                        colors={colors}
                        styles={styles}
                    />
                </SettingsSection>

                <SettingsSection title="Privacy" styles={styles}>
                    <SettingButton
                        icon="lock"
                        label="App lock"
                        detail={settings.appLock || 'Off'}
                        onPress={chooseAppLock}
                        colors={colors}
                        styles={styles}
                    />
                    <SettingSwitch
                        icon="eye-off"
                        label="Hide locked letters"
                        description="Keep sealed letters out of your letters list"
                        value={settings.hideLockedLetters}
                        onValueChange={(value) => updateSetting('hideLockedLetters', value)}
                        colors={colors}
                        styles={styles}
                    />
                </SettingsSection>

                <SettingsSection title="Sync" styles={styles}>
                    <SettingSwitch
                        icon="refresh-cw"
                        label="Auto sync"
                        description="Sync your writing when you’re online"
                        value={settings.autoSync}
                        onValueChange={handleAutoSyncChange}
                        colors={colors}
                        styles={styles}
                    />
                    <SettingButton
                        icon="upload-cloud"
                        label={busyAction === 'sync' ? 'Syncing...' : 'Sync Now'}
                        onPress={handleSyncNow}
                        colors={colors}
                        styles={styles}
                    />
                </SettingsSection>

                <SettingsSection title="Appearance" styles={styles}>
                    <SettingButton
                        icon="sun"
                        label="Theme"
                        detail={THEME_CATALOG.find((option) => option.key === theme)?.name || 'Light'}
                        onPress={() => setThemePickerVisible(true)}
                        colors={colors}
                        styles={styles}
                    />
                </SettingsSection>

                <SettingsSection title="About and support" styles={styles}>
                    <SettingButton
                        icon="info"
                        label="About DearMe"
                        onPress={() => router.push('/about')}
                        colors={colors}
                        styles={styles}
                    />
                    <SettingButton
                        icon="mail"
                        label="Contact Us"
                        onPress={contactUs}
                        colors={colors}
                        styles={styles}
                    />
                </SettingsSection>

                <SettingsSection title="Your data" styles={styles}>
                    <View style={styles.backupOptions}>
                        <OptionCard
                            name="download"
                            label={busyAction === 'export' ? 'Preparing backup...' : 'Export backup'}
                            description="Save a portable copy of your writing and attachments."
                            onPress={exportBackup}
                            disabled={busy}
                        />
                        <OptionCard
                            name="upload"
                            label={busyAction === 'restore' ? 'Preparing restore...' : 'Restore backup'}
                            description="Replace this device data from a DearMe backup."
                            onPress={chooseBackup}
                            disabled={busy}
                        />
                    </View>
                </SettingsSection>

            </ScrollView>
            <ThemePicker
                visible={themePickerVisible}
                selectedTheme={theme}
                unlockedThemeIds={unlockedThemeIds}
                unlockingThemeId={unlockingThemeId}
                colors={colors}
                onSelect={(themeKey) => {
                    setTheme(themeKey);
                    setThemePickerVisible(false);
                }}
                onUnlock={handleThemeUnlock}
                onClose={() => setThemePickerVisible(false)}
            />
            <ConfirmationDialog
                visible={Boolean(restoreConfirmation)}
                title="Replace local data?"
                message={restoreConfirmation?.message || ''}
                confirmLabel="Replace and restore"
                icon="upload"
                confirmColor={colors.destructive}
                onCancel={() => {
                    setRestoreConfirmation(null);
                    setBusyAction(null);
                }}
                onConfirm={restoreSelectedBackup}
            />
            <FeedbackModal
                visible={Boolean(infoModal)}
                title={infoModal?.title || ''}
                message={infoModal?.message || ''}
                icon={infoModal?.icon || 'info'}
                pending={infoModal?.pending}
                actionLabel={infoModal?.actionLabel}
                onAction={infoModal?.onAction}
                onClose={() => setInfoModal(null)}
            />
        </SafeAreaView>
    );
};

const AccountPanel = ({ colors, spacing, styles, onAuthStateChange }) => {
    const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
    const { user } = useUser();
    const { signOut } = useClerk();
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);

    useEffect(() => {
        onAuthStateChange(isLoaded && isSignedIn);
    }, [isLoaded, isSignedIn, onAuthStateChange]);

    if (!isLoaded) return <LoadingScreen />;
    if (!isSignedIn) {
        return (
            <View style={styles.profileEmptyState}>
                <View style={styles.profileEmptyIcon}><Icon name="user" color={colors.mutedForeground} size={20} /></View>
                <Text style={styles.profileEmptyTitle}>Your profile</Text>
                <Text style={styles.profileEmptyText}>Create an account to sync your writing and access it on your other devices.</Text>
                <Pressable onPress={() => router.push('/account')} style={{ marginTop: spacing.md, padding: spacing.sm }}>
                    <Text style={{ color: colors.primary, fontFamily: 'Inter_500Medium' }}>Sign in or create an account</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <>
            <View style={styles.profileEmptyState}>
                <View style={styles.profileEmptyIcon}><Icon name="user" color={colors.primary} size={20} /></View>
                <Text style={styles.profileEmptyTitle}>{user?.fullName || 'Your account'}</Text>
                <Text style={styles.profileEmptyText}>{user?.primaryEmailAddress?.emailAddress || 'Your account is connected.'}</Text>
            </View>
            <Pressable onPress={() => setShowSignOutDialog(true)} style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}>
                <Icon name="log-out" color={colors.destructive} size={16} />
                <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
            <ConfirmationDialog
                visible={showSignOutDialog}
                title="Sign out of DearMe?"
                message="Your journal entries and letters will stay on this device."
                confirmLabel="Sign out"
                icon="log-out"
                confirmColor={colors.destructive}
                onCancel={() => setShowSignOutDialog(false)}
                onConfirm={async () => {
                    await signOut();
                    setShowSignOutDialog(false);
                }}
            />
        </>
    );
};

const Stat = ({ value, label, styles }) => (
    <View style={styles.stat}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const SettingsSection = ({ title, styles, children }) => (
    <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.settingsCard}>{children}</View>
    </View>
);

const ThemePicker = ({ visible, selectedTheme, unlockedThemeIds, unlockingThemeId, colors, onSelect, onUnlock, onClose }) => {
    const styles = createThemePickerStyles(colors);

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Choose your theme</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel="Close theme picker" onPress={onClose} style={styles.closeButton}>
                        <Icon name="x" color={colors.foreground} size={19} />
                    </Pressable>
                </View>
                <Text style={styles.subtitle}>The whole journal changes as you choose.</Text>
                <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
                    {THEME_CATALOG.map((option) => {
                        const palette = themes[option.key];
                        const accessState = getThemeAccessState(option, unlockedThemeIds);
                        const selected = selectedTheme === option.key;
                        const isUnlocking = unlockingThemeId === option.id;
                        return (
                            <View
                                key={option.id}
                                style={[styles.themeCard, selected && styles.selectedCard]}
                            >
                                <Pressable
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: selected, disabled: accessState === 'locked' }}
                                    onPress={() => accessState !== 'locked' && onSelect(option.key)}
                                    style={[styles.preview, { backgroundColor: palette.background }]}
                                >
                                    <View style={[styles.previewPaper, { backgroundColor: palette.surface }]}>
                                        <View style={[styles.previewHeading, { backgroundColor: palette.primary }]} />
                                        <View style={[styles.previewLine, { backgroundColor: palette.primary }]} />
                                        <View style={[styles.previewShortLine, { backgroundColor: palette.primary }]} />
                                    </View>
                                    <View style={styles.swatches}>
                                        <View style={[styles.swatch, { backgroundColor: palette.accent }]} />
                                        <View style={[styles.swatch, styles.mainSwatch, { backgroundColor: palette.primary }]} />
                                    </View>
                                    {selected && <View style={[styles.check, { backgroundColor: palette.primary }]}><Icon name="check" color={palette.onPrimary} size={12} /></View>}
                                    {accessState === 'locked' && <View style={styles.lockBadge}><Icon name="lock" color={colors.foreground} size={11} /></View>}
                                </Pressable>
                                <Text style={styles.themeName}>{option.name}</Text>
                                <Text style={styles.themeNote}>{option.note}</Text>
                                {accessState === 'locked' ? (
                                    <Pressable
                                        accessibilityRole="button"
                                        disabled={Boolean(unlockingThemeId)}
                                        onPress={() => onUnlock(option.id)}
                                        style={({ pressed }) => [styles.unlockButton, { backgroundColor: colors.primary, opacity: isUnlocking ? 0.65 : pressed ? 0.8 : 1 }]}
                                    >
                                        <Icon name="play-circle" color={colors.onPrimary} size={14} />
                                        <Text style={[styles.unlockLabel, { color: colors.onPrimary }]}>{isUnlocking ? 'Loading ad...' : 'Watch ad to unlock'}</Text>
                                    </Pressable>
                                ) : (
                                    <Text style={styles.accessLabel}>{accessState === 'free' ? 'Free' : 'Unlocked'}</Text>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const createThemePickerStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 22 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
    title: { color: colors.foreground, fontSize: 25, fontFamily: 'Fraunces_400Regular' },
    closeButton: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    subtitle: { color: colors.mutedForeground, fontSize: 13, marginTop: 6, marginBottom: 18 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 28 },
    themeCard: { width: '48%', marginBottom: 14, padding: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 17, backgroundColor: colors.surface },
    selectedCard: { borderColor: colors.primary, borderWidth: 2 },
    preview: { height: 124, borderRadius: 11, padding: 10, overflow: 'hidden' },
    previewPaper: { borderRadius: 8, padding: 10 },
    previewHeading: { width: 42, height: 6, borderRadius: 3, opacity: 0.85 },
    previewLine: { height: 4, marginTop: 9, borderRadius: 2, opacity: 0.18 },
    previewShortLine: { width: '72%', height: 4, marginTop: 5, borderRadius: 2, opacity: 0.18 },
    swatches: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 9 },
    swatch: { width: 15, height: 15, borderRadius: 8 },
    mainSwatch: { flex: 1, borderRadius: 8 },
    check: { position: 'absolute', top: 7, right: 7, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    lockBadge: { position: 'absolute', right: 7, bottom: 7, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    themeName: { color: colors.foreground, fontSize: 15, fontFamily: 'Fraunces_400Regular', marginTop: 9, marginHorizontal: 2 },
    themeNote: { minHeight: 30, color: colors.mutedForeground, fontSize: 10, lineHeight: 14, marginTop: 2, marginHorizontal: 2 },
    unlockButton: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 10, marginTop: 7, paddingHorizontal: 5 },
    unlockLabel: { fontSize: 9, fontFamily: 'Inter_500Medium' },
    accessLabel: { minHeight: 32, color: colors.mutedForeground, fontSize: 10, paddingTop: 10, paddingHorizontal: 2 },
});

const FeedbackModal = ({ visible, title, message, icon, pending = false, actionLabel, onAction, onClose }) => {
    const { colors, spacing, fSize } = useTheme();
    const styles = createFeedbackModalStyles(colors, spacing, fSize);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => { if (!pending) onClose(); }}
        >
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <View style={styles.iconWrap}>
                        <Icon name={icon} color={colors.primary} size={21} />
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    {!pending && (
                        <>
                            {actionLabel && (
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => {
                                        onClose();
                                        onAction?.();
                                    }}
                                    style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                                >
                                    <Text style={styles.closeLabel}>{actionLabel}</Text>
                                </Pressable>
                            )}
                            <Pressable
                                accessibilityRole="button"
                                onPress={onClose}
                                style={({ pressed }) => [styles.closeButton, actionLabel && styles.secondaryButton, pressed && styles.pressed]}
                            >
                                <Text style={[styles.closeLabel, actionLabel && styles.secondaryLabel]}>{actionLabel ? 'Not now' : 'Close'}</Text>
                            </Pressable>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const createFeedbackModalStyles = (colors, spacing, fSize) => StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.overlay,
    },
    dialog: {
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
        padding: spacing.xl,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        backgroundColor: colors.secondary,
    },
    title: { color: colors.foreground, fontFamily: 'Fraunces_400Regular', fontSize: fSize.cardTitle, textAlign: 'center' },
    message: {
        color: colors.mutedForeground,
        fontSize: fSize.secondary,
        lineHeight: fSize.secondary * 1.5,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    closeButton: {
        minHeight: 46,
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xl,
        borderRadius: 14,
        backgroundColor: colors.primary,
    },
    closeLabel: { color: colors.onPrimary, fontFamily: 'Inter_500Medium', fontSize: fSize.secondary },
    secondaryButton: { marginTop: spacing.sm, backgroundColor: 'transparent' },
    secondaryLabel: { color: colors.mutedForeground },
    pressed: { opacity: 0.78 },
});

const SettingSwitch = ({ icon, label, description, value, onValueChange, colors, styles }) => (
    <View style={styles.settingRow}>
        <View style={styles.settingIcon}><Icon name={icon} color={colors.primary} size={15} /></View>
        <View style={styles.settingCopy}>
            <Text style={styles.settingLabel}>{label}</Text>
            <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: colors.borderStrong, true: colors.primary }}
            thumbColor={colors.surface}
        />
    </View>
);

const SettingButton = ({ icon, label, detail, onPress, colors, styles }) => (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>
        <View style={styles.settingIcon}><Icon name={icon} color={colors.primary} size={15} /></View>
        <Text style={[styles.settingLabel, styles.settingCopy]}>{label}</Text>
        <Text style={styles.settingDetail}>{detail}</Text>
        <Icon name="chevron-right" size={15} />
    </Pressable>
);

const createStyles = (colors, spacing) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: spacing.sm,
        },
        themeButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
        },
        pressed: { opacity: 0.65 },
        profileEmptyState: {
            alignItems: 'center',
            marginTop: spacing.xl,
            marginBottom: spacing.xl,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            backgroundColor: colors.surface,
        },
        profileEmptyIcon: {
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceAlt,
        },
        profileEmptyTitle: {
            color: colors.foreground,
            fontSize: 16,
            fontFamily: 'Fraunces_400Regular',
            marginTop: spacing.sm,
        },
        profileEmptyText: {
            color: colors.mutedForeground,
            fontSize: 12,
            lineHeight: 18,
            textAlign: 'center',
            marginTop: spacing.xs,
        },
        pagesCard: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: spacing.md,
        },
        cardTitle: {
            color: colors.mutedForeground,
            fontSize: 12,
            letterSpacing: 2,
            textTransform: 'uppercase',
        },
        statsRow: {
            flexDirection: 'row',
            marginTop: spacing.md,
        },
        stat: { flex: 1 },
        statValue: {
            color: colors.foreground,
            fontSize: 23,
            fontFamily: 'Fraunces_400Regular',
        },
        statLabel: {
            color: colors.mutedForeground,
            fontSize: 12,
            marginTop: 2,
        },
        moodBar: {
            height: 6,
            flexDirection: 'row',
            overflow: 'hidden',
            borderRadius: 3,
            marginTop: spacing.md,
        },
        legend: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            columnGap: spacing.sm,
            rowGap: spacing.xs,
            marginTop: spacing.sm,
        },
        legendItem: { flexDirection: 'row', alignItems: 'center' },
        legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
        legendText: { color: colors.mutedForeground, fontSize: 11 },
        settingsSection: { marginTop: spacing.xl },
        sectionTitle: {
            color: colors.mutedForeground,
            fontSize: 12,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: spacing.sm,
        },
        settingsCard: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            overflow: 'hidden',
        },
        settingRow: {
            minHeight: 58,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.divider,
        },
        settingIcon: {
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: colors.secondary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.md,
        },
        settingCopy: { flex: 1 },
        settingLabel: { color: colors.foreground, fontSize: 14 },
        settingDescription: { color: colors.mutedForeground, fontSize: 11, marginTop: 3 },
        settingDetail: { color: colors.mutedForeground, fontSize: 12, marginRight: spacing.xs },
        backupOptions: { padding: spacing.md, gap: spacing.md },
        signOut: {
            minHeight: 48,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: spacing.sm,
            marginTop: spacing.xl,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
        },
        signOutText: { color: colors.destructive, fontSize: 14 },
    });
};

export default Profile;
