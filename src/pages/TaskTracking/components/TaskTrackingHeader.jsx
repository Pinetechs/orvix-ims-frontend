import React from 'react';
import { Box, Button, Chip, Divider, IconButton, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useTranslation } from 'react-i18next';

import EnumChip from '../../../components/common/EnumChip.jsx';
import { INVENTORY_DOMAIN_CHIP_CONFIG, INVENTORY_TASK_STATUS_CHIP_CONFIG } from '../../../constants/enumChipConfigs.jsx';
import { clampTrackingPercentage, formatTrackingDateTime, formatTrackingNumber } from '../utils/trackingFormatters.js';

const ACTIONS = [
  { key: 'markReady', icon: <CheckCircleOutlineRoundedIcon />, color: 'primary' },
  { key: 'start', icon: <PlayArrowRoundedIcon />, color: 'primary' },
  { key: 'pause', icon: <PauseCircleOutlineRoundedIcon />, color: 'warning' },
  { key: 'resume', icon: <PlayArrowRoundedIcon />, color: 'primary' },
  { key: 'submitForReview', icon: <RateReviewOutlinedIcon />, color: 'primary' },
  { key: 'returnToProgress', icon: <ReplayRoundedIcon />, color: 'warning' },
  { key: 'complete', icon: <TaskAltRoundedIcon />, color: 'success' },
  { key: 'cancel', icon: <CancelOutlinedIcon />, color: 'error', variant: 'outlined' },
];

function TaskTrackingHeader({ overview, isFetching, onBack, onRefresh, onManage, onAction }) {
  const { t, i18n } = useTranslation();
  const actions = overview?.allowedActions || {};
  const availableActions = ACTIONS.filter(({ key }) => actions[key]);
  const progress = clampTrackingPercentage(overview?.execution?.progressPercentage);
  const processed = formatTrackingNumber(overview?.execution?.processedExpected, i18n.language);
  const expected = formatTrackingNumber(overview?.execution?.totalExpected, i18n.language);
  const domainConfig = Object.fromEntries(Object.entries(INVENTORY_DOMAIN_CHIP_CONFIG).map(([key, value]) => [
    key,
    { ...value, label: t(`dashboardPage.domains.names.${key}`) },
  ]));
  const statusConfig = Object.fromEntries(Object.entries(INVENTORY_TASK_STATUS_CHIP_CONFIG).map(([key, value]) => [
    key,
    { ...value, label: t(`dashboardPage.statuses.${key}`) },
  ]));

  return (
    <Box
      sx={(theme) => ({
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.primary.dark, 0.1)}`,
        borderRadius: 1.5,
        boxShadow: `0 4px 16px ${alpha(theme.palette.primary.dark, 0.055)}`,
        overflow: 'hidden',
      })}
    >
      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} justifyContent="space-between">
          <Stack direction="row" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
            <Tooltip title={t('taskTracking.header.back')}>
              <IconButton
                onClick={onBack}
                size="small"
                sx={{ alignSelf: 'flex-start', border: 1, borderColor: 'divider', borderRadius: 1.5 }}
              >
                <ArrowBackRoundedIcon />
              </IconButton>
            </Tooltip>

            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography
                  variant="h4"
                  sx={{ fontSize: { xs: '1.45rem', md: '1.75rem' }, fontWeight: 900, letterSpacing: -0.35, overflowWrap: 'anywhere' }}
                >
                  {overview?.taskName || overview?.taskNumber}
                </Typography>
                <EnumChip value={overview?.status} config={statusConfig} />
                {overview?.stalled && <Chip size="small" color="error" variant="outlined" label={t('taskTracking.header.stalled')} />}
              </Stack>

              <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.7 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem', fontWeight: 800 }}>{overview?.taskNumber}</Typography>
                <Typography color="text.disabled">•</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>{overview?.company?.name || '-'}</Typography>
              </Stack>

              <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
                <EnumChip value={overview?.domain} config={domainConfig} />
                {overview?.scanImageRequired && <Chip size="small" variant="outlined" label={t('taskTracking.header.imageRequired')} />}
                <Chip
                  size="small"
                  variant="outlined"
                  label={t('taskTracking.header.generatedAt', { value: formatTrackingDateTime(overview?.generatedAt, i18n.language) })}
                  sx={{ color: 'text.secondary', fontWeight: 700 }}
                />
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.75} alignSelf={{ lg: 'flex-start' }}>
            <Button variant="outlined" size="small" startIcon={<SettingsOutlinedIcon />} onClick={onManage}>
              {t('taskTracking.header.manage')}
            </Button>
            <Tooltip title={t('taskTracking.common.refresh')}>
              <span>
                <IconButton
                  size="small"
                  onClick={onRefresh}
                  disabled={isFetching}
                  sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5 }}
                >
                  <RefreshRoundedIcon sx={{ animation: isFetching ? 'tracking-spin 900ms linear infinite' : 'none', '@keyframes tracking-spin': { to: { transform: 'rotate(360deg)' } } }} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      <Divider />

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        alignItems={{ lg: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ px: { xs: 2, md: 2.5 }, py: 1.75, bgcolor: '#FAFBFD' }}
      >
        <Box sx={{ width: { xs: '100%', lg: 360 }, flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary', fontWeight: 800 }}>
              {t('taskTracking.overview.executionTitle')}
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 900 }}>
              {progress}% · {processed}/{expected}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mt: 0.75, height: 7, borderRadius: 1, bgcolor: 'rgba(0,81,210,.09)', '& .MuiLinearProgress-bar': { borderRadius: 1 } }}
          />
        </Box>

        {availableActions.length > 0 && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap justifyContent={{ lg: 'flex-end' }}>
            {availableActions.map(({ key, icon, color, variant }) => (
              <Button
                key={key}
                size="small"
                color={color}
                variant={variant || 'outlined'}
                startIcon={icon}
                onClick={() => onAction?.(key)}
                sx={{ minHeight: 36, bgcolor: 'background.paper' }}
              >
                {t(`taskTracking.actions.${key}`)}
              </Button>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export default TaskTrackingHeader;
