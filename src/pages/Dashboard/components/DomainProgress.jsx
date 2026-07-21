import React from 'react';
import { Box, Card, CardContent, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import { useTranslation } from 'react-i18next';

import { clampPercentage, formatDashboardNumber } from '../utils/dashboardFormatters.js';

const DOMAIN_CONFIG = {
  VEHICLE: { color: '#0051D2', icon: <DirectionsCarFilledOutlinedIcon /> },
  ASSET: { color: '#7C3AED', icon: <Inventory2OutlinedIcon /> },
  SPARE_PART: { color: '#EA580C', icon: <BuildCircleOutlinedIcon /> },
};

const DOMAINS = ['VEHICLE', 'ASSET', 'SPARE_PART'];

function DomainProgress({ summaries = [] }) {
  const { t, i18n } = useTranslation();
  const summaryByDomain = new Map(summaries.map((item) => [item.domain, item]));
  const number = (value) => formatDashboardNumber(value, i18n.language);

  return (
    <Box sx={{ mt: 2.2 }}>
      <Typography variant="h6" sx={{ fontWeight: 950 }}>
        {t('dashboardPage.domains.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: '0.84rem', mt: 0.35, mb: 1.6 }}>
        {t('dashboardPage.domains.subtitle')}
      </Typography>

      <Grid container spacing={2.2}>
        {DOMAINS.map((domain) => {
          const summary = summaryByDomain.get(domain) || {};
          const config = DOMAIN_CONFIG[domain];
          const progress = clampPercentage(summary.progressPercentage);

          return (
            <Grid item xs={12} md={4} key={domain}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.3, '&:last-child': { pb: 2.3 } }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1.2}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: 3,
                          color: config.color,
                          bgcolor: alpha(config.color, 0.09),
                          '& svg': { fontSize: 24 },
                        }}
                      >
                        {config.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 950 }}>
                          {t(`dashboardPage.domains.names.${domain}`)}
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontSize: '0.73rem' }}>
                          {t('dashboardPage.domains.activeTasks', { count: number(summary.activeTasks) })}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography sx={{ fontWeight: 950, color: config.color }}>{progress}%</Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      mt: 2,
                      mb: 1.7,
                      height: 8,
                      borderRadius: 99,
                      bgcolor: alpha(config.color, 0.1),
                      '& .MuiLinearProgress-bar': { bgcolor: config.color, borderRadius: 99 },
                    }}
                  />

                  <Grid container spacing={1}>
                    {['expected', 'processed', 'remaining', 'mismatched'].map((key) => (
                      <Grid item xs={6} key={key}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Typography color="text.secondary" sx={{ fontSize: '0.74rem' }}>
                            {t(`dashboardPage.execution.${key}`)}
                          </Typography>
                          <Typography
                            sx={{ fontSize: '0.76rem', fontWeight: 900 }}
                            color={key === 'mismatched' && Number(summary[key]) > 0 ? 'error.main' : 'text.primary'}
                          >
                            {number(summary[key])}
                          </Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default DomainProgress;
