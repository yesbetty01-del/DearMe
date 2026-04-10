import ThemeProvider from "../contexts/themeContext";
import Splash from './index';

export default function Layout() {
    return(
        <ThemeProvider>
            <Splash/>
        </ThemeProvider>
    )
}