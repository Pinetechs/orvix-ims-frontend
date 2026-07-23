import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import { useTranslation } from 'react-i18next';

import { useRecheckEvidenceQuery } from '../hooks/useReviewCenterQueries.js';

function RecheckEvidenceDialog({ open, taskId, requestId, itemId, onClose }) {
  const { t } = useTranslation();
  const query = useRecheckEvidenceQuery(taskId, requestId, itemId, open);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!open || !query.data) {
      setImageUrl(null);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(query.data);
    setImageUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [open, query.data]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <PhotoOutlinedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 950 }}>{t('taskTracking.review.evidence.title')}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ minHeight: 320, display: 'grid', placeItems: 'center', bgcolor: '#F3F5F8' }}>
        {query.isLoading && <CircularProgress />}
        {query.isError && <Alert severity="error" sx={{ width: '100%' }}>{query.error?.message}</Alert>}
        {imageUrl && (
          <Box
            component="img"
            src={imageUrl}
            alt={t('taskTracking.review.evidence.alt')}
            sx={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 1 }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>{t('taskTracking.common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RecheckEvidenceDialog;
