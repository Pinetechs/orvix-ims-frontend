import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import LanguageIcon from '@mui/icons-material/Language';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LanOutlinedIcon from '@mui/icons-material/LanOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Logo from '../../assets/images/logo/orvix-ims-logo.svg';
import { baseUrl } from '../../util/constant.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useSettings } from '../../hooks/useSettings.js';
import Progress from '../../components/Loader/Progress.jsx';
import AnimatedBackground from './AnimatedBackground.jsx';

function BrandLogo({ size = 150, compact = false }) {
  return (
    <Box
      sx={(theme) => ({
        width: size,
        height: size,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        borderRadius: compact ? 4 : 6,
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        boxShadow: `0 24px 70px ${alpha(theme.palette.primary.dark, compact ? 0.14 : 0.22)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 70% 22%, ${alpha(theme.palette.secondary.main, 0.15)} 0, transparent 38%)`,
        },
      })}
    >
      <Box
        component="img"
        src={Logo}
        alt="Orvix ERP"
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '92%',
          height: '92%',
          objectFit: 'contain',
          display: 'block',
          filter: 'drop-shadow(0 10px 18px rgba(1, 23, 54, 0.12))',
        }}
      />
    </Box>
  );
}

function FeaturePill({ icon, children }) {
  return (
    <Stack
      direction="row"
      spacing={1.4}
      alignItems="center"
      sx={(theme) => ({
        width: '100%',
        p: 1.35,
        borderRadius: 3,
        color: 'rgba(255,255,255,0.88)',
        bgcolor: alpha(theme.palette.common.white, 0.07),
        border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
        boxShadow: `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.08)}`,
      })}
    >
      <Box sx={{ color: '#5EA8FF', display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.45 }}>{children}</Typography>
    </Stack>
  );
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const settings = useSettings();
  const { t, i18n } = useTranslation();

  const [language, setLanguage] = useState(i18n.language?.startsWith('ar') ? 'ar' : 'en');
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isArabic = language === 'ar';
  const from = location.state?.from?.pathname || '/';

  const companyLogoUrl = settings.settingsMap.companyLogoUrl
    ? `${baseUrl}/${settings.settingsMap.companyLogoUrl}`
    : null;

  useEffect(() => {
    if (auth.isAuthenticate) {
      navigate(from, { replace: true });
    }
  }, [auth.isAuthenticate, from, navigate]);

  const handleLanguageChange = (event) => {
    const nextLang = event.target.value;
    setLanguage(nextLang);
    i18n.changeLanguage(nextLang);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    await auth.login({ username, password });
  };

  return (
    <Box
      dir={isArabic ? 'rtl' : 'ltr'}
      sx={(theme) => ({
        minHeight: '100dvh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#001123',
        background: `
          radial-gradient(circle at 17% 16%, ${alpha(theme.palette.secondary.main, 0.26)} 0, transparent 29%),
          radial-gradient(circle at 78% 18%, ${alpha(theme.palette.primary.light, 0.18)} 0, transparent 35%),
          radial-gradient(circle at 50% 100%, ${alpha(theme.palette.primary.main, 0.16)} 0, transparent 42%),
          linear-gradient(135deg, #000814 0%, #011736 38%, #041D47 68%, #001123 100%)
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.033) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.033) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          maskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 74%)',
        },
        '&::after': {
          content: '"ORVIX"',
          position: 'absolute',
          left: isArabic ? 'auto' : { xs: -14, md: 36 },
          right: isArabic ? { xs: -14, md: 36 } : 'auto',
          bottom: { xs: 26, md: 8 },
          fontSize: { xs: 58, md: 120 },
          fontWeight: 950,
          letterSpacing: { xs: 8, md: 18 },
          color: alpha(theme.palette.common.white, 0.035),
          pointerEvents: 'none',
        },
        '@keyframes logo-pulse': {
          '0%, 100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.secondary.main, 0.18)}` },
          '50%': { boxShadow: `0 0 0 14px ${alpha(theme.palette.secondary.main, 0)}` },
        },
      })}
    >
      <AnimatedBackground />

      {settings.isLoading ? (
        <Box sx={{ width: '100%', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
          <Progress color="colorC" msg={t('loginPage.loading')} />
        </Box>
      ) : (
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10, py: { xs: 3, md: 6 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.04fr 0.96fr' },
            gap: { xs: 3, lg: 6 },
            alignItems: 'center',
          }}
        >
          <Box sx={{ color: 'common.white', px: { xs: 0, md: 1, lg: 2 }, display: { xs: 'none', lg: 'block' } }}>
            <Box sx={{ mb: 4 }}>
              <BrandLogo size={120} />
            </Box>

            <Typography
              variant="h2"
              sx={{
                maxWidth: 600,
                fontWeight: 950,
                lineHeight: 1.08,
                mb: 2,
                fontSize: { xs: '2.2rem', md: '3.5rem' },
                letterSpacing: { xs: -0.8, md: -1.8 },
              }}
            >
              {t('loginPage.visitorTitle')}
            </Typography>

            <Typography
              sx={{
                maxWidth: 550,
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.7,
                fontSize: '1rem',
                mb: 3.5,
              }}
            >
              {t('loginPage.visitorText')}
            </Typography>

            <Box sx={{ display: 'grid', gap: 1.2, maxWidth: 520 }}>
              <FeaturePill icon={<QrCodeScannerIcon fontSize="small" />}>{t('loginPage.feature1')}</FeaturePill>
              <FeaturePill icon={<LanOutlinedIcon fontSize="small" />}>{t('loginPage.feature2')}</FeaturePill>
              <FeaturePill icon={<ShieldOutlinedIcon fontSize="small" />}>{t('loginPage.feature3')}</FeaturePill>
            </Box>
          </Box>

          <Card
            elevation={0}
            sx={(theme) => ({
              width: '100%',
              maxWidth: 535,
              justifySelf: { xs: 'stretch', lg: isArabic ? 'start' : 'end' },
              position: 'relative',
              overflow: 'hidden',
              p: { xs: 2.2, sm: 2.8 },
              borderRadius: { xs: 5, md: 7 },
              bgcolor: alpha(theme.palette.common.white, 0.9),
              border: `1px solid ${alpha(theme.palette.common.white, 0.62)}`,
              boxShadow: `
                0 38px 100px ${alpha(theme.palette.common.black, 0.34)},
                0 0 0 1px ${alpha(theme.palette.primary.light, 0.08)},
                inset 0 1px 0 ${alpha(theme.palette.common.white, 0.74)}
              `,
              backdropFilter: 'blur(28px)',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: 240,
                height: 240,
                borderRadius: '50%',
                right: -90,
                top: -90,
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.28)} 0%, transparent 68%)`,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 10,
                borderRadius: { xs: 4, md: 6 },
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                pointerEvents: 'none',
              },
            })}
          >
            <Box
              sx={(theme) => ({
                position: 'relative',
                zIndex: 1,
                borderRadius: { xs: 4, md: 5.5 },
                p: { xs: 2.2, sm: 3.3, md: 3.8 },
                bgcolor: alpha(theme.palette.common.white, 0.9),
                background: `linear-gradient(180deg, ${alpha(theme.palette.common.white, 0.96)} 0%, ${alpha('#F8FAFF', 0.94)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.07)}`,
              })}
            >
              <Stack spacing={2.6} alignItems="center" sx={{ mb: 3.2, textAlign: 'center' }}>
                {companyLogoUrl ? (
                  <Box
                    sx={(theme) => ({
                      width: 226,
                      height: 94,
                      display: 'grid',
                      placeItems: 'center',
                      p: 1.4,
                    })}
                  >
                    <Box
                      component="img"
                      src={companyLogoUrl}
                      alt={t('loginPage.companyLogoAlt')}
                      sx={(theme) => ({
                        

                         width: '100%', height: '100%', objectFit: 'contain', display: 'block' })}
                    />
                  </Box>
                ) : (
                  <BrandLogo size={128} compact />
                )}

                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 950,
                      letterSpacing: -0.8,
                      mb: 0.9,
                      fontSize: { xs: '1.75rem', md: '2.15rem' },
                      color: 'primary.dark',
                    }}
                  >
                    {t('loginPage.title')}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: 390 }}>
                    {t('loginPage.subtitle')}
                  </Typography>
                </Box>
              </Stack>

              <FormControl size="small" fullWidth sx={{ mb: 2.4 }}>
                <InputLabel id="language-select-label">{t('loginPage.language')}</InputLabel>
                <Select
                  labelId="language-select-label"
                  value={language}
                  label={t('loginPage.language')}
                  onChange={handleLanguageChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <LanguageIcon sx={{ fontSize: '1.05rem', color: 'primary.main' }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="ar">العربية</MenuItem>
                </Select>
              </FormControl>

             
                <Box component="form" onSubmit={handleLogin} sx={{ display: 'grid', gap: 2.2 }}>
                  <TextField
                    disabled={auth.loading}
                    placeholder={t('loginPage.usernameLabel')}
                    label={t('loginPage.usernameLabel')}
                    value={username}
                    onChange={(event) => setUserName(event.target.value)}
                    error={Boolean(auth.error)}
                    autoComplete="username"
                    fullWidth
                    required
                    variant="outlined"
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: 'primary.main', fontSize: '1.25rem' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    disabled={auth.loading}
                    placeholder={t('loginPage.passwordLabel')}
                    label={t('loginPage.passwordLabel')}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    error={Boolean(auth.error)}
                    autoComplete="current-password"
                    fullWidth
                    required
                    variant="outlined"
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: 'primary.main', fontSize: '1.25rem' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => setShowPassword((value) => !value)}
                            disabled={auth.loading}
                            aria-label="toggle password visibility"
                          >
                            {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {auth.error && (
                    <Alert severity="error" sx={{ fontSize: '0.9rem' }}>
                      {auth.error}
                    </Alert>
                  )}

                  {settings.isError && (
                    <Alert severity="warning" sx={{ fontSize: '0.9rem' }}>
                      {t('loginPage.settingsError')}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={auth.loading}
                    fullWidth
                    endIcon={!isArabic ? <ArrowForwardRoundedIcon /> : null}
                    startIcon={isArabic ? <ArrowForwardRoundedIcon sx={{ transform: 'rotate(180deg)' }} /> : null}
                    sx={{ py: 1.55, fontSize: '1rem', mt: 0.4 }}
                  >
                    {auth.loading ? t('loginPage.loading') : t('loginPage.loginButton')}
                  </Button>
                </Box>
          

              <Stack spacing={1.05} sx={{ mt: 4, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary', fontWeight: 650 }}>
                  {t('loginPage.forgotPassword')}
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: 'text.disabled' }}>
                  {t('loginPage.copyright')}
                </Typography>
              </Stack>
            </Box>
          </Card>
        </Box>
      </Container>
        )}
    </Box>
  );
}

export default Login;
