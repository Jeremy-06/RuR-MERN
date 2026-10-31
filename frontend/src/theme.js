import { createTheme } from '@mui/material/styles'

// Same colors and fonts as the --rur-* variables in index.css
const displayFont = "'Barlow Condensed', Impact, sans-serif"
const CONTENT_MAX_WIDTH = 1320
const FAST = '180ms ease'
const borderColor = '#e3e7ee'
const inputBorderColor = '#8993a1'
const softShadow = '0 1px 2px rgba(9, 11, 15, 0.04), 0 6px 20px rgba(9, 11, 15, 0.05)'

// Shared gaming look; used through sx on the few elements that need it
export const accentGradient = 'linear-gradient(90deg, #0f6be0, #fb334b)'
export const darkTexture = 'repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0 1px, transparent 1px 12px)'
export const clipCorners = (size = 10) =>
    `polygon(${size}px 0, 100% 0, 100% calc(100% - ${size}px), calc(100% - ${size}px) 100%, 0 100%, 0 ${size}px)`
export const accentTop = {
    position: 'relative',
    overflow: 'hidden',
    '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accentGradient },
}

const theme = createTheme({
    palette: {
        primary: {
            main: '#0f6be0',
            dark: '#0b55b8',
            contrastText: '#fff'
        },
        secondary: {
            main: '#fb334b',
            contrastText: '#fff'
        },
        // Darker than the accent red so small text stays readable on white
        error: {
            main: '#d6203a',
            contrastText: '#fff'
        },
        text: {
            primary: '#11151b',
            secondary: '#5b6573'
        },
        divider: borderColor,
        background: {
            default: '#f4f6f9',
            paper: '#fff'
        },
        rur: {
            black: '#090b0f',
            panel: '#11151b',
            muted: '#8993a1',
            panelBorder: 'rgba(211, 220, 235, 0.14)',
            orderStatus: {
                Processing: { bgcolor: '#e6f0ff', color: '#0b55b8' },
                Shipped: { bgcolor: '#fff3dc', color: '#8a5300' },
                Delivered: { bgcolor: '#e2f6ea', color: '#17693a' }
            }
        }
    },
    shape: {
        borderRadius: 4
    },
    typography: {
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
        h1: { fontFamily: displayFont, fontWeight: 800, fontSize: 'clamp(2.75rem, 6vw, 4.75rem)', lineHeight: 1, letterSpacing: '0.01em', textTransform: 'uppercase' },
        h2: { fontFamily: displayFont, fontWeight: 800, fontSize: 'clamp(2.25rem, 4vw, 3.25rem)', lineHeight: 1.05, letterSpacing: '0.01em', textTransform: 'uppercase' },
        h3: { fontFamily: displayFont, fontWeight: 800, fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1.1, letterSpacing: '0.02em', textTransform: 'uppercase' },
        h4: { fontFamily: displayFont, fontWeight: 700, fontSize: '1.875rem', lineHeight: 1.15, letterSpacing: '0.02em', textTransform: 'uppercase' },
        h5: { fontFamily: displayFont, fontWeight: 700, fontSize: '1.375rem', lineHeight: 1.2, letterSpacing: '0.02em', textTransform: 'uppercase' },
        h6: { fontFamily: displayFont, fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.25, letterSpacing: '0.02em', textTransform: 'uppercase' },
        button: { fontFamily: displayFont, fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '0.06em', textTransform: 'uppercase' },
        overline: { fontWeight: 700, letterSpacing: '0.12em', lineHeight: 1.5 }
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                '@media (prefers-reduced-motion: reduce)': {
                    '*, *::before, *::after': { transitionDuration: '0.01ms !important', scrollBehavior: 'auto !important' }
                }
            }
        },
        MuiContainer: {
            defaultProps: {
                maxWidth: false
            },
            styleOverrides: {
                root: {
                    maxWidth: CONTENT_MAX_WIDTH
                }
            }
        },
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    '&.Mui-focusVisible': { outline: '2px solid #0f6be0', outlineOffset: 2 }
                }
            }
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true
            },
            styleOverrides: {
                root: {
                    transition: `background-color ${FAST}, color ${FAST}, border-color ${FAST}, transform ${FAST}`
                },
                // clip-path cuts an outer outline, so clipped buttons focus with an inner one
                contained: {
                    borderRadius: 0,
                    clipPath: clipCorners(8),
                    paddingLeft: 20,
                    paddingRight: 20,
                    '&.Mui-focusVisible': { outline: '2px solid #fff', outlineOffset: -5 }
                },
                // Keeps link buttons white on hover while the Bootstrap CSS is still loaded
                containedPrimary: {
                    '&:hover': { color: '#fff' }
                },
                outlined: {
                    borderWidth: 2,
                    '&:hover': { borderWidth: 2 }
                }
            }
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    transition: `background-color ${FAST}, color ${FAST}`
                }
            }
        },
        MuiPaper: {
            defaultProps: {
                elevation: 0
            },
            styleOverrides: {
                root: {
                    backgroundImage: 'none'
                },
                elevation0: {
                    border: `1px solid ${borderColor}`,
                    boxShadow: softShadow
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    height: '100%'
                }
            }
        },
        MuiAppBar: {
            defaultProps: {
                elevation: 0,
                color: 'transparent'
            },
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.rur.black,
                    backgroundImage: darkTexture,
                    color: '#fff',
                    border: 0,
                    boxShadow: 'none',
                    '&::after': { content: '""', display: 'block', height: 2, background: accentGradient }
                })
            }
        },
        MuiTextField: {
            defaultProps: {
                fullWidth: true,
                margin: 'normal'
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    backgroundColor: '#fff'
                },
                notchedOutline: {
                    borderColor: inputBorderColor
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 2,
                    fontWeight: 700
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderColor
                },
                head: ({ theme }) => ({
                    ...theme.typography.overline,
                    color: theme.palette.text.secondary,
                    backgroundColor: theme.palette.background.default
                })
            }
        },
        MuiDataGrid: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderColor,
                    borderRadius: theme.shape.borderRadius,
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: softShadow
                }),
                columnHeaderTitle: {
                    fontWeight: 700
                }
            }
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontFamily: displayFont,
                    fontWeight: 800,
                    fontSize: '1.875rem',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase'
                }
            }
        },
        MuiLink: {
            defaultProps: {
                underline: 'hover'
            }
        },
        MuiRating: {
            styleOverrides: {
                iconEmpty: {
                    color: inputBorderColor
                }
            }
        },
        MuiStepIcon: {
            styleOverrides: {
                root: {
                    fontSize: '1.75rem'
                }
            }
        },
        MuiStepLabel: {
            styleOverrides: {
                label: {
                    fontWeight: 500,
                    '&.Mui-active, &.Mui-completed': { fontWeight: 700 }
                }
            }
        }
    }
})

export default theme
