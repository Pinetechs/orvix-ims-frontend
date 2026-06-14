import React from 'react';
import { AppBar, Box, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import LeftNav from '../LeftNav/index.js';
import { useAuth } from '../../hooks/useAuth.js';

const getDisplayName = (auth) => {
  const user = auth.user || {};
  return user.firstName || user.name || user.username || user.userName || 'User';
};

const NavBar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogout = async () => {
    await auth.logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <AppBar
        component="nav"
        elevation={0}
        sx={{
          bgcolor: '#0B3C5D',
          color: '#fff',
          minHeight: 64,
          boxShadow: '0 6px 24px 0 rgba(11, 60, 93, 0.18)',
          borderBottom: '2px solid #D9B310',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 64, px: { xs: 1, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ display: { xs: 'inline-flex', md: 'none' }, color: '#fff' }} onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: 18, md: 26 }, letterSpacing: 1, color: '#fff' }}>
              Orvix <Box component="span" sx={{ color: '#D9B310' }}>IMS</Box>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, display: { xs: 'none', md: 'block' } }}>
              {getDisplayName(auth)}
            </Typography>
            <AccountCircleIcon onClick={(event) => setAnchorEl(event.currentTarget)} sx={{ cursor: 'pointer', fontSize: 32, '&:hover': { color: '#D9B310' } }} />
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem
                onClick={() => {
                  navigate('/update-password');
                  setAnchorEl(null);
                }}
              >
                Change Password
              </MenuItem>
            </Menu>
            <LogoutIcon onClick={handleLogout} sx={{ cursor: 'pointer', fontSize: 28, '&:hover': { color: '#D9B310' } }} />
          </Box>
        </Toolbar>
      </AppBar>
      <LeftNav drawerOpen={drawerOpen} onNavClick={() => setDrawerOpen(false)} />
    </>
  );
};

export default NavBar;
