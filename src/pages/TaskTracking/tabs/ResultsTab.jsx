import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { useDebouncedValue } from '../../../hooks/useDebouncedValue.js';
import { useTrackingResultsQuery } from '../hooks/useTaskTrackingQueries.js';
import { TrackingEmpty, TrackingError, TrackingLoading } from '../components/TrackingState.jsx';
import ResultScanTimelineDialog from '../components/ResultScanTimelineDialog.jsx';
import {
  expectedAreaPath,
  formatTrackingDateTime,
  formatTrackingNumber,
  formatTrackingQuantity,
  pageContent,
  pageTotal,
  resultStatusColor,
  resultStatusKey,
  areaPath,
  userDisplayName,
} from '../utils/trackingFormatters.js';
import {
  trackingFiltersSx,
  trackingPaginationSx,
  trackingPanelSx,
  trackingSectionIconSx,
  trackingTableSx,
  trackingToolbarSx,
} from '../components/trackingStyles.js';

const FILTERS = ['ALL', 'MATCHED', 'MISMATCHED', 'REMAINING', 'MISSING_IMAGE', 'NOTES'];
const SORTABLE_COLUMNS = {
  code: 'code',
  description: 'description',
  expectedQuantity: 'expectedQuantity',
  actualQuantity: 'actualQuantity',
  variance: 'varianceQuantity',
  acceptedAt: 'acceptedAt',
};
const SORT_FIELDS = new Set(Object.values(SORTABLE_COLUMNS));

function ResultsTab({ taskId, enabled, isTerminal, domain, onOpenImage }) {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedFilter = searchParams.get('filter');
  const filter = FILTERS.includes(requestedFilter) ? requestedFilter : 'ALL';
  const search = searchParams.get('search') || '';
  const requestedSortBy = searchParams.get('sortBy');
  const sortBy = SORT_FIELDS.has(requestedSortBy) ? requestedSortBy : null;
  const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [timelineResult, setTimelineResult] = useState(null);
  const debouncedSearch = useDebouncedValue(search.trim(), 350);
  const params = {
    filter,
    search: debouncedSearch,
    page,
    size,
    sortBy: sortBy || undefined,
    sortOrder: sortBy ? sortOrder : undefined,
  };
  const query = useTrackingResultsQuery(taskId, params, enabled, !isTerminal);
  const rows = pageContent(query.data);
  const totalResults = pageTotal(query.data);
  const spareParts = domain === 'SPARE_PART';
  const hasActiveFilters = filter !== 'ALL' || Boolean(search.trim());

  useEffect(() => setPage(0), [debouncedSearch, filter, sortBy, sortOrder]);

  const handleFilterChange = (nextFilter) => {
    const next = new URLSearchParams(searchParams);
    if (nextFilter === 'ALL') next.delete('filter');
    else next.set('filter', nextFilter);
    setSearchParams(next, { replace: true });
  };

  const handleSearchChange = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('search', value);
    else next.delete('search');
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('filter');
    next.delete('search');
    setPage(0);
    setSearchParams(next, { replace: true });
  };

  const handleSort = (columnKey) => {
    const nextSortBy = SORTABLE_COLUMNS[columnKey];
    if (!nextSortBy) return;
    const next = new URLSearchParams(searchParams);
    const nextOrder = sortBy === nextSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    next.set('sortBy', nextSortBy);
    next.set('sortOrder', nextOrder);
    setPage(0);
    setSearchParams(next, { replace: true });
  };

  const columnHeader = (key) => {
    const apiField = SORTABLE_COLUMNS[key];
    const active = Boolean(apiField && sortBy === apiField);
    return (
      <TableCell key={key} sortDirection={active ? sortOrder : false} sx={{ fontWeight: 950 }}>
        {apiField ? (
          <TableSortLabel active={active} direction={active ? sortOrder : 'asc'} onClick={() => handleSort(key)}>
            {t(`taskTracking.results.columns.${key}`)}
          </TableSortLabel>
        ) : t(`taskTracking.results.columns.${key}`)}
      </TableCell>
    );
  };

  if (query.isLoading) return <TrackingLoading />;
  if (query.isError && !query.data) return <TrackingError error={query.error} onRetry={query.refetch} />;

  return (
    <>
    <Card sx={trackingPanelSx}>
      <CardContent sx={{ p: 0 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={trackingToolbarSx}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box sx={trackingSectionIconSx('success')}><FactCheckRoundedIcon /></Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 950 }}>{t('taskTracking.results.title')}</Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.82rem', mt: 0.1 }}>{t('taskTracking.results.subtitle')}</Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            variant="outlined"
            label={t('taskTracking.results.resultsCount', { count: formatTrackingNumber(totalResults, i18n.language) })}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, bgcolor: 'background.paper' }}
          />
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          alignItems={{ md: 'center' }}
          justifyContent="space-between"
          sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', ...trackingFiltersSx }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flex: 1 }}>
            <TextField
              size="small"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={t('taskTracking.results.search')}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment>,
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" aria-label={t('taskTracking.results.clearSearch')} onClick={() => handleSearchChange('')}>
                      <CloseRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{ minWidth: { sm: 280 }, maxWidth: { md: 420 }, flex: 1 }}
            />
            <TextField select size="small" value={filter} onChange={(event) => handleFilterChange(event.target.value)} sx={{ minWidth: 180 }}>
              {FILTERS.map((value) => <MenuItem value={value} key={value}>{t(`taskTracking.resultFilters.${value}`)}</MenuItem>)}
            </TextField>
          </Stack>
          {hasActiveFilters && (
            <Button size="small" color="inherit" startIcon={<FilterAltOffRoundedIcon />} onClick={clearFilters} sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
              {t('taskTracking.results.clearFilters')}
            </Button>
          )}
        </Stack>

        {query.isError && <Box sx={{ px: 2, pb: 2 }}><TrackingError error={query.error} onRetry={query.refetch} /></Box>}

        {rows.length === 0 ? (
          <TrackingEmpty title={t('taskTracking.results.empty')} />
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'min(68vh, 720px)' }}>
              <Table size="small" stickyHeader sx={(theme) => ({ minWidth: spareParts ? 1450 : 1180, ...trackingTableSx(theme) })}>
                <TableHead>
                  <TableRow>
                    {['code', 'description', 'status', 'expectedArea', 'actualArea'].map(columnHeader)}
                    {spareParts && ['expectedQuantity', 'actualQuantity', 'variance'].map(columnHeader)}
                    {['acceptedBy', 'acceptedAt', 'details'].map(columnHeader)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const statusKey = resultStatusKey(row);
                    return (
                      <TableRow key={row.itemId} hover>
                        <TableCell sx={{ minWidth: 160 }}>
                          <Box component="code" sx={{ display: 'inline-block', px: 0.8, py: 0.35, borderRadius: 0.75, bgcolor: '#F3F5F8', color: 'text.primary', fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 800 }}>{row.code}</Box>
                          {row.secondaryCode && <Typography color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.68rem', mt: 0.35 }}>{row.secondaryCode}</Typography>}
                        </TableCell>
                        <TableCell sx={{ minWidth: 190 }}>{row.description || '-'}</TableCell>
                        <TableCell><Chip size="small" variant="outlined" color={resultStatusColor(row)} label={t(`taskTracking.resultFilters.${statusKey}`)} /></TableCell>
                        <TableCell sx={{ minWidth: 190 }}>{expectedAreaPath(row)}</TableCell>
                        <TableCell sx={{ minWidth: 190 }}>{areaPath(row)}</TableCell>
                        {spareParts && (
                          <>
                            <TableCell>{formatTrackingQuantity(row.expectedQuantity, i18n.language)}</TableCell>
                            <TableCell>{formatTrackingQuantity(row.actualQuantity, i18n.language)}</TableCell>
                            <TableCell>
                              <Typography color={Number(row.varianceQuantity || 0) === 0 ? 'text.primary' : 'error.main'} sx={{ fontWeight: 900 }}>
                                {formatTrackingQuantity(row.varianceQuantity, i18n.language)}
                              </Typography>
                            </TableCell>
                          </>
                        )}
                        <TableCell>{userDisplayName(row.acceptedBy)}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTrackingDateTime(row.acceptedAt, i18n.language)}</TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            sx={{
                              minWidth: 112,
                              '& .MuiIconButton-root': {
                                width: 30,
                                height: 30,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                bgcolor: 'background.paper',
                              },
                            }}
                          >
                            <Tooltip title={t('taskTracking.results.scanHistory.open')}>
                              <IconButton size="small" color="primary" onClick={() => setTimelineResult(row)}>
                                <HistoryRoundedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            {row.notes && (
                              <Tooltip title={row.notes}>
                                <IconButton size="small" aria-label={t('taskTracking.results.columns.details')}>
                                  <NotesRoundedIcon sx={{ fontSize: 17 }} color="action" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {row.hasImage && row.currentScanId && (
                              <Tooltip title={t('taskTracking.image.view')}>
                                <IconButton size="small" color="primary" onClick={() => onOpenImage(row.currentScanId)}>
                                  <PhotoOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={trackingPaginationSx}>
              {query.isFetching && <CircularProgress size={18} sx={{ mr: 1 }} />}
              <TablePagination
                component="div"
                count={pageTotal(query.data)}
                page={page}
                rowsPerPage={size}
                rowsPerPageOptions={[10, 25, 50, 100]}
                onPageChange={(_event, nextPage) => setPage(nextPage)}
                onRowsPerPageChange={(event) => { setSize(Number(event.target.value)); setPage(0); }}
              />
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
    <ResultScanTimelineDialog
      open={Boolean(timelineResult)}
      taskId={taskId}
      result={timelineResult}
      isTerminal={isTerminal}
      onClose={() => setTimelineResult(null)}
      onOpenImage={onOpenImage}
    />
    </>
  );
}

export default ResultsTab;
