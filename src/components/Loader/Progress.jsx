import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

export default function Progress({ msg = 'Loading...', color = 'primary' }) {
  const theme = useTheme();
  
  // دعم الألوان المخصصة (colorA, colorB, colorC, colorD)
  const getColorValue = (colorName) => {
    if (theme.palette[colorName]) {
      return theme.palette[colorName].main;
    }
    return theme.palette[colorName];
  };

  const colorValue = getColorValue(color);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <CircularProgress sx={{ color: colorValue }} />
      <Typography sx={{ color: colorValue }} variant="caption">{msg}</Typography>
    </Box>
  );
}
