import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NoMatch = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <Typography variant="h3" fontWeight={900}>404</Typography>
      <Typography variant="h6">Page not found</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>Back to dashboard</Button>
    </Box>
  );
};

export default NoMatch;
