import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
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
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Logo from '../../assets/images/logo/orvix-ims-logo.svg';
import { baseUrl } from '../../util/constant.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useSettings } from '../../hooks/useSettings.js';
import Progress from '../../components/Loader/Progress.jsx';
import AnimatedBackground from './AnimatedBackground.jsx';

function FeatureItem({ children }) {
  return (
    <Stack direction="row" spacing={1.8} alignItems="flex-start">
      <Box
        sx={(theme) => ({
          width: 30,
          height: 30,
          borderRadius: '10px',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          bgcolor: alpha(theme.palette.common.white, 0.12),
          border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
        })}
      >
        <Box
          sx={(theme) => ({
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: theme.palette.secondary.main,
            boxShadow: `0 0 0 6px ${alpha(theme.palette.secondary.main, 0.16)}`,
          })}
        />
      </Box>

      <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.88)' }}>
        {children}
      </Typography>
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
        bgcolor: '#071923',
        background: `
          radial-gradient(circle at 15% 20%, ${alpha(theme.palette.primary.light, 0.38)} 0, transparent 34%),
          radial-gradient(circle at 85% 15%, ${alpha(theme.palette.secondary.main, 0.2)} 0, transparent 30%),
          linear-gradient(135deg, #061722 0%, #0b334f 45%, #0f5f91 100%)
        `,
      })}
    >
      <AnimatedBackground />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 10,
          py: { xs: 3, md: 6 },
        }}
      >
        <Card
          elevation={0}
          sx={(theme) => ({
            minHeight: { xs: 'auto', md: 640 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '0.95fr 1.05fr' },
            overflow: 'hidden',
            borderRadius: { xs: 4, md: 6 },
            bgcolor: alpha(theme.palette.background.paper, 0.96),
            border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
            boxShadow: `
              0 30px 90px ${alpha(theme.palette.common.black, 0.35)},
              inset 0 1px 0 ${alpha(theme.palette.common.white, 0.2)}
            `,
            backdropFilter: 'blur(18px)',
          })}
        >
          <Box
            sx={(theme) => ({
              position: 'relative',
              overflow: 'hidden',
              p: { xs: 3.5, sm: 5, md: 6 },
              color: 'common.white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: `
                linear-gradient(160deg,
                  ${theme.palette.primary.dark} 0%,
                  ${theme.palette.primary.main} 54%,
                  #082133 100%
                )
              `,
              '&::before': {
                content: '""',
                position: 'absolute',
                width: 280,
                height: 280,
                borderRadius: '50%',
                right: -90,
                top: -90,
                background: alpha(theme.palette.common.white, 0.1),
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: '50%',
                left: -70,
                bottom: 60,
                background: alpha(theme.palette.secondary.main, 0.18),
              },
            })}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
                <Box
                  sx={(theme) => ({
                    width: 68,
                    height: 68,
                    borderRadius: 3,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: alpha(theme.palette.common.white, 0.95),
                    border: `1px solid ${alpha(theme.palette.common.white, 0.25)}`,
                    boxShadow: `0 18px 40px ${alpha(theme.palette.common.black, 0.18)}`,
                  })}
                >
                  <Box
                    component="img"
                    src={Logo}
                    alt={t('loginPage.systemLogoAlt')}
                    sx={{ width: 48, height: 48, objectFit: 'contain' }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: 0.4 }}>
                    Orvix IMS
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.82rem' }}>
                    Inventory Management System
                  </Typography>
                </Box>
              </Stack>

              <Chip
                icon={<Inventory2OutlinedIcon />}
                label="Enterprise Inventory Platform"
                sx={{
                  mb: 3,
                  color: 'common.white',
                  bgcolor: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  '& .MuiChip-icon': { color: 'secondary.main' },
                }}
              />

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 950,
                  lineHeight: 1.08,
                  mb: 2.5,
                  fontSize: { xs: '2rem', md: '2.65rem' },
                  letterSpacing: -1,
                }}
              >
                {t('loginPage.visitorTitle')}
              </Typography>

              <Typography
                sx={{
                  maxWidth: 460,
                  color: 'rgba(255,255,255,0.82)',
                  lineHeight: 1.85,
                  fontSize: '0.98rem',
                  mb: 4.5,
                }}
              >
                {t('loginPage.visitorText')}
              </Typography>

              <Stack spacing={2.5}>
                <FeatureItem>{t('loginPage.feature1')}</FeatureItem>
                <FeatureItem>{t('loginPage.feature2')}</FeatureItem>
                <FeatureItem>{t('loginPage.feature3')}</FeatureItem>
              </Stack>
            </Box>

            <Box sx={{ position: 'relative', zIndex: 1, mt: 6 }}>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.14)', mb: 2.5 }} />

              <Stack direction="row" spacing={1.5} alignItems="center">
                <ShieldOutlinedIcon sx={{ color: 'secondary.main' }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.76)', fontSize: '0.86rem', fontWeight: 600 }}>
                  {t('loginPage.sideNote')}
                </Typography>
              </Stack>
            </Box>
          </Box>

          <Box
            sx={(theme) => ({
              p: { xs: 3.5, sm: 5, md: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.background.paper, 0.98),
            })}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'flex-start' }}
              justifyContent="space-between"
              spacing={2.5}
              sx={{ mb: 4 }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 950,
                    letterSpacing: -0.5,
                    mb: 0.8,
                    fontSize: { xs: '1.65rem', md: '2rem' },
                  }}
                >
                  {t('loginPage.title')}
                </Typography>

                <Typography sx={{ color: 'text.secondary', fontSize: '0.94rem', lineHeight: 1.7 }}>
                  {t('loginPage.subtitle')}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={{ xs: 'space-between', sm: 'flex-end' }}>
                {companyLogoUrl && (
                  <Box
                    component="img"
                    src={companyLogoUrl}
                    alt={t('loginPage.companyLogoAlt')}
                    sx={(theme) => ({
                      height: 44,
                      maxWidth: 130,
                      objectFit: 'contain',
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                      bgcolor: alpha(theme.palette.grey[100], 0.8),
                      p: 0.7,
                    })}
                  />
                )}

                <FormControl size="small" sx={{ minWidth: 132 }}>
                  <InputLabel id="language-select-label">{t('loginPage.language')}</InputLabel>
                  <Select
                    labelId="language-select-label"
                    value={language}
                    label={t('loginPage.language')}
                    onChange={handleLanguageChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <LanguageIcon sx={{ fontSize: '1.05rem', color: 'text.secondary' }} />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                      },
                    }}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="ar">العربية</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            {settings.isLoading ? (
              <Box sx={{ py: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Progress msg={t('loginPage.loading')} />
              </Box>
            ) : (
              <Box component="form" onSubmit={handleLogin} sx={{ display: 'grid', gap: 2.4 }}>
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.4,
                      fontSize: '0.95rem',
                    },
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.4,
                      fontSize: '0.95rem',
                    },
                  }}
                />

                {auth.error && (
                  <Alert severity="error" sx={{ borderRadius: 2, fontSize: '0.9rem' }}>
                    {auth.error}
                  </Alert>
                )}

                {settings.isError && (
                  <Alert severity="warning" sx={{ borderRadius: 2, fontSize: '0.9rem' }}>
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
                  sx={(theme) => ({
                    mt: 0.5,
                    py: 1.45,
                    borderRadius: 2.4,
                    fontSize: '1rem',
                    fontWeight: 850,
                    letterSpacing: 0.2,
                    textTransform: 'none',
                    boxShadow: `0 16px 35px ${alpha(theme.palette.primary.main, 0.28)}`,
                  })}
                >
                  {auth.loading ? t('loginPage.loading') : t('loginPage.loginButton')}
                </Button>
              </Box>
            )}

            <Stack spacing={1.1} sx={{ mt: 4.5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary', fontWeight: 500 }}>
                {t('loginPage.forgotPassword')}
              </Typography>

              <Typography sx={{ fontSize: '0.78rem', color: 'text.disabled' }}>
                {t('loginPage.copyright')}
              </Typography>
            </Stack>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}

export default Login;