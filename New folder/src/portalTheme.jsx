import { createTheme } from '@mui/material/styles';

export const portalTheme = (dir = 'ltr') =>
  createTheme({
    direction: dir,
    palette: {
      primary: { main: '#0B3C5D' },
      secondary: { main: '#D9B310' },
      colorA: { light: '#1A5F8C', main: '#0B3C5D', dark: '#051E30' },
      colorB: { light: '#F3D351', main: '#D9B310', dark: '#A98A0C' },
      colorC: { light: '#FFFFFF', main: '#FEFEFE', dark: '#F0F0F0' },
      colorD: { light: '#1A5F8C', main: '#0B3C5D', dark: '#051E30' },
      background: { default: '#F7F9FB', paper: '#FFFFFF' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 700 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 20px rgba(11, 60, 93, 0.08)',
            borderRadius: 16,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 10 },
        },
      },
    },
  });
