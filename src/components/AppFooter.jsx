import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

const AppFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <Box
      sx={(theme) => ({
        px: 2,
        py: 1.5,
        textAlign: 'center',
        bgcolor: alpha(theme.palette.common.white, 0.82),
        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.09)}`,
        backdropFilter: 'blur(12px)',
      })}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        © {currentYear} Orvix ERP · Inventory Management · Pinetechs
      </Typography>
    </Box>
  );
};

export default AppFooter;
