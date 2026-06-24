import React from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

function MetricCard({ icon, label, value }) {
  return (
    <Card
      elevation={0}
      sx={(theme) => ({
        borderRadius: { xs: 3, sm: 4 },
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(
          theme.palette.common.white,
          0.92
        )})`,
        minWidth: 0,
      })}
    >
      <CardContent sx={{ p: { xs: 1.6, sm: 2.2 }, '&:last-child': { pb: { xs: 1.6, sm: 2.2 } } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={(theme) => ({
              width: { xs: 38, sm: 42 },
              height: { xs: 38, sm: 42 },
              flex: '0 0 auto',
              display: 'grid',
              placeItems: 'center',
              borderRadius: { xs: 2.5, sm: 3 },
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            })}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" sx={{ fontSize: { xs: '0.76rem', sm: '0.82rem' }, fontWeight: 700 }} noWrap>
              {label}
            </Typography>
            <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.45rem' }, fontWeight: 950, lineHeight: 1.1 }}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default MetricCard;
