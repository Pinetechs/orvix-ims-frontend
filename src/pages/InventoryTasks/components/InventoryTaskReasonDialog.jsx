import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { getTaskName, getTaskNumber } from '../utils/inventoryTaskMappers.js';

function InventoryTaskReasonDialog({ open, task, action, loading, error, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const isCancel = action === 'cancel';

  useEffect(() => {
    if (open) setReason('');
  }, [open, task?.id, action]);

  const normalizedReason = reason.trim();

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isCancel ? 'Cancel inventory task' : 'Pause inventory task'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Typography sx={{ fontWeight: 900 }}>
            {getTaskName(task)} · {getTaskNumber(task)}
          </Typography>

          <Alert severity={isCancel ? 'warning' : 'info'}>
            {isCancel
              ? `The task and its ${Number(task?.scanCount || 0)} scan events will remain available as a read-only cancelled record.`
              : 'Scanning stops while the task is paused. Assignments can still be adjusted before resuming.'}
          </Alert>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            autoFocus
            required
            multiline
            minRows={3}
            label={isCancel ? 'Cancellation reason' : 'Pause reason'}
            value={reason}
            onChange={(event) => setReason(event.target.value.slice(0, 500))}
            disabled={loading}
            helperText={`${reason.length}/500 · Required for audit history`}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>Back</Button>
        <Button
          variant="contained"
          color={isCancel ? 'warning' : 'primary'}
          disabled={loading || !normalizedReason}
          onClick={() => onConfirm?.(normalizedReason)}
        >
          {loading ? 'Saving...' : isCancel ? 'Cancel task' : 'Pause task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InventoryTaskReasonDialog;
