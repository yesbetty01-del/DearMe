import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import themes from '../utils/colors';
import Typography from '../utils/typography';
import { getThemeByKey, getThemeAccessState } from '../utils/themeCatalog';
import { getUnlockedThemeIds } from '../services/themeUnlockService';

const THEME_STORAGE_KEY = 'dearme.theme';

const useTheme = create((set, get) => {
    const applyTheme = (theme) => {
        const catalogTheme = getThemeByKey(theme);
        if (!catalogTheme || getThemeAccessState(catalogTheme, get().unlockedThemeIds) === 'locked') return;
        set({ theme, colors: themes[theme] });
        AsyncStorage.setItem(THEME_STORAGE_KEY, theme).catch((error) => {
            console.error('Could not save theme:', error);
        });
    };

    Promise.all([AsyncStorage.getItem(THEME_STORAGE_KEY), getUnlockedThemeIds()])
        .then(([savedTheme, unlockedThemeIds]) => {
            const savedThemeIsAvailable = savedTheme
                && getThemeByKey(savedTheme)
                && getThemeAccessState(getThemeByKey(savedTheme), unlockedThemeIds) !== 'locked';
            const shouldRestoreSavedTheme = savedThemeIsAvailable && get().theme === 'light';
            if (savedTheme && !savedThemeIsAvailable) {
                AsyncStorage.setItem(THEME_STORAGE_KEY, 'light').catch((error) => {
                    console.error('Could not reset unavailable saved theme:', error);
                });
            }
            set({
                unlockedThemeIds,
                ...(shouldRestoreSavedTheme ? { theme: savedTheme, colors: themes[savedTheme] } : {}),
            });
        })
        .catch((error) => console.error('Could not load theme preferences:', error));

    return {
        theme: 'light',
        colors: themes.light,
        unlockedThemeIds: [],
        fSize: Typography.fontSize,
        spacing: Typography.spacing,
        setTheme: applyTheme,
        refreshUnlockedThemes: async () => {
            const unlockedThemeIds = await getUnlockedThemeIds();
            set({ unlockedThemeIds });
            const currentTheme = getThemeByKey(get().theme);
            if (currentTheme && getThemeAccessState(currentTheme, unlockedThemeIds) === 'locked') {
                set({ theme: 'light', colors: themes.light });
            }
            return unlockedThemeIds;
        },
        isThemeAvailable: (theme) => {
            const catalogTheme = getThemeByKey(theme);
            return Boolean(catalogTheme && getThemeAccessState(catalogTheme, get().unlockedThemeIds) !== 'locked');
        },
        toggleTheme: () => applyTheme(get().theme === 'light' ? 'dark' : 'light'),
    };
});

export default useTheme;
