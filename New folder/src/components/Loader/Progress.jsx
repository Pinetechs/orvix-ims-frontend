import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function Progress({ msg = 'Loading...' }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <CircularProgress color="primary" />
      <Typography color="primary" variant="caption">{msg}</Typography>
    </Box>
  );
}
