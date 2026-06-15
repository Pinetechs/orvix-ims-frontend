import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import ServerTablePage from '../Placeholder/ServerTablePage.jsx';
import { getUsers } from '../../services/userService.js';

function Users() {
  const { t } = useTranslation();
  const auth = useAuth();
  const query = useQuery({ queryKey: ['users'], queryFn: getUsers });

  if (!auth.hasPermission('USER_VIEW')) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('permissions.noUserViewPermission')}
        </Alert>
        <Typography>{t('permissions.contactAdmin')}</Typography>
      </Box>
    );
  }

  return <ServerTablePage title="Users" description="Manage system admins, company admins, supervisors and inventory staff." query={query} />;
}

export default Users;
