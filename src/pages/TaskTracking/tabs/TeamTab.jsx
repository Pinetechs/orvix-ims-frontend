import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

import { TrackingEmpty, TrackingError, TrackingLoading } from '../components/TrackingState.jsx';
import { formatTrackingDateTime, formatTrackingDuration, formatTrackingNumber, userDisplayName } from '../utils/trackingFormatters.js';
import { trackingPanelSx, trackingSectionIconSx, trackingTableSx, trackingToolbarSx } from '../components/trackingStyles.js';

function TeamTab({ query }) {
  const { t, i18n } = useTranslation();
  const rows = Array.isArray(query.data) ? query.data : [];
  const number = (value) => formatTrackingNumber(value, i18n.language);

  if (query.isLoading) return <TrackingLoading />;
  if (query.isError && !query.data) return <TrackingError error={query.error} onRetry={query.refetch} />;

  return (
    <Card sx={trackingPanelSx}>
      <CardContent sx={{ p: 0 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" sx={trackingToolbarSx}>
          <Box sx={trackingSectionIconSx('secondary')}><GroupsRoundedIcon /></Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 950 }}>{t('taskTracking.team.title')}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.82rem', mt: 0.1 }}>{t('taskTracking.team.subtitle')}</Typography>
          </Box>
        </Stack>
        {query.isError && <Box sx={{ px: 2, pb: 2 }}><TrackingError error={query.error} onRetry={query.refetch} /></Box>}
        {rows.length === 0 ? (
          <TrackingEmpty title={t('taskTracking.team.empty')} />
        ) : (
          <TableContainer sx={{ maxHeight: 'min(68vh, 720px)' }}>
            <Table size="small" stickyHeader sx={(theme) => ({ minWidth: 1250, ...trackingTableSx(theme) })}>
              <TableHead>
                <TableRow>
                  {['member', 'areas', 'accepted', 'matched', 'mismatched', 'events', 'duplicates', 'conflicts', 'corrections', 'extras', 'lastActivity', 'inactive'].map((key) => (
                    <TableCell key={key} sx={{ fontWeight: 950 }}>{t(`taskTracking.team.columns.${key}`)}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const name = userDisplayName(row.user);
                  return (
                    <TableRow key={row.user?.id || row.user?.username} hover>
                      <TableCell sx={{ minWidth: 210 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 36, height: 36, fontSize: '0.8rem', fontWeight: 900, bgcolor: 'primary.dark' }}>{name.slice(0, 2).toUpperCase()}</Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 900 }}>{name}</Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Typography color="text.secondary" sx={{ fontSize: '0.72rem' }}>{row.user?.mobile || row.user?.username || '-'}</Typography>
                              <Chip
                                size="small"
                                variant="outlined"
                                color={row.currentlyAssigned ? 'success' : 'default'}
                                label={t(row.currentlyAssigned ? 'taskTracking.team.assigned' : 'taskTracking.team.previous')}
                                sx={{ height: 20, fontSize: '0.64rem' }}
                              />
                            </Stack>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ minWidth: 210 }}>
                        <Stack direction="row" spacing={0.45} flexWrap="wrap" useFlexGap>
                          {(row.assignedAreas || []).length === 0 ? '-' : row.assignedAreas.slice(0, 4).map((area) => (
                            <Chip key={area} size="small" label={area} variant="outlined" />
                          ))}
                          {(row.assignedAreas || []).length > 4 && <Chip size="small" label={`+${row.assignedAreas.length - 4}`} />}
                        </Stack>
                      </TableCell>
                      <TableCell>{number(row.acceptedExpectedItems)}</TableCell>
                      <TableCell>{number(row.matched)}</TableCell>
                      <TableCell><Typography color={row.mismatched > 0 ? 'error.main' : 'text.primary'} sx={{ fontWeight: 900 }}>{number(row.mismatched)}</Typography></TableCell>
                      <TableCell>{number(row.scanEvents)}</TableCell>
                      <TableCell>{number(row.duplicates)}</TableCell>
                      <TableCell>{number(row.conflicts)}</TableCell>
                      <TableCell>{number(row.corrections)}</TableCell>
                      <TableCell>{number(row.extras)}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTrackingDateTime(row.lastActivityAt, i18n.language)}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.inactiveSeconds == null ? '-' : formatTrackingDuration(row.inactiveSeconds, t)}</TableCell>
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

export default TeamTab;
