import React from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

import { getTaskName, getTaskNumber } from '../utils/inventoryTaskMappers.js';

function InventoryTaskDeleteDialog({ open, task, loading, error, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Delete test or incorrect task?</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Typography sx={{ fontWeight: 900 }}>
            {getTaskName(task)} · {getTaskNumber(task)}
          </Typography>
          <Alert severity="error">
            This permanently removes the task, imported records, assignments and {Number(task?.scanCount || 0)} scan events.
            Attached scan images will be queued for cleanup. This action cannot be undone.
          </Alert>
          <Typography color="text.secondary" sx={{ fontSize: '0.88rem' }}>
            Full deletion is available only while the task has fewer than 10 scans. At 10 scans or more, cancellation with a reason is required instead.
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>Keep task</Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete permanently'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InventoryTaskDeleteDialog;
