import React from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

const metricItems = [
  {
    key: 'total',
    label: 'Total Tasks',
    icon: <AssignmentTurnedInRoundedIcon />,
  },
  {
    key: 'draft',
    label: 'Draft',
    icon: <PendingActionsRoundedIcon />,
  },
  {
    key: 'inProgress',
    label: 'In Progress',
    icon: <PlayCircleOutlineRoundedIcon />,
  },
  {
    key: 'mismatch',
    label: 'Mismatches',
    icon: <ErrorOutlineRoundedIcon />,
  },
];

function InventoryTaskMetrics({ rows = [] }) {
  const metrics = rows.reduce(
    (acc, row) => ({
      total: acc.total + 1,
      draft: acc.draft + (row.status === 'DRAFT' ? 1 : 0),
      inProgress: acc.inProgress + (row.status === 'IN_PROGRESS' ? 1 : 0),
      mismatch: acc.mismatch + Number(row.mismatchRecords || 0),
    }),
    { total: 0, draft: 0, inProgress: 0, mismatch: 0 },
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 1.5,
        mb: 2,
      }}
    >
      {metricItems.map((item) => (
        <Card
          key={item.key}
          elevation={0}
          sx={(theme) => ({
            p: 2,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: `0 16px 36px ${alpha(theme.palette.common.black, 0.05)}`,
          })}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography color="text.secondary" sx={{ fontSize: '0.82rem', fontWeight: 750 }}>
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: '1.7rem', fontWeight: 950, lineHeight: 1.1 }}>
                {metrics[item.key]}
              </Typography>
            </Box>

            <Box
              sx={(theme) => ({
                width: 42,
                height: 42,
                borderRadius: 2.4,
                display: 'grid',
                placeItems: 'center',
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.09),
              })}
            >
              {item.icon}
            </Box>
          </Stack>
        </Card>
      ))}
    </Box>
  );
}

export default InventoryTaskMetrics;
