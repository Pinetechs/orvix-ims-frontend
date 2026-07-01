import React from 'react';
import { Alert, Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';

import { getBackgroundJobErrorMessage, getBackgroundJobMessage,getBackgroundJobProgress,  getBackgroundJobStatus, unwrapBackgroundJobResponse,} from '../../services/backgroundJobUtils.js';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'info',
    icon: <PendingActionsRoundedIcon />,
    severity: 'info',
  },
  RUNNING: {
    label: 'Running',
    color: 'warning',
    icon: <HourglassTopRoundedIcon />,
    severity: 'info',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'success',
    icon: <CheckCircleRoundedIcon />,
    severity: 'success',
  },
  FAILED: {
    label: 'Failed',
    color: 'error',
    icon: <ErrorOutlineRoundedIcon />,
    severity: 'error',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'default',
    icon: <ErrorOutlineRoundedIcon />,
    severity: 'warning',
  },
};

function BackgroundJobProgress({job,loading = false,error = null,title = 'Background job',emptyText = 'Waiting for the background job to start...',}) {
  const source = unwrapBackgroundJobResponse(job);

  console.log('BackgroundJobProgress source:', source);

  if (loading && !source) {
    return (
      <Stack spacing={1.2}>
        <LinearProgress />
        <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
          {emptyText}
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error?.message || 'Could not load background job status.'}</Alert>;
  }

  if (!source) {
    return null;
  }

  const status = getBackgroundJobStatus(job) || 'PENDING';
  const progress = getBackgroundJobProgress(job);
  const message = getBackgroundJobMessage(job);
  const errorMessage = getBackgroundJobErrorMessage(job);
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <Alert severity={config.severity} icon={config.icon}>
      <Stack spacing={1.1}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
          <Box>
            <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
              {message || config.label}
            </Typography>
          </Box>

          <Chip size="small" color={config.color} label={config.label} sx={{ fontWeight: 850 }} />
        </Stack>

        <Box>
          <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 850 }}>Progress</Typography>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 850 }}>{progress}%</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 99 }} />
        </Box>

        {status === 'FAILED' && errorMessage && (
          <Typography color="error.main" sx={{ fontSize: '0.82rem', whiteSpace: 'pre-line' }}>
            {errorMessage}
          </Typography>
        )}
      </Stack>
    </Alert>
  );
}

export default BackgroundJobProgress;
