import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useTranslation } from 'react-i18next';

import { getTrackingScanImage } from '../../../services/taskTrackingService.js';

function ScanImageDialog({ open, taskId, scanId, onClose }) {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !taskId || !scanId) return undefined;
    let active = true;
    let objectUrl;
    setLoading(true);
    setError(null);
    setImageUrl(null);

    getTrackingScanImage({ taskId, scanId })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      })
      .catch((loadError) => {
        if (active) setError(loadError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, scanId, taskId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 1.5, overflow: 'hidden' } }}>
      <DialogTitle sx={{ p: 2.3, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1.1} alignItems="center">
          <Box sx={{ width: 36, height: 36, borderRadius: 1.25, display: 'grid', placeItems: 'center', color: 'primary.main', bgcolor: 'rgba(0,81,210,.07)' }}><PhotoOutlinedIcon sx={{ fontSize: 20 }} /></Box>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 950 }}>{t('taskTracking.image.title')}</Typography>
          <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ minHeight: 320, display: 'grid', placeItems: 'center', p: { xs: 1.5, md: 2.5 }, bgcolor: '#F3F5F8' }}>
        {loading && (
          <Stack spacing={1.2} alignItems="center">
            <CircularProgress size={34} />
            <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>{t('taskTracking.common.loading')}</Typography>
          </Stack>
        )}
        {error && <Alert severity="error" sx={{ width: '100%' }}>{error.message}</Alert>}
        {imageUrl && (
          <Box
            component="img"
            src={imageUrl}
            alt={t('taskTracking.image.alt')}
            sx={{ display: 'block', maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 1, boxShadow: '0 8px 24px rgba(1,23,54,.12)', bgcolor: 'common.white' }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>{t('taskTracking.common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ScanImageDialog;
