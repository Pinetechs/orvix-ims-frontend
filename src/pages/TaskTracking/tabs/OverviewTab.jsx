import React from 'react';
import { Alert, Box, Card, CardContent, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import { useTranslation } from 'react-i18next';

import {
  clampTrackingPercentage,
  formatTrackingDateTime,
  formatTrackingDuration,
  formatTrackingNumber,
  formatTrackingQuantity,
  hasQuantityMetrics,
} from '../utils/trackingFormatters.js';
import { trackingPanelSx, trackingSectionIconSx, trackingToolbarSx } from '../components/trackingStyles.js';

const MetricTile = ({ icon, label, value, tone = 'primary', onClick }) => (
  <Box
    component={onClick ? 'button' : 'div'}
    type={onClick ? 'button' : undefined}
    onClick={onClick}
    sx={(theme) => ({
      height: '100%',
      width: '100%',
      minHeight: 82,
      p: 1.5,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 1.5,
      bgcolor: 'background.paper',
      color: 'inherit',
      font: 'inherit',
      textAlign: 'start',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 140ms ease, background-color 140ms ease',
      ...(onClick && {
        '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.35), bgcolor: alpha(theme.palette.primary.main, 0.025) },
        '&:focus-visible': { outline: `3px solid ${alpha(theme.palette.primary.main, 0.18)}`, outlineOffset: 2 },
      }),
    })}
  >
    <Stack direction="row" spacing={1.1} alignItems="center">
      <Box
        sx={(theme) => ({
          width: 36,
          height: 36,
          borderRadius: 1.25,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          color: `${tone}.main`,
          bgcolor: alpha(theme.palette[tone]?.main || theme.palette.primary.main, 0.07),
          '& .MuiSvgIcon-root': { fontSize: 20 },
        })}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 750 }}>{label}</Typography>
        <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, lineHeight: 1.3, mt: 0.15 }}>{value}</Typography>
      </Box>
    </Stack>
  </Box>
);

const CompactMetric = ({ icon, label, value, tone = 'primary', onClick }) => (
  <Box
    component={onClick ? 'button' : 'div'}
    type={onClick ? 'button' : undefined}
    onClick={onClick}
    sx={(theme) => ({
      minWidth: 0,
      width: '100%',
      p: 1.6,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 1.25,
      bgcolor: '#FCFDFE',
      color: 'inherit',
      font: 'inherit',
      textAlign: 'start',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 140ms ease, background-color 140ms ease',
      ...(onClick && {
        '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.35), bgcolor: alpha(theme.palette.primary.main, 0.025) },
        '&:focus-visible': { outline: `3px solid ${alpha(theme.palette.primary.main, 0.18)}`, outlineOffset: 2 },
      }),
    })}
  >
    <Stack direction="row" spacing={1.1} alignItems="center">
      <Box
        sx={(theme) => ({
          width: 34,
          height: 34,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 1.1,
          color: `${tone}.main`,
          bgcolor: alpha(theme.palette[tone]?.main || theme.palette.primary.main, 0.07),
          '& .MuiSvgIcon-root': { fontSize: 18 },
        })}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography color="text.secondary" noWrap sx={{ fontSize: '0.68rem', fontWeight: 750 }}>{label}</Typography>
        <Typography sx={{ fontSize: '1.05rem', lineHeight: 1.25, fontWeight: 900, mt: 0.15 }}>{value}</Typography>
      </Box>
    </Stack>
  </Box>
);

const compactGridSx = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, minmax(0, 1fr))',
    md: 'repeat(3, minmax(0, 1fr))',
    xl: 'repeat(5, minmax(0, 1fr))',
  },
  gap: 1.1,
};

function SectionHeader({ icon, tone, title, subtitle }) {
  return (
    <Stack direction="row" spacing={1.1} alignItems="center" sx={trackingToolbarSx}>
      <Box sx={trackingSectionIconSx(tone)}>{icon}</Box>
      <Box>
        <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
        {subtitle && <Typography color="text.secondary" sx={{ fontSize: '0.78rem', mt: 0.1 }}>{subtitle}</Typography>}
      </Box>
    </Stack>
  );
}

function OverviewTab({ overview, onOpenScanEvents, onOpenResults }) {
  const { t, i18n } = useTranslation();
  const metrics = overview?.execution || {};
  const activity = overview?.activity || {};
  const number = (value) => formatTrackingNumber(value, i18n.language);
  const quantity = (value) => formatTrackingQuantity(value, i18n.language);
  const progress = clampTrackingPercentage(metrics.progressPercentage);

  const executionTiles = [
    { key: 'expected', resultFilter: 'ALL', value: number(metrics.totalExpected), icon: <Inventory2OutlinedIcon />, tone: 'primary' },
    { key: 'processed', value: number(metrics.processedExpected), icon: <QrCodeScannerRoundedIcon />, tone: 'info' },
    { key: 'matched', resultFilter: 'MATCHED', value: number(metrics.matched), icon: <CheckCircleOutlineRoundedIcon />, tone: 'success' },
    { key: 'mismatched', resultFilter: 'MISMATCHED', value: number(metrics.mismatched), icon: <WarningAmberRoundedIcon />, tone: 'error' },
    { key: 'remaining', resultFilter: 'REMAINING', value: number(metrics.remaining), icon: <PendingActionsRoundedIcon />, tone: 'warning' },
  ];
  const eventTiles = [
    { key: 'totalEvents', eventType: 'ALL', value: number(activity.totalEvents), icon: <QrCodeScannerRoundedIcon />, tone: 'primary' },
    { key: 'duplicates', eventType: 'DUPLICATE', value: number(activity.duplicates), icon: <ContentCopyRoundedIcon />, tone: 'warning' },
    { key: 'conflicts', eventType: 'CONFLICT', value: number(activity.conflicts), icon: <CompareArrowsRoundedIcon />, tone: 'error' },
    { key: 'corrections', eventType: 'CORRECTION', value: number(activity.corrections), icon: <EditNoteRoundedIcon />, tone: 'info' },
    { key: 'extras', eventType: 'EXTRA', value: number(activity.extraEvents), icon: <WarningAmberRoundedIcon />, tone: 'warning' },
  ];

  return (
    <Stack spacing={1.5}>
      {overview?.status === 'PAUSED' && (
        <Alert severity="warning" variant="outlined">
          <Typography sx={{ fontWeight: 800 }}>{t('taskTracking.overview.paused')}</Typography>
          {overview.pauseReason && <Typography sx={{ mt: 0.25 }}>{overview.pauseReason}</Typography>}
        </Alert>
      )}

      <Card sx={trackingPanelSx}>
        <SectionHeader
          icon={<InsightsRoundedIcon />}
          tone="primary"
          title={t('taskTracking.overview.executionTitle')}
          subtitle={t('taskTracking.overview.executionSubtitle')}
        />
        <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 750 }}>
              {number(metrics.processedExpected)} / {number(metrics.totalExpected)}
            </Typography>
            <Typography color="primary.main" sx={{ fontSize: '1.15rem', fontWeight: 900 }}>{progress}%</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={progress} sx={{ mt: 0.75, mb: 2, height: 8, borderRadius: 1, '& .MuiLinearProgress-bar': { borderRadius: 1 } }} />
          <Grid container spacing={1.25}>
            {executionTiles.map((tile) => (
              <Grid item xs={12} sm={6} md={4} lg key={tile.key}>
                <MetricTile
                  {...tile}
                  label={t(`taskTracking.overview.metrics.${tile.key}`)}
                  onClick={tile.resultFilter ? () => onOpenResults?.(tile.resultFilter) : undefined}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {hasQuantityMetrics(overview) && (
        <Card sx={trackingPanelSx}>
          <SectionHeader icon={<StraightenRoundedIcon />} tone="primary" title={t('taskTracking.overview.quantityTitle')} />
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={compactGridSx}>
              {['totalExpectedQuantity', 'actualQuantity', 'shortageQuantity', 'overageQuantity', 'netVarianceQuantity'].map((key) => (
                <CompactMetric
                  key={key}
                  label={t(`taskTracking.overview.quantities.${key}`)}
                  value={quantity(metrics[key])}
                  icon={<Inventory2OutlinedIcon />}
                  tone={key === 'shortageQuantity' || key === 'netVarianceQuantity' ? 'error' : key === 'overageQuantity' ? 'warning' : 'primary'}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={trackingPanelSx}>
        <SectionHeader
          icon={<QrCodeScannerRoundedIcon />}
          tone="info"
          title={t('taskTracking.overview.activityTitle')}
          subtitle={t('taskTracking.overview.activitySubtitle')}
        />
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={compactGridSx}>
            {eventTiles.map((tile) => (
              <CompactMetric
                key={tile.key}
                {...tile}
                label={t(`taskTracking.overview.events.${tile.key}`)}
                onClick={() => onOpenScanEvents?.(tile.eventType)}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card sx={trackingPanelSx}>
        <SectionHeader icon={<AccessTimeRoundedIcon />} tone="primary" title={t('taskTracking.overview.timingTitle')} />
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Grid container>
            {[
              ['startedAt', formatTrackingDateTime(overview?.startedAt, i18n.language)],
              ['lastActivityAt', formatTrackingDateTime(activity.lastActivityAt, i18n.language)],
              ['activeTime', formatTrackingDuration(overview?.activeWorkingSeconds, t)],
              ['reviewStartedAt', formatTrackingDateTime(overview?.reviewStartedAt, i18n.language)],
              ['closedAt', formatTrackingDateTime(overview?.closedAt, i18n.language)],
            ].map(([key, value]) => (
              <Grid item xs={12} sm={6} lg key={key} sx={{ p: 2, borderInlineEnd: { lg: 1 }, borderBottom: { xs: 1, lg: 0 }, borderColor: 'divider' }}>
                <Typography color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 750 }}>{t(`taskTracking.overview.timing.${key}`)}</Typography>
                <Typography sx={{ fontWeight: 850, mt: 0.35, fontSize: '0.82rem' }}>{value}</Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default OverviewTab;
