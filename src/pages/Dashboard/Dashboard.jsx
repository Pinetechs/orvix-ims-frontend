import React from 'react';
import { Alert, Box, Button, Grid, Stack, Typography } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useDashboardOverviewQuery } from './hooks/useDashboardOverviewQuery.js';
import DashboardHeader from './components/DashboardHeader.jsx';
import DashboardMetrics from './components/DashboardMetrics.jsx';
import ExecutionOverview from './components/ExecutionOverview.jsx';
import DomainProgress from './components/DomainProgress.jsx';
import AttentionPanel from './components/AttentionPanel.jsx';
import ActiveTasksPanel from './components/ActiveTasksPanel.jsx';
import AdministrationSummary from './components/AdministrationSummary.jsx';
import DashboardSkeleton from './components/DashboardSkeleton.jsx';

function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const overviewQuery = useDashboardOverviewQuery();

  if (overviewQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (overviewQuery.isError && !overviewQuery.data) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ minHeight: '55vh', textAlign: 'center' }}>
        <Box
          sx={(theme) => ({
            width: 62,
            height: 62,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 4,
            color: 'error.main',
            bgcolor: alpha(theme.palette.error.main, 0.08),
          })}
        >
          <RefreshRoundedIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 950 }}>{t('dashboardPage.errorTitle')}</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
          {overviewQuery.error?.message || t('dashboardPage.errorText')}
        </Typography>
        <Button variant="contained" startIcon={<RefreshRoundedIcon />} onClick={() => overviewQuery.refetch()}>
          {t('dashboardPage.tryAgain')}
        </Button>
      </Stack>
    );
  }

  const overview = overviewQuery.data || {};
  const operational = Boolean(overview.operationalDashboardAvailable);
  const administration = overview.administrationSummary;

  const openTask = (task) => {
    if (task?.taskId) navigate(`/task-tracking/${task.taskId}`);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1680, mx: 'auto' }}>
      <DashboardHeader
        generatedAt={overview.generatedAt}
        operational={operational}
        isFetching={overviewQuery.isFetching}
        onRefresh={() => overviewQuery.refetch()}
      />

      {overviewQuery.isError && (
        <Alert severity="warning" sx={{ mb: 2.2 }}>
          {t('dashboardPage.staleDataWarning')}
        </Alert>
      )}

      {administration && <AdministrationSummary summary={administration} />}

      {operational ? (
        <>
          <DashboardMetrics taskSummary={overview.taskSummary} attentionSummary={overview.attentionSummary} />

          <Grid container spacing={2.2}>
            <Grid item xs={12} lg={7}>
              <ExecutionOverview summary={overview.executionSummary} />
            </Grid>
            <Grid item xs={12} lg={5}>
              <AttentionPanel
                summary={overview.attentionSummary}
                onOpenTasks={() => navigate('/inventory-tasks')}
              />
            </Grid>
          </Grid>

          <DomainProgress summaries={overview.domainSummaries} />

          <Box sx={{ mt: 2.2 }}>
            <ActiveTasksPanel
              tasks={overview.recentTasks}
              onOpenTask={openTask}
              onOpenAllTasks={() => navigate('/inventory-tasks')}
            />
          </Box>
        </>
      ) : (
        <Box
          sx={(theme) => ({
            mt: 2.2,
            py: 6,
            px: 3,
            textAlign: 'center',
            borderRadius: 5,
            bgcolor: alpha(theme.palette.primary.main, 0.045),
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
          })}
        >
          <LockPersonOutlinedIcon sx={{ fontSize: 42, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 950 }}>{t('dashboardPage.adminOnlyTitle')}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {t('dashboardPage.adminOnlyText')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default Dashboard;
