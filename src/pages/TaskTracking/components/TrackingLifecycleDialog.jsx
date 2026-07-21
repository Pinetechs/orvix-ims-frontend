import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const REASON_ACTIONS = new Set(['pause', 'returnToProgress', 'cancel']);

function TrackingLifecycleDialog({ open, action, overview, loading, error, onClose, onConfirm }) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const requiresReason = REASON_ACTIONS.has(action);

  useEffect(() => {
    if (open) setReason('');
  }, [open, action]);

  const normalizedReason = reason.trim();

  if (!action) return null;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 1.5, overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ p: 2.5, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box sx={(theme) => ({ width: 36, height: 36, borderRadius: 1.25, display: 'grid', placeItems: 'center', color: action === 'cancel' ? 'error.main' : action === 'complete' ? 'success.main' : 'primary.main', bgcolor: alpha(action === 'cancel' ? theme.palette.error.main : action === 'complete' ? theme.palette.success.main : theme.palette.primary.main, .07), '& .MuiSvgIcon-root': { fontSize: 20 } })}>
            <BoltRoundedIcon />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 950 }}>{t(`taskTracking.actions.dialog.${action}.title`)}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.15 }}>{overview?.taskNumber}</Typography>
          </Box>
          <IconButton size="small" onClick={onClose} disabled={loading}><CloseRoundedIcon /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Box sx={{ p: 1.5, borderRadius: 1.25, bgcolor: '#FAFBFD', border: 1, borderColor: 'divider' }}>
            <Typography sx={{ fontWeight: 950 }}>{overview?.taskName || overview?.taskNumber}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.78rem', mt: 0.2 }}>{overview?.company?.name || '-'}</Typography>
          </Box>
          <Alert variant="outlined" severity={action === 'cancel' ? 'warning' : action === 'complete' ? 'success' : 'info'}>
            {t(`taskTracking.actions.dialog.${action}.message`)}
          </Alert>
          {error && <Alert severity="error">{error}</Alert>}
          {requiresReason && (
            <TextField
              autoFocus
              required
              multiline
              minRows={3}
              label={t('taskTracking.actions.reason')}
              value={reason}
              onChange={(event) => setReason(event.target.value.slice(0, 500))}
              disabled={loading}
              helperText={t('taskTracking.actions.reasonHelp', { count: reason.length })}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'rgba(248,250,255,.7)' }}>
        <Button onClick={onClose} disabled={loading}>{t('taskTracking.common.back')}</Button>
        <Button
          variant="contained"
          color={action === 'cancel' ? 'warning' : action === 'complete' ? 'success' : 'primary'}
          disabled={loading || (requiresReason && !normalizedReason)}
          onClick={() => onConfirm?.(requiresReason ? normalizedReason : undefined)}
        >
          {loading && <CircularProgress size={17} color="inherit" sx={{ me: 0.8 }} />}
          {loading ? t('taskTracking.common.saving') : t(`taskTracking.actions.${action}`)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TrackingLifecycleDialog;
