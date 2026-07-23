import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import { useTranslation } from 'react-i18next';

import { useToast } from '../../../hooks/useToast.js';
import { TrackingError, TrackingLoading } from '../components/TrackingState.jsx';
import CancelRecheckDialog from './components/CancelRecheckDialog.jsx';
import CreateRecheckDialog from './components/CreateRecheckDialog.jsx';
import RecheckEvidenceDialog from './components/RecheckEvidenceDialog.jsx';
import RecheckRequestDetailsDialog from './components/RecheckRequestDetailsDialog.jsx';
import RecheckRequestsPanel from './components/RecheckRequestsPanel.jsx';
import ReviewDecisionDialog from './components/ReviewDecisionDialog.jsx';
import ReviewIssueDetailsDialog from './components/ReviewIssueDetailsDialog.jsx';
import ReviewIssuesPanel from './components/ReviewIssuesPanel.jsx';
import ReviewSummaryCards from './components/ReviewSummaryCards.jsx';
import {
  useCancelRecheckMutation,
  useCreateRecheckMutation,
  useDecideRecheckItemMutation,
  useDecideReviewIssueMutation,
  useSynchronizeReviewMutation,
} from './hooks/useReviewCenterMutations.js';
import { useReviewSummaryQuery } from './hooks/useReviewCenterQueries.js';
import { directIssueDecisions, submittedItemDecisions } from './utils/reviewFormatters.js';

function ReviewCenterTab({ taskId, taskStatus, canManage, onOpenScanImage }) {
  const { t } = useTranslation();
  const toast = useToast();
  const underReview = taskStatus === 'UNDER_REVIEW';
  const summaryQuery = useReviewSummaryQuery(taskId, true);
  const synchronizeMutation = useSynchronizeReviewMutation();
  const createMutation = useCreateRecheckMutation();
  const decideIssueMutation = useDecideReviewIssueMutation();
  const decideItemMutation = useDecideRecheckItemMutation();
  const cancelMutation = useCancelRecheckMutation();

  const [section, setSection] = useState('issues');
  const [issueFilterRequest, setIssueFilterRequest] = useState(null);
  const [recheckFilterRequest, setRecheckFilterRequest] = useState(null);
  const [issueId, setIssueId] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [selectionResetKey, setSelectionResetKey] = useState(0);
  const [decisionTarget, setDecisionTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [evidenceTarget, setEvidenceTarget] = useState(null);

  const summary = summaryQuery.data;

  const filterIssues = (filter) => {
    setSection('issues');
    setIssueFilterRequest({
      status: filter.status || 'ALL',
      type: filter.type || 'ALL',
      nonce: Date.now(),
    });
  };

  const openCreateRecheck = (issues) => {
    createMutation.reset();
    setSelectedIssues(issues);
  };

  const createRecheck = async (payload) => {
    try {
      const created = await createMutation.mutateAsync({ taskId, payload });
      toast.showSuccessToast(t('taskTracking.review.messages.recheckCreated'));
      setSelectedIssues([]);
      setSelectionResetKey((value) => value + 1);
      setSection('rechecks');
      setRecheckFilterRequest({ status: 'PENDING', nonce: Date.now() });
      if (created?.id) setRequestId(created.id);
    } catch {
      // The mutation error is rendered inside the dialog.
    }
  };

  const openIssueDecision = (issue) => {
    decideIssueMutation.reset();
    setDecisionTarget({ kind: 'issue', issue });
    setIssueId(null);
  };

  const openItemDecision = (request, item) => {
    decideItemMutation.reset();
    setDecisionTarget({ kind: 'item', request, item });
    setRequestId(null);
  };

  const submitDecision = async (payload) => {
    try {
      if (decisionTarget.kind === 'issue') {
        await decideIssueMutation.mutateAsync({
          taskId,
          issueId: decisionTarget.issue.id,
          payload,
        });
      } else {
        await decideItemMutation.mutateAsync({
          taskId,
          requestId: decisionTarget.request.id,
          itemId: decisionTarget.item.id,
          payload,
        });
      }
      const reopenRequestId = decisionTarget.kind === 'item' ? decisionTarget.request.id : null;
      toast.showSuccessToast(t('taskTracking.review.messages.decisionSaved'));
      setDecisionTarget(null);
      if (reopenRequestId) setRequestId(reopenRequestId);
    } catch {
      // The mutation error is rendered inside the dialog.
    }
  };

  const openCancel = (request) => {
    cancelMutation.reset();
    setCancelTarget(request);
    setRequestId(null);
  };

  const cancelRecheck = async (reason) => {
    try {
      await cancelMutation.mutateAsync({
        taskId,
        requestId: cancelTarget.id,
        reason,
      });
      toast.showSuccessToast(t('taskTracking.review.messages.recheckCancelled'));
      setCancelTarget(null);
    } catch {
      // The mutation error is rendered inside the dialog.
    }
  };

  const synchronize = async () => {
    try {
      await synchronizeMutation.mutateAsync({ taskId });
      toast.showSuccessToast(t('taskTracking.review.messages.synchronized'));
    } catch (error) {
      toast.showErrorToast(error.message);
    }
  };

  if (summaryQuery.isLoading && !summary) return <TrackingLoading />;
  if (summaryQuery.isError && !summary) {
    return <TrackingError error={summaryQuery.error} onRetry={summaryQuery.refetch} />;
  }

  const decisionOptions = decisionTarget?.kind === 'issue'
    ? directIssueDecisions(decisionTarget.issue)
    : submittedItemDecisions(decisionTarget?.item);
  const decisionLoading = decisionTarget?.kind === 'issue'
    ? decideIssueMutation.isPending
    : decideItemMutation.isPending;
  const decisionError = decisionTarget?.kind === 'issue'
    ? decideIssueMutation.error?.message
    : decideItemMutation.error?.message;

  return (
    <Stack spacing={1.7}>
      {!underReview && (
        <Alert severity="info" variant="outlined">
          {t('taskTracking.review.notUnderReview')}
        </Alert>
      )}
      {summary?.canComplete && (
        <Alert severity="success" variant="outlined">
          {t('taskTracking.review.readyToComplete')}
        </Alert>
      )}
      {synchronizeMutation.isError && (
        <Alert severity="error">{synchronizeMutation.error?.message}</Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} justifyContent="space-between">
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 950 }}>{t('taskTracking.review.title')}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.25, fontSize: '0.82rem' }}>{t('taskTracking.review.subtitle')}</Typography>
        </Box>
        {canManage && underReview && (
          <Button
            size="small"
            variant="outlined"
            startIcon={synchronizeMutation.isPending ? <CircularProgress size={16} /> : <SyncRoundedIcon />}
            disabled={synchronizeMutation.isPending}
            onClick={synchronize}
          >
            {t('taskTracking.review.synchronize')}
          </Button>
        )}
      </Stack>

      <ReviewSummaryCards
        summary={summary}
        onFilterStatus={(status) => filterIssues({ status })}
        onFilterType={(type) => filterIssues({ type, status: 'OPEN' })}
      />

      <Card sx={{ borderRadius: 1.5, boxShadow: 'none' }}>
        <Tabs value={section} onChange={(_event, value) => setSection(value)} sx={{ px: 1 }}>
          <Tab icon={<RuleOutlinedIcon />} iconPosition="start" value="issues" label={t('taskTracking.review.sections.issues')} />
          <Tab icon={<FactCheckOutlinedIcon />} iconPosition="start" value="rechecks" label={t('taskTracking.review.sections.rechecks')} />
        </Tabs>
      </Card>

      {section === 'issues' && (
        <ReviewIssuesPanel
          taskId={taskId}
          enabled
          canManage={canManage && underReview}
          filterRequest={issueFilterRequest}
          selectionResetKey={selectionResetKey}
          onOpenIssue={setIssueId}
          onCreateRecheck={openCreateRecheck}
        />
      )}
      {section === 'rechecks' && (
        <RecheckRequestsPanel
          taskId={taskId}
          enabled
          filterRequest={recheckFilterRequest}
          onOpenRequest={setRequestId}
        />
      )}

      <ReviewIssueDetailsDialog
        open={Boolean(issueId)}
        taskId={taskId}
        issueId={issueId}
        canManage={canManage && underReview}
        onClose={() => setIssueId(null)}
        onDecide={openIssueDecision}
        onOpenScanImage={onOpenScanImage}
      />
      <CreateRecheckDialog
        open={selectedIssues.length > 0}
        taskId={taskId}
        issues={selectedIssues}
        loading={createMutation.isPending}
        error={createMutation.error?.message}
        onClose={() => setSelectedIssues([])}
        onSubmit={createRecheck}
      />
      <RecheckRequestDetailsDialog
        open={Boolean(requestId)}
        taskId={taskId}
        requestId={requestId}
        canManage={canManage && underReview}
        onClose={() => setRequestId(null)}
        onDecideItem={openItemDecision}
        onCancel={openCancel}
        onOpenEvidence={(nextRequestId, itemId) => setEvidenceTarget({ requestId: nextRequestId, itemId })}
      />
      <ReviewDecisionDialog
        open={Boolean(decisionTarget)}
        title={decisionTarget?.kind === 'issue'
          ? t('taskTracking.review.decision.issueTitle')
          : t('taskTracking.review.decision.itemTitle')}
        subtitle={decisionTarget?.kind === 'issue'
          ? decisionTarget?.issue?.itemCode
          : decisionTarget?.item?.itemCode}
        decisions={decisionOptions}
        loading={decisionLoading}
        error={decisionError}
        onClose={() => setDecisionTarget(null)}
        onSubmit={submitDecision}
      />
      <CancelRecheckDialog
        open={Boolean(cancelTarget)}
        request={cancelTarget}
        loading={cancelMutation.isPending}
        error={cancelMutation.error?.message}
        onClose={() => setCancelTarget(null)}
        onSubmit={cancelRecheck}
      />
      <RecheckEvidenceDialog
        open={Boolean(evidenceTarget)}
        taskId={taskId}
        requestId={evidenceTarget?.requestId}
        itemId={evidenceTarget?.itemId}
        onClose={() => setEvidenceTarget(null)}
      />
    </Stack>
  );
}

export default ReviewCenterTab;
