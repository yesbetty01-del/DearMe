import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import useTheme from '../../store/useTheme';
import journalStore from '../../store/journalStore';
import { useLetters } from '../../store/letterStore';
import Header from '../../components/header';
import Icon from '../../components/icon';
import ConfirmationDialog from '../../components/confirmationDialog';
import { getItems, setItems } from '../../utils/storage';

const PROFILE_SETTINGS_KEY = 'profileSettings';
const DEFAULT_SETTINGS = {
    arrivalReminders: false,
    yearlyReminders: false,
    appLock: '',
    hideLockedLetters: false,
};

const Profile = () => {
    const { colors, spacing, theme, toggleTheme } = useTheme();
    const journals = journalStore();
    const letters = useLetters();
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const styles = createStyles(colors, spacing);

    useEffect(() => {
        getItems(PROFILE_SETTINGS_KEY).then((savedSettings) => {
            if (!savedSettings) return;
            try {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
            } catch (error) {
                console.error('Could not load profile settings:', error);
            }
        });
    }, []);

    const updateSetting = (key, value) => {
        const nextSettings = { ...settings, [key]: value };
        setSettings(nextSettings);
        setItems(PROFILE_SETTINGS_KEY, JSON.stringify(nextSettings));
    };

    const chooseAppLock = () => Alert.alert('App lock', 'Choose a lock method', [
        ...['PIN', 'Password', 'Biometrics', 'Pattern'].map((method) => ({
            text: method,
            onPress: () => updateSetting('appLock', method),
        })),
        { text: 'Cancel', style: 'cancel' },
    ]);

    const signOut = async () => {
        await setItems('onboardingCompleted', 'false');
        setShowSignOutDialog(false);
        router.replace('/onboarding');
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

    return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Header header="Profile" />
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                    onPress={toggleTheme}
                    style={({ pressed }) => [styles.themeButton, pressed && styles.pressed]}
                >
                    <Icon name={theme === 'light' ? 'moon' : 'sun'} color={colors.foreground} size={18} />
                </Pressable>
            </View>

            <View style={styles.profileRow}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' }}
                    style={styles.avatar}
                    accessibilityLabel="Sophie"
                />
                <View>
                    <Text style={styles.name}>Sophie</Text>
                    <Text style={styles.caption}>Writing since March 2024</Text>
                </View>
            </View>

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
                    description="Get notified when a letter is ready to open"
                    value={settings.arrivalReminders}
                    onValueChange={(value) => updateSetting('arrivalReminders', value)}
                    colors={colors}
                    styles={styles}
                />
                <SettingSwitch
                    icon="calendar"
                    label="Year-old entries"
                    description="A reminder when an entry reaches its anniversary"
                    value={settings.yearlyReminders}
                    onValueChange={(value) => updateSetting('yearlyReminders', value)}
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

            <SettingsSection title="Appearance" styles={styles}>
                <SettingButton
                    icon={theme === 'light' ? 'moon' : 'sun'}
                    label="Theme"
                    detail={theme === 'light' ? 'Light' : 'Dark'}
                    onPress={toggleTheme}
                    colors={colors}
                    styles={styles}
                />
            </SettingsSection>

            <Pressable onPress={() => setShowSignOutDialog(true)} style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}>
                <Icon name="log-out" color={colors.destructive} size={16} />
                <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          </ScrollView>
          <ConfirmationDialog
              visible={showSignOutDialog}
              title="Sign out of DearMe?"
              message="You’ll return to the welcome screens. Your journal entries and letters will stay on this device."
              confirmLabel="Sign out"
              icon="log-out"
              confirmColor={colors.destructive}
              onCancel={() => setShowSignOutDialog(false)}
              onConfirm={signOut}
          />
        </SafeAreaView>
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

const createStyles = (colors, spacing) => StyleSheet.create({
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
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: spacing.md,
        backgroundColor: colors.surfaceAlt,
    },
    name: {
        color: colors.foreground,
        fontSize: 18,
        fontFamily: 'Fraunces_400Regular',
    },
    caption: {
        color: colors.mutedForeground,
        fontSize: 12,
        marginTop: 3,
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

export default Profile;
