import React, { useMemo, useState } from 'react';
import { Alert, Box, Card, Tab, Tabs } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useToast } from '../../hooks/useToast.js';
import { queryClient } from '../../services/queryClient.js';
import { queryKeys } from '../../services/queryKeys.js';
import TaskTrackingHeader from './components/TaskTrackingHeader.jsx';
import TrackingLifecycleDialog from './components/TrackingLifecycleDialog.jsx';
import ScanImageDialog from './components/ScanImageDialog.jsx';
import { TrackingError, TrackingLoading } from './components/TrackingState.jsx';
import {
  useTrackingAreasQuery,
  useTrackingAttentionQuery,
  useTrackingOverviewQuery,
  useTrackingTeamQuery,
} from './hooks/useTaskTrackingQueries.js';
import { useTaskTrackingActionMutation } from './hooks/useTaskTrackingActionMutation.js';
import OverviewTab from './tabs/OverviewTab.jsx';
import AreasTab from './tabs/AreasTab.jsx';
import TeamTab from './tabs/TeamTab.jsx';
import AttentionTab from './tabs/AttentionTab.jsx';
import ResultsTab from './tabs/ResultsTab.jsx';
import ScanEventsTab from './tabs/ScanEventsTab.jsx';
import TimelineTab from './tabs/TimelineTab.jsx';
import ReviewCenterTab from './review/ReviewCenterTab.jsx';

const TABS = ['overview', 'areas', 'team', 'attention', 'review', 'results', 'scanEvents', 'timeline'];
const TERMINAL_STATUSES = new Set(['COMPLETED', 'CANCELLED']);
const TAB_ICONS = {
  overview: <DashboardRoundedIcon />,
  areas: <AccountTreeRoundedIcon />,
  team: <GroupsRoundedIcon />,
  attention: <ReportProblemRoundedIcon />,
  review: <RateReviewOutlinedIcon />,
  results: <FactCheckRoundedIcon />,
  scanEvents: <QrCodeScannerRoundedIcon />,
  timeline: <HistoryRoundedIcon />,
};

function TabLabel({ tabKey, label, count }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.85 }}>
      <Box component="span" sx={{ display: 'inline-flex', '& .MuiSvgIcon-root': { fontSize: 19 } }}>
        {TAB_ICONS[tabKey]}
      </Box>
      <Box component="span">{label}</Box>
      {count > 0 && (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 20,
            height: 20,
            px: 0.65,
            borderRadius: 10,
            bgcolor: 'error.main',
            color: 'error.contrastText',
            fontSize: '0.68rem',
            fontWeight: 900,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {count > 999 ? '999+' : count}
        </Box>
      )}
    </Box>
  );
}

function TaskTrackingDetails() {
  const { taskId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const activeTab = TABS.includes(requestedTab) ? requestedTab : 'overview';
  const [pendingAction, setPendingAction] = useState(null);
  const [imageScanId, setImageScanId] = useState(null);
  const validTaskId = /^\d+$/.test(taskId || '') && Number(taskId) > 0;
  const trackingTaskId = validTaskId ? taskId : null;

  const overviewQuery = useTrackingOverviewQuery(trackingTaskId);
  const overview = overviewQuery.data;
  const isTerminal = TERMINAL_STATUSES.has(overview?.status);
  const canManageReview = overview?.status === 'UNDER_REVIEW'
    && Boolean(overview?.allowedActions?.complete || overview?.allowedActions?.returnToProgress);
  const shouldPoll = !isTerminal;
  const areasQuery = useTrackingAreasQuery(trackingTaskId, activeTab === 'areas', shouldPoll);
  const teamQuery = useTrackingTeamQuery(trackingTaskId, activeTab === 'team', shouldPoll);
  const attentionQuery = useTrackingAttentionQuery(trackingTaskId, activeTab === 'attention', shouldPoll);
  const actionMutation = useTaskTrackingActionMutation();

  const tabs = useMemo(() => TABS.map((key) => ({
    key,
    label: t(`taskTracking.tabs.${key}`),
    count: key === 'attention' ? Number(overview?.attentionCount || 0) : 0,
  })), [overview?.attentionCount, t]);

  const handleTabChange = (_event, nextTab) => {
    const next = new URLSearchParams(searchParams);
    next.delete('eventType');
    next.delete('filter');
    next.delete('search');
    next.delete('attentionType');
    next.delete('areaLevel');
    next.delete('sortBy');
    next.delete('sortOrder');
    if (nextTab === 'overview') next.delete('tab');
    else next.set('tab', nextTab);
    setSearchParams(next, { replace: true });
  };

  const openScanEvents = (eventType = 'ALL') => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'scanEvents');
    next.delete('search');
    next.delete('filter');
    next.delete('sortBy');
    next.delete('sortOrder');
    if (eventType === 'ALL') next.delete('eventType');
    else next.set('eventType', eventType);
    setSearchParams(next);
  };

  const openResults = (filter = 'ALL') => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'results');
    next.delete('eventType');
    next.delete('search');
    next.delete('sortBy');
    next.delete('sortOrder');
    if (filter === 'ALL') next.delete('filter');
    else next.set('filter', filter);
    setSearchParams(next);
  };

  const refreshTask = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.taskTracking.task(trackingTaskId) });
  };

  const openManageTask = () => {
    const params = new URLSearchParams();
    if (overview?.taskNumber) params.set('search', overview.taskNumber);
    navigate(`/inventory-tasks${params.toString() ? `?${params}` : ''}`);
  };

  const confirmAction = async (reason) => {
    try {
      await actionMutation.mutateAsync({ action: pendingAction, taskId: trackingTaskId, reason });
      toast.showSuccessToast(t(`taskTracking.actions.success.${pendingAction}`));
      setPendingAction(null);
    } catch (error) {
      toast.showErrorToast(error.message || t('taskTracking.actions.failed'));
    }
  };

  if (!validTaskId) return <TrackingError error={new Error(t('taskTracking.common.invalidTask'))} />;
  if (overviewQuery.isLoading) return <TrackingLoading minHeight={520} />;
  if (overviewQuery.isError && !overview) return <TrackingError error={overviewQuery.error} onRetry={overviewQuery.refetch} />;

  return (
    <Box sx={{ width: '100%', maxWidth: 1760, mx: 'auto', minWidth: 0, position: 'relative' }}>
      <TaskTrackingHeader
        overview={overview}
        isFetching={overviewQuery.isFetching}
        onBack={() => navigate('/inventory-tasks')}
        onRefresh={refreshTask}
        onManage={openManageTask}
        onAction={(action) => { actionMutation.reset(); setPendingAction(action); }}
      />

      {overviewQuery.isError && (
        <Alert severity="warning" variant="outlined" sx={{ mt: 2 }}>{t('taskTracking.common.staleWarning')}</Alert>
      )}

      <Card
        sx={{
          mt: 1.5,
          overflow: 'hidden',
          position: 'sticky',
          top: { xs: 76, md: 84 },
          zIndex: (theme) => theme.zIndex.appBar - 1,
          borderRadius: 1.5,
          boxShadow: '0 2px 8px rgba(1, 23, 54, 0.05)',
          bgcolor: 'rgba(255,255,255,.97)',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={(theme) => ({
            px: { xs: 0.5, md: 1 },
            minHeight: 52,
            '& .MuiTabs-indicator': {
              height: 3,
              background: theme.palette.primary.main,
            },
            '& .MuiTab-root': {
              minHeight: 52,
              minWidth: { xs: 'auto', md: 122 },
              fontWeight: 750,
              px: { xs: 1.25, md: 1.75 },
              fontSize: '0.78rem',
              color: 'text.secondary',
              transition: 'color 160ms ease, background-color 160ms ease',
              '&:hover': { color: 'primary.main', bgcolor: 'rgba(0,81,210,.025)' },
              '&.Mui-selected': { color: 'primary.main', fontWeight: 900 },
            },
          })}
        >
          {tabs.map((tab) => (
            <Tab key={tab.key} value={tab.key} label={<TabLabel tabKey={tab.key} label={tab.label} count={tab.count} />} />
          ))}
        </Tabs>
      </Card>

      <Box sx={{ mt: { xs: 1.5, md: 2 }, minWidth: 0 }}>
        {activeTab === 'overview' && (
          <OverviewTab overview={overview} onOpenScanEvents={openScanEvents} onOpenResults={openResults} />
        )}
        {activeTab === 'areas' && <AreasTab query={areasQuery} />}
        {activeTab === 'team' && <TeamTab query={teamQuery} />}
        {activeTab === 'attention' && <AttentionTab query={attentionQuery} onOpenImage={setImageScanId} />}
        {activeTab === 'review' && (
          <ReviewCenterTab
            taskId={trackingTaskId}
            taskStatus={overview?.status}
            canManage={canManageReview}
            onOpenScanImage={setImageScanId}
          />
        )}
        {activeTab === 'results' && (
          <ResultsTab taskId={trackingTaskId} enabled domain={overview?.domain} isTerminal={isTerminal} onOpenImage={setImageScanId} />
        )}
        {activeTab === 'scanEvents' && (
          <ScanEventsTab taskId={trackingTaskId} enabled domain={overview?.domain} isTerminal={isTerminal} onOpenImage={setImageScanId} />
        )}
        {activeTab === 'timeline' && <TimelineTab taskId={trackingTaskId} enabled isTerminal={isTerminal} />}
      </Box>

      <TrackingLifecycleDialog
        open={Boolean(pendingAction)}
        action={pendingAction}
        overview={overview}
        loading={actionMutation.isPending}
        error={actionMutation.error?.message}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmAction}
      />

      <ScanImageDialog
        open={Boolean(imageScanId)}
        taskId={trackingTaskId}
        scanId={imageScanId}
        onClose={() => setImageScanId(null)}
      />
    </Box>
  );
}

export default TaskTrackingDetails;
