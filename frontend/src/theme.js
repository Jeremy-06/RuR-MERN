import { createTheme } from '@mui/material/styles'

// Same colors and fonts as the --rur-* variables in index.css
const displayFont = "'Barlow Condensed', Impact, sans-serif"

const theme = createTheme({
    palette: {
        primary: {
            main: '#1677ff',
            dark: '#0f5fd1',
            contrastText: '#fff'
        },
        secondary: {
            main: '#fb334b',
            contrastText: '#fff'
        },
        background: {
            default: '#f4f6f9',
            paper: '#fff'
        },
        rur: {
            black: '#090b0f',
            panel: '#11151b',
            muted: '#8993a1'
        }
    },
    shape: {
        borderRadius: 8
    },
    typography: {
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
        h1: { fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.02em' },
        h2: { fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.02em' },
        h3: { fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.02em' },
        h4: { fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.02em' },
        h5: { fontFamily: displayFont, fontWeight: 700 },
        button: { fontWeight: 700 }
    },
    components: {
        MuiButton: {
            defaultProps: {
                disableElevation: true
            }
        },
        MuiTextField: {
            defaultProps: {
                fullWidth: true,
                margin: 'normal'
            }
        }
    }
})

export default theme
