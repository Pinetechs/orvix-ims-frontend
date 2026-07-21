import React from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { useTranslation } from 'react-i18next';

import { formatDashboardDateTime } from '../utils/dashboardFormatters.js';

function DashboardHeader({ generatedAt, operational, isFetching, onRefresh }) {
  const { t, i18n } = useTranslation();

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'stretch', md: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 950, mb: 0.55 }}>
          {t('dashboardPage.title')}
        </Typography>
        <Typography color="text.secondary">
          {t(operational ? 'dashboardPage.operationalSubtitle' : 'dashboardPage.administrationSubtitle')}
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.2}>
        {generatedAt && (
          <Chip
            variant="outlined"
            icon={<AccessTimeRoundedIcon />}
            label={t('dashboardPage.updatedAt', {
              value: formatDashboardDateTime(generatedAt, i18n.language),
            })}
            sx={{ bgcolor: 'background.paper' }}
          />
        )}
        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon sx={{ animation: isFetching ? 'dashboard-spin 0.9s linear infinite' : 'none' }} />}
          onClick={onRefresh}
          disabled={isFetching}
          sx={{ bgcolor: 'background.paper', '@keyframes dashboard-spin': { to: { transform: 'rotate(360deg)' } } }}
        >
          {t('dashboardPage.refresh')}
        </Button>
      </Stack>
    </Stack>
  );
}

export default DashboardHeader;
