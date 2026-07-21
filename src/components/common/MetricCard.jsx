import React from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

function MetricCard({ title, value, hint, icon, color = 'primary.main', accentColor }) {
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box
        sx={(theme) => ({
          position: 'absolute',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: accentColor || color,
          boxShadow: `0 0 22px ${alpha(accentColor || theme.palette.primary.main, 0.22)}`,
        })}
      />
      <CardContent sx={{ p: 2.4, '&:last-child': { pb: 2.4 } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 850, mb: 0.8 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 950, lineHeight: 1, letterSpacing: -0.6 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={(theme) => ({
              width: 45,
              height: 45,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 3,
              color,
              bgcolor: alpha(accentColor || theme.palette.primary.main, 0.09),
              border: `1px solid ${alpha(accentColor || theme.palette.primary.main, 0.13)}`,
              '& svg': { fontSize: 25 },
            })}
          >
            {icon}
          </Box>
        </Stack>
        {hint && (
          <Typography color="text.secondary" sx={{ mt: 1.15, fontSize: '0.77rem', lineHeight: 1.45 }}>
            {hint}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default MetricCard;
