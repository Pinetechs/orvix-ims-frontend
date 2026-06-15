import React from 'react';
import { Alert, AlertTitle, Snackbar } from '@mui/material';
import { useToast } from '../../hooks/useToast.js';

const ToastOutlet = () => {
  const { toast, hideToast } = useToast();

  return (
    <Snackbar
      open={toast.open}
      autoHideDuration={5000}
      onClose={hideToast}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert variant="filled" sx={{ width: { xs: '90vw', sm: 600 } }} severity={toast.severity} onClose={hideToast}>
        <AlertTitle>{toast.severity === 'success' ? 'Success' : 'Error'}</AlertTitle>
        {toast.message}
      </Alert>
    </Snackbar>
  );
};

export default ToastOutlet;
