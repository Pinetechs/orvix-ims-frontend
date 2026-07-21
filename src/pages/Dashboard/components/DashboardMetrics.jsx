import React from 'react';
import { Grid } from '@mui/material';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { useTranslation } from 'react-i18next';

import MetricCard from '../../../components/common/MetricCard.jsx';
import { formatDashboardNumber } from '../utils/dashboardFormatters.js';

function DashboardMetrics({ taskSummary = {}, attentionSummary = {} }) {
  const { t, i18n } = useTranslation();
  const number = (value) => formatDashboardNumber(value, i18n.language);

  const metrics = [
    {
      title: t('dashboardPage.metrics.activeTasks'),
      value: number(taskSummary.active),
      hint: t('dashboardPage.metrics.activeTasksHint', { count: number(taskSummary.readyToStart) }),
      icon: <AssignmentTurnedInRoundedIcon />,
      color: 'primary.main',
      accentColor: '#0051D2',
    },
    {
      title: t('dashboardPage.metrics.inProgress'),
      value: number(taskSummary.inProgress),
      hint: t('dashboardPage.metrics.inProgressHint', { count: number(taskSummary.paused) }),
      icon: <PlayCircleFilledRoundedIcon />,
      color: 'warning.dark',
      accentColor: '#F59E0B',
    },
    {
      title: t('dashboardPage.metrics.underReview'),
      value: number(taskSummary.underReview),
      hint: t('dashboardPage.metrics.underReviewHint', { count: number(taskSummary.completedThisMonth) }),
      icon: <RateReviewRoundedIcon />,
      color: 'secondary.main',
      accentColor: '#7C3AED',
    },
    {
      title: t('dashboardPage.metrics.attentionRequired'),
      value: number(attentionSummary.totalIssues),
      hint: t('dashboardPage.metrics.attentionRequiredHint', { count: number(attentionSummary.affectedTasks) }),
      icon: <ErrorOutlineRoundedIcon />,
      color: 'error.main',
      accentColor: '#DC2626',
    },
  ];

  return (
    <Grid container spacing={2.2} sx={{ mb: 2.2 }}>
      {metrics.map((metric) => (
        <Grid item xs={12} sm={6} xl={3} key={metric.title}>
          <MetricCard {...metric} />
        </Grid>
      ))}
    </Grid>
  );
}

export default DashboardMetrics;
