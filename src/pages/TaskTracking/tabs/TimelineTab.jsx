import React, { useState } from 'react';
import { Box, Card, CardContent, Chip, CircularProgress, Stack, TablePagination, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import { useTranslation } from 'react-i18next';

import EnumChip from '../../../components/common/EnumChip.jsx';
import { INVENTORY_TASK_STATUS_CHIP_CONFIG } from '../../../constants/enumChipConfigs.jsx';
import { useTrackingTimelineQuery } from '../hooks/useTaskTrackingQueries.js';
import { TrackingEmpty, TrackingError, TrackingLoading } from '../components/TrackingState.jsx';
import { formatTrackingDateTime, pageContent, pageTotal } from '../utils/trackingFormatters.js';
import { trackingPaginationSx, trackingPanelSx, trackingSectionIconSx, trackingToolbarSx } from '../components/trackingStyles.js';

function TimelineTab({ taskId, enabled, isTerminal }) {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const params = { page, size };
  const query = useTrackingTimelineQuery(taskId, params, enabled, !isTerminal);
  const rows = pageContent(query.data);
  const statusConfig = Object.fromEntries(Object.entries(INVENTORY_TASK_STATUS_CHIP_CONFIG).map(([key, value]) => [
    key,
    { ...value, label: t(`dashboardPage.statuses.${key}`) },
  ]));

  if (query.isLoading) return <TrackingLoading />;
  if (query.isError && !query.data) return <TrackingError error={query.error} onRetry={query.refetch} />;

  return (
    <Card sx={trackingPanelSx}>
      <CardContent sx={{ p: 0 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" sx={trackingToolbarSx}>
          <Box sx={trackingSectionIconSx('primary')}><EventNoteRoundedIcon /></Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 950 }}>{t('taskTracking.timeline.title')}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.82rem', mt: 0.1 }}>{t('taskTracking.timeline.subtitle')}</Typography>
          </Box>
        </Stack>
        {query.isError && <Box sx={{ m: 2 }}><TrackingError error={query.error} onRetry={query.refetch} /></Box>}

        {rows.length === 0 ? (
          <TrackingEmpty title={t('taskTracking.timeline.empty')} />
        ) : (
          <Stack sx={{ p: { xs: 2, md: 3 }, pb: { xs: 1, md: 1.5 } }}>
            {rows.map((row, index) => (
              <Stack direction="row" spacing={1.4} key={row.id} sx={{ position: 'relative', pb: index === rows.length - 1 ? 0 : 1.5 }}>
                <Stack alignItems="center" sx={{ width: 34, flexShrink: 0 }}>
                  <Box sx={(theme) => ({ width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.07), border: `1px solid ${alpha(theme.palette.primary.main, .14)}`, zIndex: 1 })}>
                    <HistoryRoundedIcon sx={{ fontSize: 16 }} />
                  </Box>
                  {index < rows.length - 1 && <Box sx={{ width: '1px', flex: 1, minHeight: 32, bgcolor: 'divider' }} />}
                </Stack>
                <Box sx={{ flex: 1, minWidth: 0, pb: 1.5, borderBottom: index === rows.length - 1 ? 0 : 1, borderColor: 'divider' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={0.8}>
                    <Box>
                      <Typography sx={{ fontWeight: 950 }}>{t(`taskTracking.activityTypes.${row.activityType}`)}</Typography>
                      <Typography color="text.secondary" sx={{ fontSize: '0.76rem', mt: 0.2 }}>
                        {row.performedBy || t('taskTracking.timeline.system')} · {formatTrackingDateTime(row.performedAt, i18n.language)}
                      </Typography>
                    </Box>
                    {(row.fromStatus || row.toStatus) && (
                      <Stack direction="row" spacing={0.6} alignItems="center" flexWrap="wrap" useFlexGap>
                        {row.fromStatus && <EnumChip value={row.fromStatus} config={statusConfig} />}
                        {row.fromStatus && row.toStatus && <Typography color="text.secondary">→</Typography>}
                        {row.toStatus && <EnumChip value={row.toStatus} config={statusConfig} />}
                      </Stack>
                    )}
                  </Stack>
                  {row.reason && <Chip size="small" variant="outlined" label={row.reason} sx={{ mt: 0.8, maxWidth: '100%' }} />}
                  {row.details && <Typography color="text.secondary" sx={{ mt: 0.65, fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{row.details}</Typography>}
                </Box>
              </Stack>
            ))}
          </Stack>
        )}

        {rows.length > 0 && (
          <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={trackingPaginationSx}>
            {query.isFetching && <CircularProgress size={18} sx={{ mr: 1 }} />}
            <TablePagination
              component="div"
              count={pageTotal(query.data)}
              page={page}
              rowsPerPage={size}
              rowsPerPageOptions={[10, 25, 50]}
              onPageChange={(_event, nextPage) => setPage(nextPage)}
              onRowsPerPageChange={(event) => { setSize(Number(event.target.value)); setPage(0); }}
            />
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default TimelineTab;
