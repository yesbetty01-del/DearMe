const sharedMoodColors = {
    moodCalm: '#7a9b8e',
    moodWarm: '#d99a5b',
    moodCloud: '#8a94a6',
    moodQuiet: '#6b6f8c',
    moodAlive: '#c66b52',
    moodBloom: '#c89a9a',
};

const createTheme = ({
    background,
    surface,
    surfaceAlt,
    foreground,
    mutedForeground,
    onPrimary,
    primary,
    primaryHover,
    secondary,
    accent,
    destructive = '#a04848',
    destructiveFg = '#ffffff',
    success = primary,
    warning = '#b8884a',
    border,
    borderStrong,
    divider,
    inputBackground,
    inputBorder,
    placeholder,
    overlay,
    shadow,
    deliveredBag,
    scheduledBag,
    statusBarStyle,
    moodBloom,
}) => ({
    background,
    surface,
    surfaceAlt,
    foreground,
    mutedForeground,
    onPrimary,
    primary,
    primaryHover,
    secondary,
    accent,
    destructive,
    destructiveFg,
    success,
    warning,
    border,
    borderStrong,
    divider,
    inputBackground,
    inputBorder,
    placeholder,
    overlay,
    shadow,
    ...sharedMoodColors,
    moodBloom: moodBloom || sharedMoodColors.moodBloom,
    deliveredBag,
    scheduledBag,
    statusBarStyle,
});

export const colorsLight = createTheme({
    background: '#f5f1e8', surface: '#faf6ed', surfaceAlt: '#ede7d6',
    foreground: '#2d2a22', mutedForeground: '#8a8472', onPrimary: '#f5f1e8',
    primary: '#556b47', primaryHover: '#3d4435', secondary: '#ebe5d4', accent: '#c9cdb5',
    border: 'rgba(74, 82, 64, 0.15)', borderStrong: 'rgba(74, 82, 64, 0.28)', divider: 'rgba(74, 82, 64, 0.08)',
    inputBackground: '#ede7d6', inputBorder: 'rgba(74, 82, 64, 0.18)', placeholder: '#a8a290',
    overlay: 'rgba(45, 42, 34, 0.45)', shadow: 'rgba(45, 42, 34, 0.08)',
    deliveredBag: '#f0d4bd', scheduledBag: '#dde3d4', statusBarStyle: 'dark',
});

export const colorsDark = createTheme({
    background: '#1f1d18', surface: '#2a271f', surfaceAlt: '#333026',
    foreground: '#ede7d6', mutedForeground: '#8a8472', onPrimary: '#1f1d18',
    primary: '#a8b094', primaryHover: '#bcc3a8', secondary: '#333026', accent: '#6b7558',
    destructive: '#c46a6a', destructiveFg: '#1f1d18', success: '#a8b094', warning: '#d4a868', border: 'rgba(237, 231, 214, 0.12)', borderStrong: 'rgba(237, 231, 214, 0.22)', divider: 'rgba(237, 231, 214, 0.06)',
    inputBackground: '#333026', inputBorder: 'rgba(237, 231, 214, 0.15)', placeholder: '#6e6857',
    overlay: 'rgba(0, 0, 0, 0.55)', shadow: 'rgba(0, 0, 0, 0.4)',
    deliveredBag: '#4c3626', scheduledBag: '#556b47', statusBarStyle: 'light', moodBloom: '#8a6060',
});

// Palette values follow the Figma Theme folder. Existing Light and Dark remain intact.
export const colorsSage = createTheme({
    background: '#f5f1e8', surface: '#faf6ed', surfaceAlt: '#ede7d6', foreground: '#2d2a22', mutedForeground: '#8a8472', onPrimary: '#f5f1e8',
    primary: '#4a5240', primaryHover: '#3d4435', secondary: '#ebe5d4', accent: '#c9cdb5', border: 'rgba(74, 82, 64, 0.15)', borderStrong: 'rgba(74, 82, 64, 0.28)', divider: 'rgba(74, 82, 64, 0.08)',
    inputBackground: '#ede7d6', inputBorder: 'rgba(74, 82, 64, 0.18)', placeholder: '#a8a290', overlay: 'rgba(45, 42, 34, 0.45)', shadow: 'rgba(45, 42, 34, 0.08)', deliveredBag: '#f0d4bd', scheduledBag: '#dde3d4', statusBarStyle: 'dark',
});

export const paletteThemes = {
    sage: colorsSage,
    rose: createTheme({ background: '#f6eee9', surface: '#fbf5f1', surfaceAlt: '#f0e4dc', foreground: '#33241f', mutedForeground: '#96807a', onPrimary: '#f6eee9', primary: '#8a4f45', primaryHover: '#734138', secondary: '#efe1d9', accent: '#e2c4b8', border: 'rgba(138, 79, 69, 0.15)', borderStrong: 'rgba(138, 79, 69, 0.28)', divider: 'rgba(138, 79, 69, 0.08)', inputBackground: '#f0e4dc', inputBorder: 'rgba(138, 79, 69, 0.18)', placeholder: '#ad9690', overlay: 'rgba(51, 36, 31, 0.45)', shadow: 'rgba(51, 36, 31, 0.08)', deliveredBag: '#ead9cf', scheduledBag: '#e2c4b8', statusBarStyle: 'dark' }),
    night: createTheme({ background: '#1c1d19', surface: '#25261f', surfaceAlt: '#2a2b25', foreground: '#ece6d6', mutedForeground: '#9a9584', onPrimary: '#1c1d19', primary: '#b9c4a2', primaryHover: '#c8d0b5', secondary: '#2e3029', accent: '#4a5240', border: 'rgba(236, 230, 214, 0.12)', borderStrong: 'rgba(236, 230, 214, 0.22)', divider: 'rgba(236, 230, 214, 0.06)', inputBackground: '#2a2b25', inputBorder: 'rgba(236, 230, 214, 0.15)', placeholder: '#777364', overlay: 'rgba(0, 0, 0, 0.55)', shadow: 'rgba(0, 0, 0, 0.4)', deliveredBag: '#4c3626', scheduledBag: '#4a5240', statusBarStyle: 'light' }),
    honey: createTheme({ background: '#f7f0de', surface: '#fcf7ea', surfaceAlt: '#f0e7cf', foreground: '#33291a', mutedForeground: '#968766', onPrimary: '#f7f0de', primary: '#8a6420', primaryHover: '#72521a', secondary: '#efe4c8', accent: '#e3cc8f', border: 'rgba(138, 100, 32, 0.16)', borderStrong: 'rgba(138, 100, 32, 0.28)', divider: 'rgba(138, 100, 32, 0.08)', inputBackground: '#f0e7cf', inputBorder: 'rgba(138, 100, 32, 0.18)', placeholder: '#a49570', overlay: 'rgba(51, 41, 26, 0.45)', shadow: 'rgba(51, 41, 26, 0.08)', deliveredBag: '#eadcb8', scheduledBag: '#e3cc8f', statusBarStyle: 'dark' }),
    ink: createTheme({ background: '#161a24', surface: '#1e2330', surfaceAlt: '#222837', foreground: '#e4e7ef', mutedForeground: '#8b93a8', onPrimary: '#161a24', primary: '#a9b8dc', primaryHover: '#bcc8e5', secondary: '#262c3b', accent: '#3a4560', border: 'rgba(228, 231, 239, 0.12)', borderStrong: 'rgba(228, 231, 239, 0.22)', divider: 'rgba(228, 231, 239, 0.06)', inputBackground: '#222837', inputBorder: 'rgba(228, 231, 239, 0.15)', placeholder: '#727b91', overlay: 'rgba(0, 0, 0, 0.55)', shadow: 'rgba(0, 0, 0, 0.4)', deliveredBag: '#3a3340', scheduledBag: '#3a4560', statusBarStyle: 'light' }),
    ember: createTheme({ background: '#1f1714', surface: '#2a201b', surfaceAlt: '#352821', foreground: '#ecdfd4', mutedForeground: '#a08e82', onPrimary: '#1f1714', primary: '#e0a080', primaryHover: '#edb394', secondary: '#3a2c25', accent: '#6b3f2e', border: 'rgba(236, 223, 212, 0.12)', borderStrong: 'rgba(236, 223, 212, 0.22)', divider: 'rgba(236, 223, 212, 0.06)', inputBackground: '#352821', inputBorder: 'rgba(236, 223, 212, 0.15)', placeholder: '#817065', overlay: 'rgba(0, 0, 0, 0.55)', shadow: 'rgba(0, 0, 0, 0.4)', deliveredBag: '#4c3626', scheduledBag: '#6b3f2e', statusBarStyle: 'light' }),
    forest: createTheme({ background: '#121a16', surface: '#1a241f', surfaceAlt: '#1f2b25', foreground: '#dde8e0', mutedForeground: '#8a9e92', onPrimary: '#121a16', primary: '#8fc4a4', primaryHover: '#a4d2b5', secondary: '#24312a', accent: '#2f4a3c', border: 'rgba(221, 232, 224, 0.12)', borderStrong: 'rgba(221, 232, 224, 0.22)', divider: 'rgba(221, 232, 224, 0.06)', inputBackground: '#1f2b25', inputBorder: 'rgba(221, 232, 224, 0.15)', placeholder: '#71857a', overlay: 'rgba(0, 0, 0, 0.55)', shadow: 'rgba(0, 0, 0, 0.4)', deliveredBag: '#344437', scheduledBag: '#2f4a3c', statusBarStyle: 'light' }),
    plum: createTheme({ background: '#1c1520', surface: '#261d2b', surfaceAlt: '#2d2333', foreground: '#ebe0ee', mutedForeground: '#9c8ca3', onPrimary: '#1c1520', primary: '#cfa6d8', primaryHover: '#ddb9e5', secondary: '#33283a', accent: '#4d3a57', border: 'rgba(235, 224, 238, 0.12)', borderStrong: 'rgba(235, 224, 238, 0.22)', divider: 'rgba(235, 224, 238, 0.06)', inputBackground: '#2d2333', inputBorder: 'rgba(235, 224, 238, 0.15)', placeholder: '#837489', overlay: 'rgba(0, 0, 0, 0.55)', shadow: 'rgba(0, 0, 0, 0.4)', deliveredBag: '#49354d', scheduledBag: '#4d3a57', statusBarStyle: 'light' }),
};

export const themes = { light: colorsLight, dark: colorsDark, ...paletteThemes };
export default themes;
