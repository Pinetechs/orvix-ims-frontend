import React from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

function MetricCard({ icon, label, value }) {
  return (
    <Card
      elevation={0}
      sx={(theme) => ({
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(
          theme.palette.common.white,
          0.92
        )})`,
      })}
    >
      <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={(theme) => ({
              width: 42,
              height: 42,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 3,
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            })}
          >
            {icon}
          </Box>

          <Box>
            <Typography color="text.secondary" sx={{ fontSize: '0.82rem', fontWeight: 700 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: '1.45rem', fontWeight: 950, lineHeight: 1.1 }}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default MetricCard;