import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import { useTranslation } from 'react-i18next';

import { useReviewIssueQuery } from '../hooks/useReviewCenterQueries.js';
import {
  ISSUE_STATUS_COLORS,
  ISSUE_TYPE_COLORS,
  issueActualLocation,
  issueExpectedLocation,
  reviewUserName,
} from '../utils/reviewFormatters.js';
import { formatTrackingDateTime, formatTrackingQuantity } from '../../utils/trackingFormatters.js';

function ReviewIssueDetailsDialog({
  open,
  taskId,
  issueId,
  canManage,
  onClose,
  onDecide,
  onOpenScanImage,
}) {
  const { t, i18n } = useTranslation();
  const query = useReviewIssueQuery(taskId, issueId, open);
  const details = query.data;
  const issue = details?.issue;
  const decisions = Array.isArray(details?.decisions) ? details.decisions : [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 1.5 } }}>
      <DialogTitle sx={{ p: 2.4, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 950 }}>
            {t('taskTracking.review.issueDetails.title')}
          </Typography>
          <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, md: 2.5 } }}>
        {query.isLoading && (
          <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack>
        )}
        {query.isError && <Alert severity="error">{query.error?.message}</Alert>}
        {issue && (
          <Stack spacing={2.2}>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
              <Chip
                color={ISSUE_TYPE_COLORS[issue.issueType]}
                label={t(`taskTracking.review.issueTypes.${issue.issueType}`)}
              />
              <Chip
                color={ISSUE_STATUS_COLORS[issue.status]}
                variant="outlined"
                label={t(`taskTracking.review.issueStatuses.${issue.status}`)}
              />
              {issue.blocking && <Chip color="error" variant="outlined" label={t('taskTracking.review.issues.blocking')} />}
            </Stack>

            <Grid container spacing={1.4}>
              <InfoItem label={t('taskTracking.review.issues.item')} value={issue.itemCode || '-'} />
              <InfoItem label={t('taskTracking.review.issues.description')} value={issue.itemDescription || '-'} />
              <InfoItem label={t('taskTracking.review.issues.workArea')} value={issue.workAreaLabel || '-'} />
              <InfoItem
                label={t('taskTracking.review.issues.detectedAt')}
                value={formatTrackingDateTime(issue.detectedAt, i18n.language)}
              />
              <InfoItem label={t('taskTracking.review.issues.expected')} value={issueExpectedLocation(issue)} />
              <InfoItem label={t('taskTracking.review.issues.actual')} value={issueActualLocation(issue)} />
              {issue.expectedQuantity != null && (
                <InfoItem
                  label={t('taskTracking.review.issues.expectedQuantity')}
                  value={formatTrackingQuantity(issue.expectedQuantity, i18n.language)}
                />
              )}
              {issue.actualQuantity != null && (
                <InfoItem
                  label={t('taskTracking.review.issues.actualQuantity')}
                  value={formatTrackingQuantity(issue.actualQuantity, i18n.language)}
                />
              )}
            </Grid>

            {(issue.currentScanId || issue.sourceScanId) && (
              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                {issue.currentScanId && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PhotoOutlinedIcon />}
                    onClick={() => onOpenScanImage(issue.currentScanId)}
                  >
                    {t('taskTracking.review.issueDetails.currentScan')}
                  </Button>
                )}
                {issue.sourceScanId && issue.sourceScanId !== issue.currentScanId && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PhotoOutlinedIcon />}
                    onClick={() => onOpenScanImage(issue.sourceScanId)}
                  >
                    {t('taskTracking.review.issueDetails.sourceScan')}
                  </Button>
                )}
              </Stack>
            )}

            <Divider />
            <Box>
              <Typography sx={{ fontWeight: 950 }}>{t('taskTracking.review.issueDetails.history')}</Typography>
              {decisions.length === 0 ? (
                <Typography color="text.secondary" sx={{ mt: 1 }}>{t('taskTracking.review.issueDetails.noHistory')}</Typography>
              ) : (
                <Stack spacing={1} sx={{ mt: 1.2 }}>
                  {decisions.map((decision) => (
                    <Box key={decision.id} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1.25, bgcolor: '#FAFBFD' }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>
                            {t(`taskTracking.review.decisions.${decision.decision}`)}
                          </Typography>
                          <Typography color="text.secondary" sx={{ fontSize: '0.78rem', mt: 0.2 }}>
                            {t(`taskTracking.review.reasons.${decision.reasonCode}`)}
                            {decision.note ? ` · ${decision.note}` : ''}
                          </Typography>
                        </Box>
                        <Typography color="text.secondary" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {reviewUserName(decision.decidedBy)} · {formatTrackingDateTime(decision.decidedAt, i18n.language)}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.3, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>{t('taskTracking.common.close')}</Button>
        {canManage && issue?.status === 'OPEN' && (
          <Button variant="contained" startIcon={<GavelRoundedIcon />} onClick={() => onDecide(issue)}>
            {t('taskTracking.review.issueDetails.resolve')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function InfoItem({ label, value }) {
  return (
    <Grid item xs={12} sm={6}>
      <Box sx={{ p: 1.35, height: '100%', borderRadius: 1.1, bgcolor: '#FAFBFD', border: 1, borderColor: 'divider' }}>
        <Typography color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 850 }}>{label}</Typography>
        <Typography sx={{ mt: 0.35, fontWeight: 800, overflowWrap: 'anywhere' }}>{value}</Typography>
      </Box>
    </Grid>
  );
}

export default ReviewIssueDetailsDialog;
