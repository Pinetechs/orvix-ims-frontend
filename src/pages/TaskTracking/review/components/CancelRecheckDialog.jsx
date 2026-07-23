import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

function CancelRecheckDialog({ open, request, loading, error, onClose, onSubmit }) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open, request?.id]);

  const normalizedReason = reason.trim();

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 950 }}>
          {t('taskTracking.review.cancel.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.78rem' }}>{request?.requestNumber}</Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning" variant="outlined">{t('taskTracking.review.cancel.message')}</Alert>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            autoFocus
            required
            multiline
            minRows={3}
            label={t('taskTracking.review.cancel.reason')}
            value={reason}
            onChange={(event) => setReason(event.target.value.slice(0, 500))}
            disabled={loading}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.4 }}>
        <Button onClick={onClose} disabled={loading}>{t('taskTracking.common.back')}</Button>
        <Button
          color="warning"
          variant="contained"
          disabled={loading || !normalizedReason}
          onClick={() => onSubmit(normalizedReason)}
        >
          {loading && <CircularProgress size={17} color="inherit" sx={{ me: 0.8 }} />}
          {t('taskTracking.review.cancel.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CancelRecheckDialog;
