import React from 'react';
import { Box, Drawer, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppFooter from '../AppFooter.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const iconSize = 30;

const navItems = [
  { icon: <DashboardIcon sx={{ fontSize: iconSize }} />, label: 'Dashboard', path: '/' },
  { icon: <BusinessIcon sx={{ fontSize: iconSize }} />, label: 'Companies', path: '/companies', requiredPermission: 'COMPANY_VIEW' },
  { icon: <PeopleIcon sx={{ fontSize: iconSize }} />, label: 'Users', path: '/users', requiredPermission: 'USER_VIEW' },
  {
    icon: <AssignmentIcon sx={{ fontSize: iconSize }} />,
    label: 'Inventory Tasks',
    path: '/inventory-tasks',
    requiredPermission: ['VEHICLE_TASK_VIEW', 'ASSET_TASK_VIEW', 'SPARE_PART_TASK_VIEW'],
  },
  {
    icon: <AssessmentIcon sx={{ fontSize: iconSize }} />,
    label: 'Reports',
    path: '/reports',
    requiredPermission: ['VEHICLE_REPORT_VIEW', 'ASSET_REPORT_VIEW', 'SPARE_PART_REPORT_VIEW'],
  },
];

  const LeftNavContent = ({ location, onNavClick }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  return (
    <Box
      sx={{
        width: { xs: 72, md: 96 },
        height: '100%',
        bgcolor: '#0B3C5D',
        py: 2,
        px: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {navItems
        .filter((item) => {
          if (!item.requiredPermission) return true;
          return auth.hasPermission ? auth.hasPermission(item.requiredPermission) : false;
        })
        .map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Tooltip title={item.label} placement="right" key={item.path} arrow>
            <Box
              onClick={() => {
                navigate(item.path);
                onNavClick?.();
              }}
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 1.2,
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: isActive ? '#D9B310' : 'transparent',
                color: isActive ? '#0B3C5D' : '#fff',
                transition: 'all .2s ease',
                '&:hover': { bgcolor: '#D9B310', color: '#0B3C5D' },
              }}
            >
              {item.icon}
              <Typography sx={{ fontSize: 11, fontWeight: 700, mt: 0.5, display: { xs: 'none', md: 'block' }, textAlign: 'center' }}>
                {item.label}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
};

const LeftNav = ({ drawerOpen, onNavClick }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {!isMobile && (
        <Box sx={{ position: 'fixed', top: 64, left: 0, bottom: 0, zIndex: (muiTheme) => muiTheme.zIndex.appBar - 1 }}>
          <LeftNavContent location={location} />
        </Box>
      )}

      {isMobile && (
        <Drawer anchor="left" open={drawerOpen} onClose={onNavClick} PaperProps={{ sx: { width: 72, bgcolor: '#0B3C5D' } }}>
          <LeftNavContent location={location} onNavClick={onNavClick} />
        </Drawer>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh', ml: { xs: 0, md: '96px' } }}>
        <Box
          component="main"
          sx={{
            flex: 1,
            pt: { xs: '72px', md: '88px' },
            px: { xs: 1.5, md: 3 },
            pb: 3,
            bgcolor: '#F7F9FB',
            minWidth: 0,
          }}
        >
          <Outlet />
        </Box>
        <AppFooter />
      </Box>
    </Box>
  );
};

export default LeftNav;
