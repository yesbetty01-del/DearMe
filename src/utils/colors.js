
export const colorsLight = {
  // ---- Core surfaces ----
  background:      '#f5f1e8', // app background (warm cream)
  surface:         '#faf6ed', // cards, sheets, list rows (lighter cream)
  surfaceAlt:      '#ede7d6', // subtle raised surface / muted fills

  // ---- Text ----
  foreground:      '#2d2a22', // primary text (warm near-black)
  mutedForeground: '#8a8472', // secondary text, captions, inactive icons
  onPrimary:       '#f5f1e8', // text/icons on sage primary

  // ---- Brand / accent ----
  primary:         '#4a5240', // sage green — buttons, active tab, FAB
  primaryHover:    '#3d4435', // pressed / hover state for primary
  secondary:       '#ebe5d4', // soft cream chip / pill background
  accent:          '#c9cdb5', // muted sage highlight / progress fill

  // ---- Feedback ----
  destructive:     '#a04848', // errors, delete
  destructiveFg:   '#ffffff',
  success:         '#6b7a52', // gentle sage-green confirmation
  warning:         '#b8884a', // warm amber

  // ---- Lines & dividers ----
  border:          'rgba(74, 82, 64, 0.15)', // hairline borders on cards/rows
  borderStrong:    'rgba(74, 82, 64, 0.28)', // emphasized divider
  divider:         'rgba(74, 82, 64, 0.08)', // very subtle separator

  // ---- Inputs ----
  inputBackground: '#ede7d6',
  inputBorder:     'rgba(74, 82, 64, 0.18)',
  placeholder:     '#a8a290',

  // ---- Overlays ----
  overlay:         'rgba(45, 42, 34, 0.45)', // modal scrim
  shadow:          'rgba(45, 42, 34, 0.08)', // soft card shadow

  // ---- Mood / category accents (used in Journal entries) ----
  moodCalm:        '#c9cdb5', // sage
  moodWarm:        '#d4b896', // soft tan
  moodCloud:       '#b8bcc4', // muted blue-grey
  moodBloom:       '#c89a9a', // dusty rose
};

// Optional: dark mode (kept in the same warm family)
export const colorsDark = {
  background:      '#1f1d18',
  surface:         '#2a271f',
  surfaceAlt:      '#333026',

  foreground:      '#ede7d6',
  mutedForeground: '#8a8472',
  onPrimary:       '#1f1d18',

  primary:         '#a8b094',
  primaryHover:    '#bcc3a8',
  secondary:       '#333026',
  accent:          '#6b7558',

  destructive:     '#c46a6a',
  destructiveFg:   '#1f1d18',
  success:         '#a8b094',
  warning:         '#d4a868',

  border:          'rgba(237, 231, 214, 0.12)',
  borderStrong:    'rgba(237, 231, 214, 0.22)',
  divider:         'rgba(237, 231, 214, 0.06)',

  inputBackground: '#333026',
  inputBorder:     'rgba(237, 231, 214, 0.15)',
  placeholder:     '#6e6857',

  overlay:         'rgba(0, 0, 0, 0.55)',
  shadow:          'rgba(0, 0, 0, 0.4)',

  moodCalm:        '#6b7558',
  moodWarm:        '#8a7050',
  moodCloud:       '#6e7480',
  moodBloom:       '#8a6060',
};

export const themes = {
  light: colorsLight,
  dark: colorsDark,
}

export default themes;