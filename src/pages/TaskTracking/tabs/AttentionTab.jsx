import React from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { TrackingEmpty, TrackingError, TrackingLoading } from '../components/TrackingState.jsx';
import { formatTrackingDateTime, formatTrackingNumber, userDisplayName } from '../utils/trackingFormatters.js';
import { trackingPanelSx, trackingSectionIconSx, trackingToolbarSx } from '../components/trackingStyles.js';

const ATTENTION_COLORS = {
  MISMATCH: 'error',
  EXTRA: 'warning',
  AMBIGUOUS: 'error',
  CONFLICT: 'error',
  MISSING_IMAGE: 'warning',
  STAFF_NOTE: 'info',
  STALLED_AREA: 'error',
  READY_FOR_REVIEW: 'success',
  IMPORT_FAILED: 'error',
  HIGH_DUPLICATE_RATE: 'warning',
  AREA_NOT_STARTED: 'default',
};

const ATTENTION_TYPES = Object.keys(ATTENTION_COLORS);

const SUMMARY_TONES = {
  totalIssues: 'error',
  currentMismatches: 'error',
  missingRequiredImages: 'warning',
  extraEvents: 'warning',
  uniqueUnexpectedCodes: 'warning',
  ambiguousEvents: 'error',
  conflicts: 'error',
  staffNotes: 'info',
  stalledAreas: 'error',
  notStartedAreas: 'default',
};

const SUMMARY_FILTERS = {
  totalIssues: 'ALL',
  currentMismatches: 'MISMATCH',
  missingRequiredImages: 'MISSING_IMAGE',
  extraEvents: 'EXTRA',
  uniqueUnexpectedCodes: 'EXTRA',
  ambiguousEvents: 'AMBIGUOUS',
  conflicts: 'CONFLICT',
  staffNotes: 'STAFF_NOTE',
  stalledAreas: 'STALLED_AREA',
  notStartedAreas: 'AREA_NOT_STARTED',
};

function AttentionTab({ query, onOpenImage }) {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedType = searchParams.get('attentionType');
  const attentionType = ATTENTION_TYPES.includes(requestedType) ? requestedType : 'ALL';
  const attention = query.data || {};
  const summary = attention.summary || {};
  const items = Array.isArray(attention.items) ? attention.items : [];
  const visibleItems = attentionType === 'ALL' ? items : items.filter((item) => item.type === attentionType);
  const number = (value) => formatTrackingNumber(value, i18n.language);

  const setAttentionType = (nextType) => {
    const next = new URLSearchParams(searchParams);
    if (nextType === 'ALL') next.delete('attentionType');
    else next.set('attentionType', nextType);
    setSearchParams(next, { replace: true });
  };

  if (query.isLoading) return <TrackingLoading />;
  if (query.isError && !query.data) return <TrackingError error={query.error} onRetry={query.refetch} />;

  const summaryKeys = [
    'totalIssues', 'currentMismatches', 'missingRequiredImages', 'extraEvents', 'uniqueUnexpectedCodes', 'ambiguousEvents',
    'conflicts', 'staffNotes', 'stalledAreas', 'notStartedAreas',
  ];

  return (
    <Stack spacing={2.2}>
      {query.isError && <TrackingError error={query.error} onRetry={query.refetch} />}
      <Grid container spacing={1.3}>
        {summaryKeys.map((key) => {
          const tone = SUMMARY_TONES[key];
          const filterType = SUMMARY_FILTERS[key];
          const selected = attentionType === filterType;
          return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
            <Card
              component="button"
              type="button"
              onClick={() => setAttentionType(filterType)}
              sx={(theme) => ({
                width: '100%',
                height: '100%',
                p: 0,
                appearance: 'none',
                boxShadow: 'none',
                borderRadius: 1.5,
                borderColor: selected ? 'primary.main' : alpha(theme.palette[tone]?.main || theme.palette.divider, 0.14),
                bgcolor: selected ? alpha(theme.palette.primary.main, 0.035) : 'background.paper',
                color: 'inherit',
                font: 'inherit',
                textAlign: 'start',
                cursor: 'pointer',
                transition: 'border-color 140ms ease, background-color 140ms ease',
                '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.35), bgcolor: alpha(theme.palette.primary.main, 0.025) },
                '&:focus-visible': { outline: `3px solid ${alpha(theme.palette.primary.main, 0.18)}`, outlineOffset: 2 },
              })}
            >
              <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}>
                <Typography color="text.secondary" sx={{ fontSize: '0.73rem', fontWeight: 850 }}>{t(`taskTracking.attention.summary.${key}`)}</Typography>
                <Typography color={Number(summary[key]) > 0 && tone !== 'default' ? `${tone}.main` : 'text.primary'} sx={{ fontWeight: 900, mt: 0.35, fontSize: '1.35rem' }}>
                  {number(summary[key])}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          );
        })}
      </Grid>

      {(summary.importFailed || summary.highDuplicateRate || summary.readyForReview) && (
        <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
          {summary.importFailed && <Chip color="error" label={t('taskTracking.attention.flags.importFailed')} />}
          {summary.highDuplicateRate && <Chip color="warning" label={t('taskTracking.attention.flags.highDuplicateRate')} />}
          {summary.readyForReview && <Chip color="success" label={t('taskTracking.attention.flags.readyForReview')} />}
        </Stack>
      )}

      <Card sx={trackingPanelSx}>
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ md: 'center' }} justifyContent="space-between" sx={(theme) => ({ ...trackingToolbarSx(theme), m: { xs: -2, md: -2.5 }, mb: 2.5 })}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box sx={trackingSectionIconSx('warning')}><ReportProblemRoundedIcon /></Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 950 }}>{t('taskTracking.attention.title')}</Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.82rem', mt: 0.1 }}>{t('taskTracking.attention.subtitle')}</Typography>
              </Box>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8} alignItems={{ sm: 'center' }}>
              <Chip size="small" variant="outlined" label={t('taskTracking.attention.resultsCount', { count: number(visibleItems.length) })} sx={{ bgcolor: 'background.paper', alignSelf: { xs: 'flex-start', sm: 'center' } }} />
              <TextField select size="small" value={attentionType} onChange={(event) => setAttentionType(event.target.value)} sx={{ minWidth: 210, bgcolor: 'background.paper' }}>
                <MenuItem value="ALL">{t('taskTracking.attention.filters.all')}</MenuItem>
                {ATTENTION_TYPES.map((type) => <MenuItem value={type} key={type}>{t(`taskTracking.attention.types.${type}`)}</MenuItem>)}
              </TextField>
              {attentionType !== 'ALL' && (
                <Button size="small" color="inherit" startIcon={<FilterAltOffRoundedIcon />} onClick={() => setAttentionType('ALL')} sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  {t('taskTracking.attention.filters.clear')}
                </Button>
              )}
            </Stack>
          </Stack>

          {visibleItems.length === 0 ? (
            <TrackingEmpty title={attentionType === 'ALL' ? t('taskTracking.attention.empty') : t('taskTracking.attention.filteredEmpty')} />
          ) : (
            <Stack spacing={1.1} sx={{ mt: 2 }}>
              {visibleItems.map((item) => (
                <Box
                  key={item.key}
                  sx={(theme) => ({
                    p: { xs: 1.5, md: 1.8 },
                    borderRadius: 1.5,
                    border: `1px solid ${alpha(theme.palette[ATTENTION_COLORS[item.type]]?.main || theme.palette.primary.main, 0.14)}`,
                    borderInlineStart: `3px solid ${theme.palette[ATTENTION_COLORS[item.type]]?.main || theme.palette.primary.main}`,
                    bgcolor: 'background.paper',
                  })}
                >
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.3} justifyContent="space-between">
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={0.7} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Chip size="small" color={ATTENTION_COLORS[item.type] || 'default'} label={t(`taskTracking.attention.types.${item.type}`)} />
                        <Typography sx={{ fontWeight: 950 }}>{item.title || item.code || t(`taskTracking.attention.types.${item.type}`)}</Typography>
                      </Stack>
                      {item.description && <Typography color="text.secondary" sx={{ mt: 0.55 }}>{item.description}</Typography>}
                      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.8 }}>
                        {item.code && <Typography sx={{ fontSize: '0.76rem' }}><b>{t('taskTracking.common.code')}:</b> {item.code}</Typography>}
                        {item.expectedArea && <Typography sx={{ fontSize: '0.76rem' }}><b>{t('taskTracking.common.expected')}:</b> {item.expectedArea}</Typography>}
                        {item.actualArea && <Typography sx={{ fontSize: '0.76rem' }}><b>{t('taskTracking.common.actual')}:</b> {item.actualArea}</Typography>}
                        {item.relatedUser && <Typography sx={{ fontSize: '0.76rem' }}><b>{t('taskTracking.common.staff')}:</b> {userDisplayName(item.relatedUser)}</Typography>}
                        <Typography sx={{ fontSize: '0.76rem' }}>{formatTrackingDateTime(item.occurredAt, i18n.language)}</Typography>
                      </Stack>
                    </Box>
                    {item.hasImage && item.scanId && (
                      <Button size="small" variant="outlined" startIcon={<PhotoOutlinedIcon />} onClick={() => onOpenImage(item.scanId)} sx={{ alignSelf: { md: 'center' }, flexShrink: 0 }}>
                        {t('taskTracking.image.view')}
                      </Button>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
          {attention.truncated && <Alert severity="info" icon={<WarningAmberRoundedIcon />} sx={{ mt: 2 }}>{t('taskTracking.attention.truncated')}</Alert>}
        </CardContent>
      </Card>
    </Stack>
  );
}

export default AttentionTab;
