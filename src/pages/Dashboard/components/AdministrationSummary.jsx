import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import DomainVerificationRoundedIcon from '@mui/icons-material/DomainVerificationRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import { useTranslation } from 'react-i18next';

import MetricCard from '../../../components/common/MetricCard.jsx';
import { formatDashboardNumber } from '../utils/dashboardFormatters.js';

function AdministrationSummary({ summary = {} }) {
  const { t, i18n } = useTranslation();
  const number = (value) => formatDashboardNumber(value, i18n.language);
  const metrics = [
    ['totalCompanies', summary.totalCompanies, <BusinessRoundedIcon />, '#0051D2'],
    ['activeCompanies', summary.activeCompanies, <DomainVerificationRoundedIcon />, '#0891B2'],
    ['totalUsers', summary.totalUsers, <PeopleAltRoundedIcon />, '#7C3AED'],
    ['activeUsers', summary.activeUsers, <HowToRegRoundedIcon />, '#16A34A'],
  ];

  return (
    <Box sx={{ mb: 2.2 }}>
      <Typography variant="h6" sx={{ fontWeight: 950 }}>
        {t('dashboardPage.administration.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: '0.84rem', mt: 0.35, mb: 1.6 }}>
        {t('dashboardPage.administration.subtitle')}
      </Typography>
      <Grid container spacing={2.2}>
        {metrics.map(([key, value, icon, color]) => (
          <Grid item xs={12} sm={6} xl={3} key={key}>
            <MetricCard
              title={t(`dashboardPage.administration.${key}`)}
              value={number(value)}
              icon={icon}
              color={color}
              accentColor={color}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default AdministrationSummary;
