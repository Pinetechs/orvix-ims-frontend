import React from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';

export function TrackingLoading({ minHeight = 280 }) {
  const { t } = useTranslation();
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1.4}
      sx={(theme) => ({ minHeight, borderRadius: 1.5, bgcolor: alpha(theme.palette.common.white, 0.72), border: `1px solid ${theme.palette.divider}` })}
    >
      <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 1.5, bgcolor: 'rgba(0,81,210,.05)' }}>
        <CircularProgress size={30} thickness={4.5} />
      </Box>
      <Typography color="text.secondary" sx={{ fontWeight: 750, fontSize: '0.86rem' }}>{t('taskTracking.common.loading')}</Typography>
    </Stack>
  );
}

export function TrackingError({ error, onRetry }) {
  const { t } = useTranslation();
  return (
    <Alert
      severity="error"
      variant="outlined"
      action={onRetry ? (
        <Button color="inherit" size="small" startIcon={<RefreshRoundedIcon />} onClick={onRetry}>
          {t('taskTracking.common.retry')}
        </Button>
      ) : null}
    >
      {error?.message || t('taskTracking.common.loadError')}
    </Alert>
  );
}

export function TrackingEmpty({ title, text }) {
  const { t } = useTranslation();
  return (
    <Box sx={{ py: { xs: 6, md: 8 }, px: 2, textAlign: 'center' }}>
      <Box sx={{ width: 64, height: 64, borderRadius: '50%', display: 'grid', placeItems: 'center', mx: 'auto', bgcolor: 'rgba(0,81,210,.055)' }}>
        <InboxOutlinedIcon sx={{ fontSize: 34, color: 'primary.light' }} />
      </Box>
      <Typography sx={{ mt: 1, fontWeight: 950 }}>{title || t('taskTracking.common.empty')}</Typography>
      {text && <Typography color="text.secondary" sx={{ mt: 0.4 }}>{text}</Typography>}
    </Box>
  );
}
