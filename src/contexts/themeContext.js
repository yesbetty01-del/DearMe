import { createContext, useContext} from 'react';
import {colors} from '../utils/colors';

const ThemeContext = createContext();

export default function ThemeProvider ({children}) {
    const theme = colors;

    return (
        <ThemeContext.Provider value={{theme}}>
            {children}
        </ThemeContext.Provider>
    )
};

export const useTheme = () => useContext(ThemeContext);
