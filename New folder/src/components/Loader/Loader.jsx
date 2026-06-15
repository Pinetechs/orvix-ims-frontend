import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const Loader = () => (
  <Box
    sx={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.45)',
      zIndex: 9999,
    }}
  >
    <CircularProgress size={72} color="primary" />
  </Box>
);

export default Loader;
