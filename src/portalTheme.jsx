import { createTheme, alpha } from '@mui/material/styles';

const orvixInk = '#011736';
const orvixNavy = '#041D47';
const orvixBlue = '#0051D2';
const orvixRoyal = '#0470FF';
const orvixSky = '#107CFF';
const orvixSurface = '#F4F7FF';

export const portalTheme = (dir = 'ltr') =>
  createTheme({
    direction: dir,
    palette: {
      mode: 'light',
      primary: {
        light: orvixSky,
        main: orvixBlue,
        dark: orvixInk,
        contrastText: '#FFFFFF',
      },
      secondary: {
        light: '#5EA8FF',
        main: orvixRoyal,
        dark: '#003C9D',
        contrastText: '#FFFFFF',
      },
      success: { main: '#0EA5E9' },
      colorA: { light: orvixSky, main: orvixBlue, dark: orvixInk },
      colorB: { light: '#5EA8FF', main: orvixRoyal, dark: '#003C9D' },
      colorC: { light: '#FFFFFF', main: '#F8FAFF', dark: '#E3EBFA' },
      colorD: { light: '#153066', main: orvixNavy, dark: '#001123' },
      background: {
        default: orvixSurface,
        paper: '#FFFFFF',
      },
      text: {
        primary: '#071426',
        secondary: '#60708A',
      },
      divider: alpha(orvixInk, 0.08),
    },
    typography: {
      fontFamily:
        "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
      h1: { fontWeight: 950, letterSpacing: -1.3 },
      h2: { fontWeight: 950, letterSpacing: -1.1 },
      h3: { fontWeight: 950, letterSpacing: -0.8 },
      h4: { fontWeight: 950, letterSpacing: -0.5 },
      button: { fontWeight: 850 },
    },
    shape: { borderRadius: 18 },
    shadows: [
      'none',
      '0 1px 2px rgba(1, 23, 54, 0.05)',
      '0 6px 18px rgba(1, 23, 54, 0.08)',
      '0 10px 28px rgba(1, 23, 54, 0.10)',
      '0 18px 44px rgba(1, 23, 54, 0.12)',
      '0 24px 60px rgba(1, 23, 54, 0.14)',
      ...Array(19).fill('0 24px 60px rgba(1, 23, 54, 0.14)'),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: orvixSurface,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 14,
            boxShadow: 'none',
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${orvixInk} 0%, ${orvixBlue} 48%, ${orvixRoyal} 100%)`,
            boxShadow: `0 18px 36px ${alpha(orvixBlue, 0.26)}`,
            '&:hover': {
              boxShadow: `0 22px 46px ${alpha(orvixRoyal, 0.34)}`,
              background: `linear-gradient(135deg, ${orvixNavy} 0%, ${orvixBlue} 45%, ${orvixSky} 100%)`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 22,
            border: `1px solid ${alpha(orvixInk, 0.07)}`,
            boxShadow: `0 14px 40px ${alpha(orvixInk, 0.07)}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: { borderRadius: 18 },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 14 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: '#F8FAFF',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(orvixBlue, 0.45),
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              boxShadow: `0 0 0 4px ${alpha(orvixRoyal, 0.11)}`,
            },
          },
          notchedOutline: {
            borderColor: alpha(orvixInk, 0.12),
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: '#60708A',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 800,
          },
        },
      },
    },
  });
