import { create } from 'zustand';
import themes from '../utils/colors';
import Typography from '../utils/typography';

const useTheme = create((set) => {
    return {
        theme: 'light',
        colors: themes.light,
        fSize: Typography.fontSize,
        spacing: Typography.spacing,
        toggleTheme: () => set((state) => {
            if (state.theme === 'light') {
                return { theme: 'dark', colors: themes.dark}
            }
            else {
                return { theme: 'light', colors: themes.light }
            }
        })
    }
});

export default useTheme;