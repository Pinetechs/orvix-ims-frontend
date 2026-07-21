import React from 'react';
import { Box, Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import DifferenceRoundedIcon from '@mui/icons-material/DifferenceRounded';
import HideImageRoundedIcon from '@mui/icons-material/HideImageRounded';
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { useTranslation } from 'react-i18next';

import { formatDashboardNumber } from '../utils/dashboardFormatters.js';

function AttentionPanel({ summary = {}, onOpenTasks }) {
  const { t, i18n } = useTranslation();
  const number = (value) => formatDashboardNumber(value, i18n.language);
  const items = [
    ['stalledTasks', summary.stalledTasks, <PauseCircleOutlineRoundedIcon />],
    ['tasksWithMismatches', summary.tasksWithMismatches, <DifferenceRoundedIcon />],
    ['tasksMissingRequiredImages', summary.tasksMissingRequiredImages, <HideImageRoundedIcon />],
    ['importFailedTasks', summary.importFailedTasks, <CloudOffRoundedIcon />],
    ['tasksWithHighDuplicateRate', summary.tasksWithHighDuplicateRate, <ContentCopyRoundedIcon />],
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2.2, md: 2.8 }, '&:last-child': { pb: { xs: 2.2, md: 2.8 } } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 950 }}>
              {t('dashboardPage.attention.title')}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.84rem', mt: 0.35 }}>
              {t('dashboardPage.attention.subtitle')}
            </Typography>
          </Box>
          <Box
            sx={(theme) => ({
              minWidth: 54,
              height: 54,
              px: 1.1,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 3,
              color: summary.totalIssues > 0 ? 'error.main' : 'success.main',
              bgcolor: summary.totalIssues > 0 ? alpha(theme.palette.error.main, 0.08) : alpha(theme.palette.success.main, 0.08),
            })}
          >
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ErrorOutlineRoundedIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontWeight: 950 }}>{number(summary.totalIssues)}</Typography>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Stack spacing={0.55}>
          {items.map(([key, value, icon]) => (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1.2}
              key={key}
              sx={(theme) => ({ px: 1.1, py: 0.9, borderRadius: 2.5, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.035) } })}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                <Box sx={{ color: Number(value) > 0 ? 'error.main' : 'text.disabled', display: 'flex', '& svg': { fontSize: 19 } }}>
                  {icon}
                </Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 780 }}>
                  {t(`dashboardPage.attention.${key}`)}
                </Typography>
              </Stack>
              <Typography sx={{ fontWeight: 950 }} color={Number(value) > 0 ? 'error.main' : 'text.secondary'}>
                {number(value)}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Button fullWidth variant="outlined" endIcon={<ArrowForwardRoundedIcon />} onClick={onOpenTasks} sx={{ mt: 2 }}>
          {t('dashboardPage.attention.openTasks')}
        </Button>
      </CardContent>
    </Card>
  );
}

export default AttentionPanel;
