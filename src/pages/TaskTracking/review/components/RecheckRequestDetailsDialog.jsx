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
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useTranslation } from 'react-i18next';

import { useRecheckRequestQuery } from '../hooks/useReviewCenterQueries.js';
import {
  ISSUE_TYPE_COLORS,
  RECHECK_ITEM_STATUS_COLORS,
  RECHECK_STATUS_COLORS,
  reviewUserName,
} from '../utils/reviewFormatters.js';
import { formatTrackingDateTime, formatTrackingQuantity } from '../../utils/trackingFormatters.js';

const ACTIVE_REQUEST_STATUSES = new Set(['PENDING', 'IN_PROGRESS', 'SUBMITTED']);

function RecheckRequestDetailsDialog({
  open,
  taskId,
  requestId,
  canManage,
  onClose,
  onDecideItem,
  onCancel,
  onOpenEvidence,
}) {
  const { t, i18n } = useTranslation();
  const query = useRecheckRequestQuery(taskId, requestId, open);
  const request = query.data;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: 1.5 } }}>
      <DialogTitle sx={{ p: 2.4, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 950 }}>{t('taskTracking.review.recheckDetails.title')}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.76rem', fontFamily: 'monospace' }}>{request?.requestNumber}</Typography>
          </Box>
          {request?.status && (
            <Chip color={RECHECK_STATUS_COLORS[request.status]} label={t(`taskTracking.review.recheckStatuses.${request.status}`)} />
          )}
          <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, md: 2.5 }, bgcolor: '#F8FAFD' }}>
        {query.isLoading && <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack>}
        {query.isError && <Alert severity="error">{query.error?.message}</Alert>}
        {request && (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
              <Info label={t('taskTracking.review.rechecks.workArea')} value={request.workAreaLabel || '-'} />
              <Info label={t('taskTracking.review.rechecks.assignedTo')} value={reviewUserName(request.assignedTo)} />
              <Info label={t('taskTracking.review.recheckDetails.requestedBy')} value={reviewUserName(request.requestedBy)} />
              <Info label={t('taskTracking.review.rechecks.dueAt')} value={formatTrackingDateTime(request.dueAt, i18n.language)} />
            </Stack>

            {request.instructions && (
              <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1.25, bgcolor: 'background.paper' }}>
                <Typography color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 850 }}>{t('taskTracking.review.recheckDetails.instructions')}</Typography>
                <Typography sx={{ mt: 0.35, whiteSpace: 'pre-wrap' }}>{request.instructions}</Typography>
              </Box>
            )}

            <Stack spacing={1.25}>
              {request.items?.map((item, index) => (
                <Box key={item.id} sx={{ p: { xs: 1.5, md: 1.8 }, border: 1, borderColor: 'divider', borderRadius: 1.5, bgcolor: 'background.paper' }}>
                  <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.4} justifyContent="space-between">
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={0.7} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography sx={{ fontWeight: 950 }}>
                          {t('taskTracking.review.recheckDetails.itemNumber', { number: index + 1 })}
                        </Typography>
                        <Chip
                          size="small"
                          color={RECHECK_ITEM_STATUS_COLORS[item.status]}
                          variant="outlined"
                          label={t(`taskTracking.review.recheckItemStatuses.${item.status}`)}
                        />
                        {item.issues?.map((issue) => (
                          <Chip
                            size="small"
                            key={issue.id}
                            color={ISSUE_TYPE_COLORS[issue.issueType]}
                            label={t(`taskTracking.review.issueTypes.${issue.issueType}`)}
                          />
                        ))}
                      </Stack>
                      <Typography component="code" sx={{ display: 'block', mt: 0.7, fontFamily: 'monospace', fontWeight: 850 }}>
                        {item.itemCode || item.scannedCode || '-'}
                      </Typography>
                      {item.itemDescription && <Typography color="text.secondary" sx={{ mt: 0.25 }}>{item.itemDescription}</Typography>}

                      <Divider sx={{ my: 1.2 }} />
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.4} flexWrap="wrap" useFlexGap>
                        <Detail label={t('taskTracking.review.recheckDetails.expectedLocation')} value={item.expectedLocation || '-'} />
                        <Detail label={t('taskTracking.review.recheckDetails.previousResult')} value={item.previousResult || '-'} />
                        <Detail
                          label={t('taskTracking.review.recheckDetails.result')}
                          value={item.result ? t(`taskTracking.review.recheckResults.${item.result}`) : '-'}
                        />
                        {item.countedQuantity != null && (
                          <Detail
                            label={t('taskTracking.review.recheckDetails.countedQuantity')}
                            value={formatTrackingQuantity(item.countedQuantity, i18n.language)}
                          />
                        )}
                        <Detail
                          label={t('taskTracking.review.recheckDetails.submittedAt')}
                          value={formatTrackingDateTime(item.submittedAt, i18n.language)}
                        />
                      </Stack>
                      {item.note && <Alert severity="info" variant="outlined" sx={{ mt: 1.2 }}>{item.note}</Alert>}
                    </Box>

                    <Stack direction={{ xs: 'row', lg: 'column' }} spacing={0.8} alignItems={{ lg: 'stretch' }} flexWrap="wrap" useFlexGap>
                      {item.hasEvidenceImage && (
                        <Button size="small" variant="outlined" startIcon={<PhotoOutlinedIcon />} onClick={() => onOpenEvidence(request.id, item.id)}>
                          {t('taskTracking.review.recheckDetails.evidence')}
                        </Button>
                      )}
                      {canManage && item.status === 'SUBMITTED' && (
                        <Button size="small" variant="contained" startIcon={<GavelRoundedIcon />} onClick={() => onDecideItem(request, item)}>
                          {t('taskTracking.review.recheckDetails.decide')}
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.3, borderTop: 1, borderColor: 'divider' }}>
        {canManage && request && ACTIVE_REQUEST_STATUSES.has(request.status) && (
          <Button color="warning" startIcon={<CancelOutlinedIcon />} onClick={() => onCancel(request)}>
            {t('taskTracking.review.recheckDetails.cancel')}
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>{t('taskTracking.common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}

function Info({ label, value }) {
  return (
    <Box sx={{ flex: 1, minWidth: 180, p: 1.35, border: 1, borderColor: 'divider', borderRadius: 1.25, bgcolor: 'background.paper' }}>
      <Typography color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 850 }}>{label}</Typography>
      <Typography sx={{ mt: 0.3, fontWeight: 850 }}>{value}</Typography>
    </Box>
  );
}

function Detail({ label, value }) {
  return (
    <Box sx={{ minWidth: 145 }}>
      <Typography color="text.secondary" sx={{ fontSize: '0.68rem', fontWeight: 800 }}>{label}</Typography>
      <Typography sx={{ mt: 0.2, fontSize: '0.82rem', fontWeight: 800 }}>{value}</Typography>
    </Box>
  );
}

export default RecheckRequestDetailsDialog;
