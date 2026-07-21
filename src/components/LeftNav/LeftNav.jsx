import React from 'react';
import { Box, Drawer, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppFooter from '../AppFooter.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const iconSize = 28;

const navItems = [
  { icon: <DashboardIcon sx={{ fontSize: iconSize }} />, labelKey: 'dashboard', path: '/' },
  { icon: <BusinessIcon sx={{ fontSize: iconSize }} />, labelKey: 'companies', path: '/companies', requiredPermission: 'COMPANY_VIEW' },
  { icon: <PeopleIcon sx={{ fontSize: iconSize }} />, labelKey: 'users', path: '/users', requiredPermission: 'USER_VIEW' },
  {
    icon: <AssignmentIcon sx={{ fontSize: iconSize }} />,
    labelKey: 'inventoryTasks',
    path: '/inventory-tasks',
    activePaths: ['/inventory-tasks', '/task-tracking'],
    requiredPermission: ['VEHICLE_TASK_VIEW', 'ASSET_TASK_VIEW', 'SPARE_PART_TASK_VIEW'],
  },
  {
    icon: <AssessmentIcon sx={{ fontSize: iconSize }} />,
    labelKey: 'reports',
    path: '/reports',
    requiredPermission: ['VEHICLE_REPORT_VIEW', 'ASSET_REPORT_VIEW', 'SPARE_PART_REPORT_VIEW'],
  },
];

const LeftNavContent = ({ location, onNavClick }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      sx={(theme) => ({
        width: { xs: 76, md: 104 },
        height: '100%',
        bgcolor: '#011736',
        background: 'linear-gradient(180deg, #011736 0%, #041D47 52%, #001123 100%)',
        py: 2,
        px: 1.15,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        borderInlineEnd: `1px solid ${alpha(theme.palette.primary.light, 0.14)}`,
      })}
    >
      {navItems
        .filter((item) => {
          if (!item.requiredPermission) return true;
          return auth.hasPermission ? auth.hasPermission(item.requiredPermission) : false;
        })
        .map((item) => {
        const activePaths = item.activePaths || [item.path];
        const isActive = item.path === '/'
          ? location.pathname === '/'
          : activePaths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));
        return (
          <Tooltip title={t(item.labelKey)} placement={theme.direction === 'rtl' ? 'left' : 'right'} key={item.path} arrow>
            <Box
              onClick={() => {
                navigate(item.path);
                onNavClick?.();
              }}
              sx={(theme) => ({
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 1.25,
                borderRadius: 3,
                cursor: 'pointer',
                bgcolor: isActive ? alpha(theme.palette.primary.light, 0.18) : 'transparent',
                color: isActive ? '#FFFFFF' : alpha(theme.palette.common.white, 0.74),
                border: `1px solid ${isActive ? alpha(theme.palette.primary.light, 0.38) : 'transparent'}`,
                boxShadow: isActive ? `0 14px 30px ${alpha(theme.palette.primary.light, 0.16)}` : 'none',
                transition: 'all .2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.light, 0.16),
                  color: '#FFFFFF',
                  transform: 'translateY(-1px)',
                },
              })}
            >
              {item.icon}
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, mt: 0.6, display: { xs: 'none', md: 'block' }, textAlign: 'center', lineHeight: 1.2 }}>
                {t(item.labelKey)}
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
        <Box sx={{ position: 'fixed', top: 76, insetInlineStart: 0, bottom: 0, zIndex: (muiTheme) => muiTheme.zIndex.appBar - 1 }}>
          <LeftNavContent location={location} />
        </Box>
      )}

      {isMobile && (
        <Drawer
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={drawerOpen}
          onClose={onNavClick}
          PaperProps={{ sx: { width: 76, bgcolor: '#011736' } }}
        >
          <LeftNavContent location={location} onNavClick={onNavClick} />
        </Drawer>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh', marginInlineStart: { xs: 0, md: '104px' }, minWidth: 0 }}>
        <Box
          component="main"
          sx={(muiTheme) => ({
            flex: 1,
            pt: { xs: '88px', md: '100px' },
            px: { xs: 1, sm: 1.5, md: 3 },
            pb: 3,
            bgcolor: muiTheme.palette.background.default,
            background:
              'radial-gradient(circle at 12% 10%, rgba(0,81,210,0.07) 0, transparent 26%), radial-gradient(circle at 88% 18%, rgba(16,124,255,0.08) 0, transparent 28%), #F4F7FF',
            minWidth: 0,
            width: '100%',
            overflowX: 'hidden',
          })}
        >
          <Outlet />
        </Box>
        <AppFooter />
      </Box>
    </Box>
  );
};

export default LeftNav;
