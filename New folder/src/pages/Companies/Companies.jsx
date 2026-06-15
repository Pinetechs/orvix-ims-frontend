import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import ServerTablePage from '../Placeholder/ServerTablePage.jsx';
import { getCompanies } from '../../services/companyService.js';

function Companies() {
  const { t } = useTranslation();
  const auth = useAuth();
  const query = useQuery({ queryKey: ['companies'], queryFn: getCompanies });

  if (!auth.hasPermission('COMPANY_VIEW')) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('permissions.noCompanyViewPermission')}
        </Alert>
        <Typography>{t('permissions.contactAdmin')}</Typography>
      </Box>
    );
  }

  return <ServerTablePage title="Companies" description="Manage companies available in Orvix IMS." query={query} />;
}

export default Companies;
