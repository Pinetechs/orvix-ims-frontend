import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { TrackingEmpty, TrackingError, TrackingLoading } from '../components/TrackingState.jsx';
import { clampTrackingPercentage, formatTrackingDateTime, formatTrackingNumber, userDisplayName } from '../utils/trackingFormatters.js';
import {
  trackingFiltersSx,
  trackingPanelSx,
  trackingSectionIconSx,
  trackingTableSx,
  trackingToolbarSx,
} from '../components/trackingStyles.js';

const STATUS_COLORS = { NOT_STARTED: 'default', ACTIVE: 'primary', STALLED: 'error', COMPLETED: 'success' };
const AREA_LEVEL_ORDER = ['BRANCH', 'STORE', 'LOCATION', 'FLOOR', 'PLACE'];

const areaDepth = (area, byKey, seen = new Set()) => {
  if (!area?.parentKey || seen.has(area.key)) return 0;
  const parent = byKey.get(area.parentKey);
  if (!parent) return 0;
  seen.add(area.key);
  return 1 + areaDepth(parent, byKey, seen);
};

const areaAncestors = (area, byKey) => {
  if (!area?.parentKey) return [];
  const ancestors = [];
  const seen = new Set();
  let parentKey = area.parentKey;

  while (parentKey) {
    if (seen.has(parentKey)) break;
    seen.add(parentKey);
    const parent = byKey.get(parentKey);
    if (!parent) break;
    ancestors.unshift(parent);
    parentKey = parent.parentKey;
  }

  return ancestors;
};

const areaName = (area) => area?.name || area?.code || '-';

function AreasTab({ query }) {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const rows = useMemo(() => (Array.isArray(query.data) ? query.data : []), [query.data]);
  const byKey = useMemo(() => new Map(rows.map((row) => [row.key, row])), [rows]);
  const number = (value) => formatTrackingNumber(value, i18n.language);
  const availableLevels = useMemo(() => {
    const levels = new Set(rows.map((row) => row.level).filter(Boolean));
    return [
      ...AREA_LEVEL_ORDER.filter((level) => levels.has(level)),
      ...[...levels].filter((level) => !AREA_LEVEL_ORDER.includes(level)).sort(),
    ];
  }, [rows]);
  const ancestorsByRow = useMemo(() => new Map(
    rows.map((row) => [row, areaAncestors(row, byKey)]),
  ), [byKey, rows]);
  const parentPathByRow = useMemo(() => new Map(
    rows.map((row) => [row, (ancestorsByRow.get(row) || []).map(areaName).join(' / ')]),
  ), [ancestorsByRow, rows]);
  const requestedLevel = searchParams.get('areaLevel');
  const level = availableLevels.includes(requestedLevel) ? requestedLevel : 'ALL';

  const handleLevelChange = (nextLevel) => {
    const next = new URLSearchParams(searchParams);
    if (nextLevel === 'ALL') next.delete('areaLevel');
    else next.set('areaLevel', nextLevel);
    setSearchParams(next, { replace: true });
  };

  const visibleRows = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus = status === 'ALL' || row.status === status;
      const matchesLevel = level === 'ALL' || row.level === level;
      const haystack = `${row.code || ''} ${row.name || ''} ${parentPathByRow.get(row) || ''} ${(row.assignedStaff || []).map(userDisplayName).join(' ')}`.toLowerCase();
      return matchesStatus && matchesLevel && (!normalized || haystack.includes(normalized));
    });
  }, [level, parentPathByRow, rows, search, status]);

  if (query.isLoading) return <TrackingLoading />;
  if (query.isError && !query.data) return <TrackingError error={query.error} onRetry={query.refetch} />;

  return (
    <Card sx={trackingPanelSx}>
      <CardContent sx={{ p: 0 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.2} justifyContent="space-between" sx={trackingToolbarSx}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box sx={trackingSectionIconSx('primary')}><AccountTreeRoundedIcon /></Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 950 }}>{t('taskTracking.areas.title')}</Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.82rem', mt: 0.1 }}>{t('taskTracking.areas.subtitle')}</Typography>
            </Box>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={trackingFiltersSx}>
            <TextField
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('taskTracking.areas.search')}
              InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 0.8, color: 'text.secondary' }} /> }}
              sx={{ minWidth: { sm: 240 } }}
            />
            <TextField select size="small" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 170 }}>
              <MenuItem value="ALL">{t('taskTracking.common.allStatuses')}</MenuItem>
              {['NOT_STARTED', 'ACTIVE', 'STALLED', 'COMPLETED'].map((value) => (
                <MenuItem value={value} key={value}>{t(`taskTracking.areaStatuses.${value}`)}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" value={level} onChange={(event) => handleLevelChange(event.target.value)} sx={{ minWidth: 170 }}>
              <MenuItem value="ALL">{t('taskTracking.areas.allLevels')}</MenuItem>
              {availableLevels.map((value) => (
                <MenuItem value={value} key={value}>{t(`taskTracking.areaLevels.${value}`, { defaultValue: value })}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        {query.isError && <Box sx={{ px: 2, pb: 2 }}><TrackingError error={query.error} onRetry={query.refetch} /></Box>}

        {visibleRows.length === 0 ? (
          <TrackingEmpty title={t('taskTracking.areas.empty')} />
        ) : (
          <TableContainer sx={{ maxHeight: 'min(68vh, 720px)' }}>
            <Table size="small" stickyHeader sx={(theme) => ({ minWidth: 1050, ...trackingTableSx(theme) })}>
              <TableHead>
                <TableRow>
                  {['area', 'status', 'progress', 'planned', 'processed', 'mismatched', 'events', 'staff', 'lastActivity'].map((key) => (
                    <TableCell key={key} sx={{ fontWeight: 950 }}>{t(`taskTracking.areas.columns.${key}`)}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.map((row) => {
                  const progress = clampTrackingPercentage(row.progressPercentage);
                  const ancestors = ancestorsByRow.get(row) || [];
                  const parentPath = parentPathByRow.get(row);
                  const depth = ancestors.length || areaDepth(row, byKey);
                  return (
                    <TableRow key={row.key} hover>
                      <TableCell>
                        <Box sx={{ ps: depth * 2.5 }}>
                          <Typography sx={{ fontWeight: 900 }}>{row.name || row.code}</Typography>
                          <Typography color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                            {t(`taskTracking.areaLevels.${row.level}`)}{row.code ? ` · ${row.code}` : ''}
                          </Typography>
                          {parentPath && (
                            <Stack direction="row" spacing={0.45} alignItems="center" sx={{ mt: 0.45, color: 'text.secondary', minWidth: 0 }}>
                              <LocationOnOutlinedIcon sx={{ fontSize: 14, flexShrink: 0 }} />
                              <Typography title={parentPath} noWrap sx={{ fontSize: '0.7rem', maxWidth: 360 }}>
                                {t('taskTracking.areas.locatedIn')}: {parentPath}
                              </Typography>
                            </Stack>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" color={STATUS_COLORS[row.status] || 'default'} label={t(`taskTracking.areaStatuses.${row.status}`)} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LinearProgress variant="determinate" value={progress} sx={{ width: 90, height: 7, borderRadius: 99 }} />
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 900 }}>{progress}%</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{number(row.planned)}</TableCell>
                      <TableCell>{number(row.processed)}</TableCell>
                      <TableCell><Typography color={row.mismatched > 0 ? 'error.main' : 'text.primary'} sx={{ fontWeight: 900 }}>{number(row.mismatched)}</Typography></TableCell>
                      <TableCell>{number(row.scanEvents)}</TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(row.assignedStaff || []).length === 0 ? '-' : row.assignedStaff.map((user) => (
                            <Chip key={user.id || user.username} size="small" variant="outlined" label={userDisplayName(user)} />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTrackingDateTime(row.lastActivityAt, i18n.language)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default AreasTab;
