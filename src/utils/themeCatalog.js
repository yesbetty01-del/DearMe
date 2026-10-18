import themes from './colors';

export const THEME_CATALOG = [
    { id: 'dearme.theme.light.v1', key: 'light', name: 'Light', note: 'Your original warm paper theme.', free: true },
    { id: 'dearme.theme.dark.v1', key: 'dark', name: 'Dark', note: 'The original dark theme.', free: true },
    { id: 'dearme.theme.sage.v1', key: 'sage', name: 'Sage', note: 'Cream paper and garden green.', free: false },
    { id: 'dearme.theme.rose.v1', key: 'rose', name: 'Rose Clay', note: 'Warm linen and terracotta ink.', free: false },
    { id: 'dearme.theme.night.v1', key: 'night', name: 'Night', note: 'Lamplight on dark paper.', free: false },
    { id: 'dearme.theme.honey.v1', key: 'honey', name: 'Honey', note: 'Golden afternoon and ochre ink.', free: false },
    { id: 'dearme.theme.ink.v1', key: 'ink', name: 'Inkwell', note: 'Midnight blue and moonlit text.', free: false },
    { id: 'dearme.theme.ember.v1', key: 'ember', name: 'Ember', note: 'Hearth glow on dark walnut.', free: false },
    { id: 'dearme.theme.forest.v1', key: 'forest', name: 'Forest', note: 'Pine shadow and moss light.', free: false },
    { id: 'dearme.theme.plum.v1', key: 'plum', name: 'Plum', note: 'Velvet night and orchid ink.', free: false },
].map((theme) => ({ ...theme, colors: themes[theme.key] }));

export const FREE_THEME_IDS = THEME_CATALOG.filter((theme) => theme.free).map((theme) => theme.id);

export const getThemeByKey = (key) => THEME_CATALOG.find((theme) => theme.key === key);

export const getThemeById = (id) => THEME_CATALOG.find((theme) => theme.id === id);

export const getThemeAccessState = (theme, unlockedThemeIds = []) => {
    if (theme.free) return 'free';
    return unlockedThemeIds.includes(theme.id) ? 'unlocked' : 'locked';
};
