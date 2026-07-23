import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useTranslation } from 'react-i18next';

import { TrackingEmpty, TrackingError, TrackingLoading } from '../../components/TrackingState.jsx';
import {
  trackingFiltersSx,
  trackingPaginationSx,
  trackingPanelSx,
  trackingSectionIconSx,
  trackingTableSx,
  trackingToolbarSx,
} from '../../components/trackingStyles.js';
import { formatTrackingDateTime, formatTrackingNumber } from '../../utils/trackingFormatters.js';
import { useRecheckRequestsQuery } from '../hooks/useReviewCenterQueries.js';
import {
  RECHECK_REQUEST_STATUSES,
  RECHECK_STATUS_COLORS,
  pageCount,
  pageRows,
  reviewUserName,
} from '../utils/reviewFormatters.js';

function RecheckRequestsPanel({ taskId, enabled, filterRequest, onOpenRequest }) {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const params = { status, page, size };
  const query = useRecheckRequestsQuery(taskId, params, enabled);
  const rows = pageRows(query.data);
  const total = pageCount(query.data);

  useEffect(() => setPage(0), [status]);

  useEffect(() => {
    if (!filterRequest?.nonce) return;
    setStatus(filterRequest.status || 'ALL');
  }, [filterRequest]);

  if (query.isLoading && !query.data) return <TrackingLoading />;
  if (query.isError && !query.data) return <TrackingError error={query.error} onRetry={query.refetch} />;

  return (
    <Card sx={trackingPanelSx}>
      <CardContent sx={{ p: 0 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ md: 'center' }} justifyContent="space-between" sx={trackingToolbarSx}>
          <Stack direction="row" spacing={1.1} alignItems="center">
            <Box sx={trackingSectionIconSx('info')}><FactCheckOutlinedIcon /></Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 950 }}>{t('taskTracking.review.rechecks.title')}</Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }}>{t('taskTracking.review.rechecks.subtitle')}</Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            variant="outlined"
            label={t('taskTracking.review.rechecks.resultsCount', {
              count: formatTrackingNumber(total, i18n.language),
            })}
          />
        </Stack>

        <Stack direction="row" sx={{ p: 2, borderBottom: 1, borderColor: 'divider', ...trackingFiltersSx }}>
          <TextField
            select
            size="small"
            label={t('taskTracking.review.rechecks.status')}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="ALL">{t('taskTracking.review.filters.allStatuses')}</MenuItem>
            {RECHECK_REQUEST_STATUSES.map((value) => (
              <MenuItem value={value} key={value}>{t(`taskTracking.review.recheckStatuses.${value}`)}</MenuItem>
            ))}
          </TextField>
        </Stack>

        {query.isError && <Box sx={{ p: 2 }}><TrackingError error={query.error} onRetry={query.refetch} /></Box>}

        {rows.length === 0 ? (
          <TrackingEmpty title={t('taskTracking.review.rechecks.empty')} />
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'min(66vh, 700px)' }}>
              <Table size="small" stickyHeader sx={(theme) => ({ minWidth: 1050, ...trackingTableSx(theme) })}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 950 }}>{t('taskTracking.review.rechecks.number')}</TableCell>
                    <TableCell sx={{ fontWeight: 950 }}>{t('taskTracking.review.rechecks.status')}</TableCell>
                    <TableCell sx={{ fontWeight: 950 }}>{t('taskTracking.review.rechecks.workArea')}</TableCell>
                    <TableCell sx={{ fontWeight: 950 }}>{t('taskTracking.review.rechecks.assignedTo')}</TableCell>
                    <TableCell sx={{ fontWeight: 950 }}>{t('taskTracking.review.rechecks.items')}</TableCell>
                    <TableCell sx={{ fontWeight: 950 }}>{t('taskTracking.review.rechecks.dueAt')}</TableCell>
                    <TableCell sx={{ fontWeight: 950 }}>{t('taskTracking.review.rechecks.createdAt')}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 950 }}>{t('taskTracking.review.rechecks.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography component="code" sx={{ fontFamily: 'monospace', fontWeight: 850, fontSize: '0.77rem' }}>
                          {row.requestNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" color={RECHECK_STATUS_COLORS[row.status]} label={t(`taskTracking.review.recheckStatuses.${row.status}`)} />
                      </TableCell>
                      <TableCell>{row.workAreaLabel || '-'}</TableCell>
                      <TableCell>{reviewUserName(row.assignedTo)}</TableCell>
                      <TableCell>{formatTrackingNumber(row.items?.length, i18n.language)}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTrackingDateTime(row.dueAt, i18n.language)}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTrackingDateTime(row.createdAt, i18n.language)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title={t('taskTracking.review.rechecks.view')}>
                          <IconButton size="small" color="primary" onClick={() => onOpenRequest(row.id)}>
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={trackingPaginationSx}>
              {query.isFetching && <CircularProgress size={17} sx={{ me: 1 }} />}
              <TablePagination
                component="div"
                count={total}
                page={page}
                rowsPerPage={size}
                rowsPerPageOptions={[10, 20, 50, 100]}
                onPageChange={(_event, nextPage) => setPage(nextPage)}
                onRowsPerPageChange={(event) => { setSize(Number(event.target.value)); setPage(0); }}
              />
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default RecheckRequestsPanel;
