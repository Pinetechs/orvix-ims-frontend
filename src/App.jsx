import React from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { create } from 'jss';
import rtl from 'jss-rtl';
import { StylesProvider, jssPreset } from '@mui/styles';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { portalTheme } from './portalTheme.jsx';
import MasterRoute from './MasterRoute.jsx';
import ToastOutlet from './components/ToastProvider/ToastProvider.jsx';

function App() {
  const { i18n } = useTranslation();
  const direction = i18n.dir();
  document.dir = direction;

  const theme = portalTheme(direction);
  const emotionCache = createCache({
    key: direction === 'rtl' ? 'muirtl' : 'muiltr',
    prepend: true,
    stylisPlugins: direction === 'rtl' ? [prefixer, rtlPlugin] : [prefixer],
  });
  const jss = create({ plugins: [...jssPreset().plugins, rtl()] });

  return (
    <CacheProvider value={emotionCache}>
      <StylesProvider jss={jss}>
        <ThemeProvider theme={theme}>
          <Box component="section" sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <CssBaseline />
            <MasterRoute />
            <ToastOutlet />
          </Box>
        </ThemeProvider>
      </StylesProvider>
    </CacheProvider>
  );
}

export default App;
