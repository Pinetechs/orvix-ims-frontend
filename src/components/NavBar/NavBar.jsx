import React from 'react';
import { AppBar, Box, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LeftNav from '../LeftNav/index.js';
import { useAuth } from '../../hooks/useAuth.js';
import Logo from '../../assets/images/logo/orvix-ims-logo.svg';

const getDisplayName = (auth) => {
  const user = auth.user || {};
  return user.firstName || user.name || user.username || user.userName || 'User';
};

const NavBar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  const auth = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await auth.logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <AppBar
        component="nav"
        elevation={0}
        sx={(theme) => ({
          bgcolor: alpha('#FFFFFF', 0.9),
          color: 'text.primary',
          minHeight: 76,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 18px 42px ${alpha(theme.palette.primary.dark, 0.08)}`,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: theme.zIndex.appBar,
        })}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 76, px: { xs: 1.2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
            <IconButton sx={{ display: { xs: 'inline-flex', md: 'none' }, color: 'primary.main' }} onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>

            <Box
              sx={(theme) => ({
                width: 54,
                height: 54,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: `0 12px 28px ${alpha(theme.palette.primary.dark, 0.1)}`,
                overflow: 'hidden',
              })}
            >
              <Box
                component="img"
                src={Logo}
                alt="Orvix ERP"
                sx={{ width: '92%', height: '92%', objectFit: 'contain', display: 'block' }}
              />
            </Box>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950, lineHeight: 1.05, letterSpacing: -0.3 }}>
                Orvix ERP
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.74rem', fontWeight: 750 }}>
                {t('loginPage.systemTagline')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.8 } }}>
            <Typography sx={{ color: 'text.primary', fontWeight: 800, display: { xs: 'none', md: 'block' } }}>
              {getDisplayName(auth)}
            </Typography>
            <AccountCircleIcon
              onClick={(event) => setAnchorEl(event.currentTarget)}
              sx={(theme) => ({
                cursor: 'pointer',
                fontSize: 34,
                color: theme.palette.primary.main,
                '&:hover': { color: theme.palette.secondary.main },
              })}
            />
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem
                onClick={() => {
                  navigate('/update-password');
                  setAnchorEl(null);
                }}
              >
                {t('changePassword')}
              </MenuItem>
            </Menu>
            <LogoutIcon
              onClick={handleLogout}
              sx={(theme) => ({
                cursor: 'pointer',
                fontSize: 28,
                color: theme.palette.text.secondary,
                '&:hover': { color: theme.palette.primary.main },
              })}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <LeftNav drawerOpen={drawerOpen} onNavClick={() => setDrawerOpen(false)} />
    </>
  );
};

export default NavBar;
