import { getItems, setItems } from '../utils/storage';
import { FREE_THEME_IDS, getThemeById } from '../utils/themeCatalog';
import { showRewardedAd } from './rewardedAdService';

// This key stays in the local SQLite app_data store and is excluded from sync and backups.
const UNLOCKED_THEMES_KEY = 'themeUnlocks.v1';

export const getUnlockedThemeIds = async () => {
    const storedValue = await getItems(UNLOCKED_THEMES_KEY);
    if (!storedValue) return [];

    try {
        const parsed = JSON.parse(storedValue);
        return Array.isArray(parsed)
            ? [...new Set(parsed.filter((id) => getThemeById(id) && !FREE_THEME_IDS.includes(id)))]
            : [];
    } catch (error) {
        console.warn('Saved theme unlocks could not be read:', error);
        return [];
    }
};

export const unlockThemeWithRewardedAd = async (themeId) => {
    const theme = getThemeById(themeId);
    if (!theme) return { status: 'invalid-theme' };
    if (theme.free) return { status: 'already-available' };

    const unlockedThemeIds = await getUnlockedThemeIds();
    if (unlockedThemeIds.includes(themeId)) return { status: 'already-available' };

    const adResult = await showRewardedAd({ placementId: 'theme_unlock' });
    if (adResult.status !== 'rewarded') return adResult;

    const nextUnlockedThemeIds = [...unlockedThemeIds, themeId];
    const saved = await setItems(UNLOCKED_THEMES_KEY, JSON.stringify(nextUnlockedThemeIds));
    if (!saved) return { status: 'save-failed' };

    return { status: 'unlocked', unlockedThemeIds: nextUnlockedThemeIds };
};
