import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getItems } from '../utils/storage';
import { getJournalSnapshot } from '../store/journalStore';
import { getLetterSnapshot } from '../store/letterStore';

const PROFILE_SETTINGS_KEY = 'profileSettings';
const REMINDER_TAG = 'dearme-reminder';
const MAX_SCHEDULED_REMINDERS = 60;
const ANDROID_REMINDER_CHANNEL_ID = 'dearme-reminders';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const requestReminderPermission = async () => {
    if (Platform.OS === 'web') return false;
    await configureAndroidReminderChannel();
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (current.status === 'denied' && current.canAskAgain === false) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
};

export const enableArrivalNotificationForLetter = async () => {
    if (Platform.OS === 'web') return false;

    try {
        const savedSettings = await getItems(PROFILE_SETTINGS_KEY);
        const settings = savedSettings ? JSON.parse(savedSettings) : {};
        if (settings.arrivalReminders === false) return false;

        const permitted = await requestReminderPermission();
        if (!permitted) return false;

        await syncReminderNotifications();
        return true;
    } catch (error) {
        console.warn('Could not enable the letter arrival notification:', error);
        return false;
    }
};

const configureAndroidReminderChannel = async () => {
    if (Platform.OS !== 'android') return;
    await Notifications.setNotificationChannelAsync(ANDROID_REMINDER_CHANNEL_ID, {
        name: 'DearMe reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7B6B4B',
    });
};

const getReminderDate = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;
    const month = date.getMonth();
    const day = date.getDate();
    const now = new Date();
    let year = now.getFullYear();
    let anniversary = new Date(year, month, day, 9, 0, 0, 0);
    if (anniversary <= now) {
        year += 1;
        anniversary = new Date(year, month, day, 9, 0, 0, 0);
    }
    return anniversary;
};

let notificationSyncQueue = Promise.resolve();

export const syncReminderNotifications = () => {
    const operation = notificationSyncQueue.then(syncReminderNotificationsNow, syncReminderNotificationsNow);
    notificationSyncQueue = operation.catch(() => {});
    return operation;
};

const syncReminderNotificationsNow = async () => {
    if (Platform.OS === 'web') return;
    try {
        await configureAndroidReminderChannel();
        const savedSettings = await getItems(PROFILE_SETTINGS_KEY);
        const settings = savedSettings ? JSON.parse(savedSettings) : {};
        const existing = await Notifications.getAllScheduledNotificationsAsync();
        const owned = existing.filter((item) => item.content.data?.reminderTag === REMINDER_TAG);

        for (const notification of owned) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }

        const arrivalReminders = settings.arrivalReminders !== false;
        const yearlyReminders = settings.yearlyReminders === true;
        if (!arrivalReminders && !yearlyReminders) return;
        const permission = await Notifications.getPermissionsAsync();
        if (!permission.granted) return;

        const reminders = [];
        if (arrivalReminders) {
            getLetterSnapshot().forEach((letter) => {
                const releaseAt = Number(letter.releaseAt);
                if (letter.status === 'scheduled' && Number.isFinite(releaseAt) && releaseAt > Date.now()) {
                    reminders.push({
                        id: `arrival:${letter.id}`,
                        date: new Date(releaseAt),
                        title: 'Your letter has arrived',
                        body: letter.title ? `“${letter.title}” is ready to open.` : 'A letter is ready to open.',
                    });
                }
            });
        }
        if (yearlyReminders) {
            getJournalSnapshot().forEach((entry) => {
                const date = getReminderDate(entry.date);
                if (date && date.getTime() > Date.now()) {
                    reminders.push({
                        id: `yearly:${entry.id}`,
                        date,
                        title: 'One year ago today',
                        body: entry.title ? `Take a look back at “${entry.title}”.` : 'An entry from a year ago is ready to revisit.',
                    });
                }
            });
        }

        reminders.sort((a, b) => a.date - b.date);
        for (const reminder of reminders.slice(0, MAX_SCHEDULED_REMINDERS)) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: reminder.title,
                    body: reminder.body,
                    sound: 'default',
                    data: { reminderTag: REMINDER_TAG, reminderId: reminder.id },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: reminder.date,
                    ...(Platform.OS === 'android' ? { channelId: ANDROID_REMINDER_CHANNEL_ID } : {}),
                },
            });
        }
    } catch (error) {
        console.warn('Could not update reminder notifications:', error);
    }
};
