import React from 'react';
import { Box, Typography } from '@mui/material';

const AppFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <Box sx={{ px: 2, py: 1.5, textAlign: 'center', bgcolor: '#fff', borderTop: '1px solid #edf0f2' }}>
      <Typography variant="caption" color="text.secondary">
        © {currentYear} Orvix IMS · Pinetechs
      </Typography>
    </Box>
  );
};

export default AppFooter;
