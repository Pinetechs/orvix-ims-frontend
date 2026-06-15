import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { useAuth } from '../../hooks/useAuth.js';

function PermissionGuard({ permission, children, message = 'You do not have permission to view this page.' }) {
  const auth = useAuth();

  if (!auth.hasPermission(permission)) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
        <Typography color="text.secondary">
          Please contact your system administrator.
        </Typography>
      </Box>
    );
  }

  return children;
}

export default PermissionGuard;