import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import { useTranslation } from 'react-i18next';

import { REVIEW_REASON_CODES } from '../utils/reviewFormatters.js';

function ReviewDecisionDialog({
  open,
  title,
  subtitle,
  decisions,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const { t } = useTranslation();
  const [decision, setDecision] = useState('');
  const [reasonCode, setReasonCode] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setDecision('');
    setReasonCode('');
    setNote('');
  }, [open, title]);

  const normalizedNote = note.trim();
  const noteRequired = reasonCode === 'OTHER' || decision === 'REQUEST_ANOTHER_RECHECK';
  const valid = Boolean(decision && reasonCode && (!noteRequired || normalizedNote));

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 1.5, overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ p: 2.4, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1.1} alignItems="center">
          <GavelRoundedIcon color="primary" />
          <BoxTitle title={title} subtitle={subtitle} />
          <IconButton size="small" onClick={onClose} disabled={loading}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            select
            required
            label={t('taskTracking.review.decision.decision')}
            value={decision}
            onChange={(event) => setDecision(event.target.value)}
            disabled={loading}
          >
            {decisions.map((value) => (
              <MenuItem value={value} key={value}>
                {t(`taskTracking.review.decisions.${value}`)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            required
            label={t('taskTracking.review.decision.reason')}
            value={reasonCode}
            onChange={(event) => setReasonCode(event.target.value)}
            disabled={loading}
          >
            {REVIEW_REASON_CODES.map((value) => (
              <MenuItem value={value} key={value}>
                {t(`taskTracking.review.reasons.${value}`)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            multiline
            minRows={3}
            required={noteRequired}
            label={t('taskTracking.review.decision.note')}
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, 1000))}
            disabled={loading}
            helperText={t('taskTracking.review.decision.noteHelp', { count: note.length })}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.4, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} disabled={loading}>
          {t('taskTracking.common.back')}
        </Button>
        <Button
          variant="contained"
          disabled={loading || !valid}
          onClick={() => onSubmit({
            decision,
            reasonCode,
            note: normalizedNote || null,
          })}
        >
          {loading && <CircularProgress size={17} color="inherit" sx={{ me: 0.8 }} />}
          {t('taskTracking.review.decision.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function BoxTitle({ title, subtitle }) {
  return (
    <Stack sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="h6" sx={{ fontWeight: 950 }}>{title}</Typography>
      {subtitle && <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>{subtitle}</Typography>}
    </Stack>
  );
}

export default ReviewDecisionDialog;
