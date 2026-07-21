import React, { useMemo } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import { useTrackingScanEventsQuery } from '../hooks/useTaskTrackingQueries.js';
import { TrackingEmpty, TrackingError, TrackingLoading } from './TrackingState.jsx';
import {
  areaPath,
  expectedAreaPath,
  formatTrackingDateTime,
  formatTrackingNumber,
  pageContent,
  pageTotal,
  resultStatusColor,
  resultStatusKey,
  userDisplayName,
} from '../utils/trackingFormatters.js';

const EVENT_CONFIG = {
  FIRST_SCAN: { color: 'success', icon: <QrCodeScannerRoundedIcon /> },
  DUPLICATE: { color: 'warning', icon: <ContentCopyRoundedIcon /> },
  CONFLICT: { color: 'error', icon: <CompareArrowsRoundedIcon /> },
  EXTRA: { color: 'warning', icon: <AddCircleOutlineRoundedIcon /> },
  AMBIGUOUS: { color: 'error', icon: <HelpOutlineRoundedIcon /> },
  CORRECTION: { color: 'info', icon: <EditNoteRoundedIcon /> },
};

function DetailCell({ label, value, icon }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={0.55} alignItems="center" sx={{ color: 'text.secondary' }}>
        {icon}
        <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.25 }}>{label}</Typography>
      </Stack>
      <Typography sx={{ mt: 0.35, fontSize: '0.76rem', fontWeight: 750, overflowWrap: 'anywhere' }}>{value || '-'}</Typography>
    </Box>
  );
}

function ResultScanTimelineDialog({ open, taskId, result, isTerminal, onClose, onOpenImage }) {
  const { t, i18n } = useTranslation();
  const query = useTrackingScanEventsQuery(
    taskId,
    { eventType: 'ALL', search: result?.code || '', page: 0, size: 100 },
    Boolean(open && result?.code),
    !isTerminal,
  );

  const events = useMemo(() => {
    const validCodes = new Set([result?.code, result?.secondaryCode].filter(Boolean).map((value) => String(value).trim().toLowerCase()));
    return pageContent(query.data)
      .filter((row) => validCodes.has(String(row.scannedCode || '').trim().toLowerCase()))
      .sort((left, right) => new Date(right.scannedAt || 0).getTime() - new Date(left.scannedAt || 0).getTime());
  }, [query.data, result?.code, result?.secondaryCode]);

  const returnedRows = pageContent(query.data).length;
  const truncated = pageTotal(query.data) > returnedRows;
  const statusKey = resultStatusKey(result);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 1.5, overflow: 'hidden', minHeight: { sm: 560 }, maxHeight: '88vh' } }}
    >
      <DialogTitle sx={{ p: 2.25, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box sx={{ width: 38, height: 38, borderRadius: 1.25, display: 'grid', placeItems: 'center', color: 'primary.main', bgcolor: 'rgba(0,81,210,.07)' }}>
            <HistoryRoundedIcon sx={{ fontSize: 21 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>{t('taskTracking.results.scanHistory.title')}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.74rem', mt: 0.15 }}>{t('taskTracking.results.scanHistory.subtitle')}</Typography>
          </Box>
          {query.isFetching && !query.isLoading && <CircularProgress size={18} />}
          <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
        </Stack>
      </DialogTitle>

      <Box sx={{ px: { xs: 2, md: 2.5 }, py: 1.5, bgcolor: '#FAFBFD', borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.7} alignItems="center" flexWrap="wrap" useFlexGap>
              <Box component="code" sx={{ px: 0.8, py: 0.3, borderRadius: 0.75, bgcolor: '#EEF1F5', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 850 }}>{result?.code}</Box>
              {result?.secondaryCode && <Typography color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{result.secondaryCode}</Typography>}
              <Chip size="small" variant="outlined" color={resultStatusColor(result)} label={t(`taskTracking.resultFilters.${statusKey}`)} />
            </Stack>
            {result?.description && <Typography color="text.secondary" noWrap sx={{ mt: 0.55, fontSize: '0.76rem', maxWidth: 520 }}>{result.description}</Typography>}
          </Box>
          <Chip
            size="small"
            variant="outlined"
            icon={<HistoryRoundedIcon />}
            label={t('taskTracking.results.scanHistory.eventCount', { count: formatTrackingNumber(events.length, i18n.language) })}
            sx={{ bgcolor: 'background.paper', alignSelf: { xs: 'flex-start', sm: 'center' } }}
          />
        </Stack>
      </Box>

      <DialogContent sx={{ p: 0, bgcolor: 'background.paper' }}>
        {query.isLoading ? (
          <TrackingLoading minHeight={400} />
        ) : query.isError && !query.data ? (
          <Box sx={{ p: 2 }}><TrackingError error={query.error} onRetry={query.refetch} /></Box>
        ) : events.length === 0 ? (
          <TrackingEmpty title={t('taskTracking.results.scanHistory.empty')} />
        ) : (
          <Box sx={{ p: { xs: 2, md: 2.5 } }}>
            {query.isError && <Box sx={{ mb: 2 }}><TrackingError error={query.error} onRetry={query.refetch} /></Box>}

            <Stack spacing={0}>
              {events.map((event, index) => {
                const config = EVENT_CONFIG[event.eventType] || { color: 'primary', icon: <HistoryRoundedIcon /> };
                const name = userDisplayName(event.scannedBy);
                const isCurrent = String(event.scanId) === String(result?.currentScanId);
                return (
                  <Box
                    key={event.scanId}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '32px minmax(0, 1fr)', md: '124px 32px minmax(0, 1fr)' },
                      columnGap: { xs: 1, md: 1.25 },
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', md: 'block' }, pt: 0.55, textAlign: 'end' }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, lineHeight: 1.45 }}>
                        {formatTrackingDateTime(event.scannedAt, i18n.language)}
                      </Typography>
                      <Typography color="text.secondary" sx={{ fontSize: '0.66rem', mt: 0.25 }}>{name}</Typography>
                    </Box>

                    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                      <Box
                        sx={(theme) => ({
                          width: 32,
                          height: 32,
                          borderRadius: 1.1,
                          display: 'grid',
                          placeItems: 'center',
                          color: `${config.color}.main`,
                          bgcolor: alpha(theme.palette[config.color]?.main || theme.palette.primary.main, 0.09),
                          border: `1px solid ${alpha(theme.palette[config.color]?.main || theme.palette.primary.main, 0.22)}`,
                          zIndex: 1,
                          '& .MuiSvgIcon-root': { fontSize: 17 },
                        })}
                      >
                        {config.icon}
                      </Box>
                      {index < events.length - 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 32,
                            bottom: -16,
                            insetInlineStart: '50%',
                            width: '1px',
                            bgcolor: 'divider',
                            transform: 'translateX(-50%)',
                          }}
                        />
                      )}
                    </Box>

                    <Box sx={{ minWidth: 0, pb: index < events.length - 1 ? 2 : 0 }}>
                      <Box
                        sx={(theme) => ({
                          overflow: 'hidden',
                          border: `1px solid ${isCurrent ? alpha(theme.palette.primary.main, 0.35) : theme.palette.divider}`,
                          borderInlineStart: `3px solid ${isCurrent ? theme.palette.primary.main : alpha(theme.palette[config.color]?.main || theme.palette.primary.main, 0.55)}`,
                          borderRadius: 1.25,
                          bgcolor: '#FCFDFE',
                          boxShadow: isCurrent ? `0 4px 14px ${alpha(theme.palette.primary.main, 0.07)}` : 'none',
                        })}
                      >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ px: 1.5, py: 1.2 }}>
                          <Stack direction="row" spacing={0.7} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Chip size="small" variant="outlined" color={config.color} label={t(`taskTracking.eventTypes.${event.eventType}`)} />
                            {isCurrent && <Chip size="small" color="primary" label={t('taskTracking.results.scanHistory.current')} />}
                            {event.result && <Typography sx={{ fontSize: '0.75rem', fontWeight: 850 }}>{event.result}</Typography>}
                          </Stack>
                          <Typography color="text.secondary" sx={{ display: { md: 'none' }, fontSize: '0.68rem' }}>
                            {name} · {formatTrackingDateTime(event.scannedAt, i18n.language)}
                          </Typography>
                        </Stack>

                        <Divider />

                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                            gap: 1.5,
                            px: 1.5,
                            py: 1.35,
                            bgcolor: '#F8FAFC',
                          }}
                        >
                          <DetailCell label={t('taskTracking.common.expected')} value={expectedAreaPath(event)} icon={<QrCodeScannerRoundedIcon sx={{ fontSize: 14 }} />} />
                          <DetailCell label={t('taskTracking.common.actual')} value={areaPath(event)} icon={<QrCodeScannerRoundedIcon sx={{ fontSize: 14 }} />} />
                          <DetailCell
                            label={t('taskTracking.scanEvents.columns.device')}
                            value={[event.deviceId, event.symbology].filter(Boolean).join(' · ') || '-'}
                            icon={<DevicesRoundedIcon sx={{ fontSize: 14 }} />}
                          />
                        </Box>

                        {(event.notes || event.details || event.hasImage) && (
                          <>
                            <Divider />
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ px: 1.5, py: 1.2 }}>
                              <Box sx={{ minWidth: 0 }}>
                                {event.notes && (
                                  <Stack direction="row" spacing={0.6} alignItems="flex-start">
                                    <NotesRoundedIcon color="action" sx={{ fontSize: 16, mt: 0.1 }} />
                                    <Typography sx={{ fontSize: '0.74rem', whiteSpace: 'pre-wrap' }}>{event.notes}</Typography>
                                  </Stack>
                                )}
                                {event.details && <Typography color="text.secondary" sx={{ mt: event.notes ? 0.55 : 0, fontSize: '0.7rem', whiteSpace: 'pre-wrap' }}>{event.details}</Typography>}
                              </Box>
                              {event.hasImage && (
                                <Button size="small" variant="outlined" startIcon={<PhotoOutlinedIcon />} onClick={() => onOpenImage?.(event.scanId)} sx={{ flexShrink: 0 }}>
                                  {t('taskTracking.image.view')}
                                </Button>
                              )}
                            </Stack>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
            {truncated && <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>{t('taskTracking.results.scanHistory.truncated')}</Alert>}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ResultScanTimelineDialog;
