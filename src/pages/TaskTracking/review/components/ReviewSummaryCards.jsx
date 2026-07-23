import React from 'react';
import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import GppMaybeOutlinedIcon from '@mui/icons-material/GppMaybeOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import { useTranslation } from 'react-i18next';

import { formatTrackingNumber } from '../../utils/trackingFormatters.js';
import { ISSUE_TYPE_COLORS, REVIEW_ISSUE_TYPES } from '../utils/reviewFormatters.js';

const CARDS = [
  { key: 'blockingOpenIssues', icon: <GppMaybeOutlinedIcon />, tone: 'error' },
  { key: 'activeRecheckRequests', icon: <PendingActionsOutlinedIcon />, tone: 'warning' },
  { key: 'submittedIssues', icon: <FactCheckOutlinedIcon />, tone: 'secondary' },
  { key: 'resolvedIssues', icon: <AssignmentTurnedInOutlinedIcon />, tone: 'success' },
];

function ReviewSummaryCards({ summary, onFilterStatus, onFilterType }) {
  const { t, i18n } = useTranslation();
  const number = (value) => formatTrackingNumber(value, i18n.language);
  const values = {
    blockingOpenIssues: summary?.blockingOpenIssues,
    activeRecheckRequests: summary?.activeRecheckRequests,
    submittedIssues: summary?.issuesByStatus?.RECHECK_SUBMITTED,
    resolvedIssues: summary?.issuesByStatus?.RESOLVED,
  };
  const statusFilters = {
    submittedIssues: 'RECHECK_SUBMITTED',
    resolvedIssues: 'RESOLVED',
  };

  return (
    <Stack spacing={1.4}>
      <Grid container spacing={1.25}>
        {CARDS.map(({ key, icon, tone }) => (
          <Grid item xs={12} sm={6} lg={3} key={key}>
            <Card
              component={statusFilters[key] ? 'button' : 'div'}
              type={statusFilters[key] ? 'button' : undefined}
              onClick={statusFilters[key] ? () => onFilterStatus(statusFilters[key]) : undefined}
              sx={(theme) => ({
                width: '100%',
                height: '100%',
                p: 0,
                textAlign: 'start',
                color: 'inherit',
                font: 'inherit',
                appearance: 'none',
                cursor: statusFilters[key] ? 'pointer' : 'default',
                boxShadow: 'none',
                borderRadius: 1.5,
                borderColor: alpha(theme.palette[tone].main, 0.18),
                bgcolor: alpha(theme.palette[tone].main, 0.025),
                transition: 'border-color 140ms ease, transform 140ms ease',
                '&:hover': statusFilters[key]
                  ? { borderColor: alpha(theme.palette[tone].main, 0.45), transform: 'translateY(-1px)' }
                  : undefined,
              })}
            >
              <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box
                    sx={(theme) => ({
                      width: 38,
                      height: 38,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 1.25,
                      color: `${tone}.main`,
                      bgcolor: alpha(theme.palette[tone].main, 0.09),
                      '& .MuiSvgIcon-root': { fontSize: 21 },
                    })}
                  >
                    {icon}
                  </Box>
                  <Box>
                    <Typography color="text.secondary" sx={{ fontSize: '0.72rem', fontWeight: 850 }}>
                      {t(`taskTracking.review.summary.${key}`)}
                    </Typography>
                    <Typography sx={{ mt: 0.2, fontSize: '1.35rem', lineHeight: 1, fontWeight: 950 }}>
                      {number(values[key])}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
        {REVIEW_ISSUE_TYPES.map((type) => {
          const count = Number(summary?.openIssuesByType?.[type] || 0);
          if (count === 0) return null;
          return (
            <Chip
              key={type}
              clickable
              color={ISSUE_TYPE_COLORS[type]}
              variant="outlined"
              label={`${t(`taskTracking.review.issueTypes.${type}`)} · ${number(count)}`}
              onClick={() => onFilterType(type)}
              sx={{ bgcolor: 'background.paper', fontWeight: 800 }}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}

export default ReviewSummaryCards;
