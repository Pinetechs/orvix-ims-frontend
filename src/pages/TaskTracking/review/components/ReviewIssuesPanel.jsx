import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
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
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import { useTranslation } from 'react-i18next';

import { useDebouncedValue } from '../../../../hooks/useDebouncedValue.js';
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
import { useReviewIssuesQuery } from '../hooks/useReviewCenterQueries.js';
import {
  ISSUE_STATUS_COLORS,
  ISSUE_TYPE_COLORS,
  REVIEW_ISSUE_STATUSES,
  REVIEW_ISSUE_TYPES,
  issueActualLocation,
  issueExpectedLocation,
  pageCount,
  pageRows,
} from '../utils/reviewFormatters.js';

function ReviewIssuesPanel({
  taskId,
  enabled,
  canManage,
  filterRequest,
  selectionResetKey,
  onOpenIssue,
  onCreateRecheck,
}) {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState('OPEN');
  const [type, setType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [selected, setSelected] = useState(() => new Map());
  const debouncedSearch = useDebouncedValue(search.trim(), 350);
  const params = {
    status,
    type,
    search: debouncedSearch,
    page,
    size,
    sortBy: 'detectedAt',
    sortOrder: 'desc',
  };
  const query = useReviewIssuesQuery(taskId, params, enabled);
  const rows = pageRows(query.data);
  const total = pageCount(query.data);
  const selectedIssues = useMemo(() => Array.from(selected.values()), [selected]);
  const selectedArea = selectedIssues[0]?.workAreaKey || null;
  const selectableRows = rows.filter((row) =>
    row.status === 'OPEN' && (!selectedArea || row.workAreaKey === selectedArea));
  const allSelectableSelected = selectableRows.length > 0
    && selectableRows.every((row) => selected.has(row.id));
  const someSelectableSelected = selectableRows.some((row) => selected.has(row.id));

  useEffect(() => {
    setPage(0);
    setSelected(new Map());
  }, [debouncedSearch, status, type]);

  useEffect(() => {
    setSelected(new Map());
  }, [selectionResetKey]);

  useEffect(() => {
    if (!filterRequest?.nonce) return;
    if (filterRequest.status) setStatus(filterRequest.status);
    if (filterRequest.type) setType(filterRequest.type);
  }, [filterRequest]);

  const toggleIssue = (issue) => {
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(issue.id)) {
        next.delete(issue.id);
      } else {
        next.set(issue.id, issue);
      }
      return next;
    });
  };

  const togglePage = () => {
    setSelected((current) => {
      const next = new Map(current);
      if (allSelectableSelected) {
        selectableRows.forEach((row) => next.delete(row.id));
        return next;
      }
      const area = selectedArea || selectableRows[0]?.workAreaKey;
      selectableRows
        .filter((row) => row.workAreaKey === area)
        .forEach((row) => next.set(row.id, row));
      return next;
    });
  };

  if (query.isLoading && !query.data) return <TrackingLoading />;
  if (query.isError && !query.data) return <TrackingError error={query.error} onRetry={query.refetch} />;

  return (
    <Card sx={trackingPanelSx}>
      <CardContent sx={{ p: 0 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.2}
          alignItems={{ md: 'center' }}
          justifyContent="space-between"
          sx={trackingToolbarSx}
        >
          <Stack direction="row" spacing={1.1} alignItems="center">
            <Box sx={trackingSectionIconSx('warning')}><RuleOutlinedIcon /></Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 950 }}>{t('taskTracking.review.issues.title')}</Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }}>{t('taskTracking.review.issues.subtitle')}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              variant="outlined"
              label={t('taskTracking.review.issues.resultsCount', {
                count: formatTrackingNumber(total, i18n.language),
              })}
            />
            {canManage && selectedIssues.length > 0 && (
              <Button
                size="small"
                variant="contained"
                startIcon={<AssignmentIndOutlinedIcon />}
                onClick={() => onCreateRecheck(selectedIssues)}
              >
                {t('taskTracking.review.issues.createRecheck', { count: selectedIssues.length })}
              </Button>
            )}
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1}
          sx={{ p: 2, borderBottom: 1, borderColor: 'divider', ...trackingFiltersSx }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('taskTracking.review.issues.search')}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment>,
            }}
            sx={{ flex: 1, minWidth: { sm: 260 } }}
          />
          <TextField select size="small" label={t('taskTracking.review.issues.status')} value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 190 }}>
            <MenuItem value="ALL">{t('taskTracking.review.filters.allStatuses')}</MenuItem>
            {REVIEW_ISSUE_STATUSES.map((value) => (
              <MenuItem value={value} key={value}>{t(`taskTracking.review.issueStatuses.${value}`)}</MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label={t('taskTracking.review.issues.type')} value={type} onChange={(event) => setType(event.target.value)} sx={{ minWidth: 210 }}>
            <MenuItem value="ALL">{t('taskTracking.review.filters.allTypes')}</MenuItem>
            {REVIEW_ISSUE_TYPES.map((value) => (
              <MenuItem value={value} key={value}>{t(`taskTracking.review.issueTypes.${value}`)}</MenuItem>
            ))}
          </TextField>
        </Stack>

        {query.isError && <Box sx={{ p: 2 }}><TrackingError error={query.error} onRetry={query.refetch} /></Box>}

        {rows.length === 0 ? (
          <TrackingEmpty title={t('taskTracking.review.issues.empty')} />
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'min(66vh, 700px)' }}>
              <Table size="small" stickyHeader sx={(theme) => ({ minWidth: 1280, ...trackingTableSx(theme) })}>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      {canManage && (
                        <Checkbox
                          size="small"
                          checked={allSelectableSelected}
                          indeterminate={!allSelectableSelected && someSelectableSelected}
                          disabled={selectableRows.length === 0}
                          onChange={togglePage}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 950 }}>{t('taskTracking.review.issues.type')}</TableCell>
                    <TableCell sx={{ fontWeight: 950 }}>{t('taskTracking.review.issues.status')}</TableCell>
                    <TableCell sx={{ fontWeight: 950 }}>{t('taskTracking.review.issues.item')}</TableCell>
                    <TableCell sx={{ fontWeight: 950 }}>{t('taskTracking.review.issues.workArea')}</TableCell>
                    <TableCell sx={{ fontWeight: 950 }}>{t('taskTracking.review.issues.expected')}</TableCell>
                    <TableCell sx={{ fontWeight: 950 }}>{t('taskTracking.review.issues.actual')}</TableCell>
                    <TableCell sx={{ fontWeight: 950 }}>{t('taskTracking.review.issues.detectedAt')}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 950 }}>{t('taskTracking.review.issues.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const selectable = canManage
                      && row.status === 'OPEN'
                      && (!selectedArea || row.workAreaKey === selectedArea || selected.has(row.id));
                    return (
                      <TableRow key={row.id} hover selected={selected.has(row.id)}>
                        <TableCell padding="checkbox">
                          {canManage && (
                            <Checkbox
                              size="small"
                              checked={selected.has(row.id)}
                              disabled={!selectable}
                              onChange={() => toggleIssue(row)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" color={ISSUE_TYPE_COLORS[row.issueType]} label={t(`taskTracking.review.issueTypes.${row.issueType}`)} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.6} alignItems="center">
                            <Chip size="small" variant="outlined" color={ISSUE_STATUS_COLORS[row.status]} label={t(`taskTracking.review.issueStatuses.${row.status}`)} />
                            {row.blocking && <Tooltip title={t('taskTracking.review.issues.blocking')}><Box component="span" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'error.main' }} /></Tooltip>}
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ minWidth: 170 }}>
                          <Typography component="code" sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 850 }}>{row.itemCode || '-'}</Typography>
                          {row.itemDescription && <Typography color="text.secondary" sx={{ mt: 0.25, fontSize: '0.72rem' }}>{row.itemDescription}</Typography>}
                        </TableCell>
                        <TableCell sx={{ minWidth: 170 }}>{row.workAreaLabel || '-'}</TableCell>
                        <TableCell sx={{ minWidth: 180 }}>{issueExpectedLocation(row)}</TableCell>
                        <TableCell sx={{ minWidth: 180 }}>{issueActualLocation(row)}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTrackingDateTime(row.detectedAt, i18n.language)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title={t('taskTracking.review.issues.view')}>
                            <IconButton size="small" color="primary" onClick={() => onOpenIssue(row.id)}>
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

export default ReviewIssuesPanel;
