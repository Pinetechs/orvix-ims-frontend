import React from 'react';
import { Box, Card, CardContent, CircularProgress, Divider, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import { clampPercentage, formatDashboardNumber } from '../utils/dashboardFormatters.js';

function ExecutionOverview({ summary = {} }) {
  const { t, i18n } = useTranslation();
  const progress = clampPercentage(summary.progressPercentage);
  const number = (value) => formatDashboardNumber(value, i18n.language);
  const values = [
    ['expected', summary.expected],
    ['processed', summary.processed],
    ['remaining', summary.remaining],
    ['matched', summary.matched],
    ['mismatched', summary.mismatched],
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2.2, md: 2.8 }, '&:last-child': { pb: { xs: 2.2, md: 2.8 } } }}>
        <Typography variant="h6" sx={{ fontWeight: 950 }}>
          {t('dashboardPage.execution.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.84rem', mt: 0.35, mb: 2.7 }}>
          {t('dashboardPage.execution.subtitle')}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          <Box sx={{ position: 'relative', width: 126, height: 126, flexShrink: 0 }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={126}
              thickness={5}
              sx={(theme) => ({ color: alpha(theme.palette.primary.main, 0.1), position: 'absolute' })}
            />
            <CircularProgress
              variant="determinate"
              value={progress}
              size={126}
              thickness={5}
              sx={{ position: 'absolute', inset: 0, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
            />
            <Stack sx={{ position: 'absolute', inset: 0 }} alignItems="center" justifyContent="center">
              <Typography variant="h4" sx={{ fontWeight: 950 }}>{progress}%</Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.72rem', fontWeight: 800 }}>
                {t('dashboardPage.execution.complete')}
              </Typography>
            </Stack>
          </Box>

          <Grid container spacing={1.4} sx={{ flex: 1, width: '100%' }}>
            {values.map(([key, value], index) => (
              <Grid item xs={6} sm={index === 4 ? 12 : 6} lg={index === 4 ? 12 : 6} key={key}>
                <Box
                  sx={(theme) => ({
                    px: 1.5,
                    py: 1.3,
                    borderRadius: 3,
                    bgcolor: key === 'mismatched' && Number(value) > 0
                      ? alpha(theme.palette.error.main, 0.07)
                      : alpha(theme.palette.primary.main, 0.045),
                  })}
                >
                  <Typography color="text.secondary" sx={{ fontSize: '0.72rem', fontWeight: 800 }}>
                    {t(`dashboardPage.execution.${key}`)}
                  </Typography>
                  <Typography
                    sx={{ fontWeight: 950, mt: 0.25 }}
                    color={key === 'mismatched' && Number(value) > 0 ? 'error.main' : 'text.primary'}
                  >
                    {number(value)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Stack>
        <Divider sx={{ mt: 2.5, mb: 1.4 }} />
        <Typography color="text.secondary" sx={{ fontSize: '0.76rem' }}>
          {t('dashboardPage.execution.calculationNote')}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ExecutionOverview;
