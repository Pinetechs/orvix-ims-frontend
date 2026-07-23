import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import { useTranslation } from 'react-i18next';

import { useDebouncedValue } from '../../../../hooks/useDebouncedValue.js';
import { useEligibleRecheckStaffQuery } from '../hooks/useReviewCenterQueries.js';
import { pageRows, reviewUserName } from '../utils/reviewFormatters.js';

const toLocalDateTimeInput = (date) => {
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return localTime.toISOString().slice(0, 16);
};

function CreateRecheckDialog({
  open,
  taskId,
  issues,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const { t } = useTranslation();
  const [staff, setStaff] = useState(null);
  const [staffSearch, setStaffSearch] = useState('');
  const [instructions, setInstructions] = useState('');
  const [imageRequired, setImageRequired] = useState(false);
  const [dueAt, setDueAt] = useState('');
  const debouncedStaffSearch = useDebouncedValue(staffSearch.trim(), 300);
  const staffQuery = useEligibleRecheckStaffQuery(taskId, debouncedStaffSearch, open);
  const staffOptions = pageRows(staffQuery.data);
  const workArea = issues[0]?.workAreaLabel || '-';
  const issueIds = useMemo(() => issues.map(({ id }) => id), [issues]);
  const dueAtValid = !dueAt || new Date(dueAt).getTime() > Date.now();

  useEffect(() => {
    if (!open) return;
    setStaff(null);
    setStaffSearch('');
    setInstructions('');
    setImageRequired(false);
    setDueAt('');
  }, [open]);

  const valid = Boolean(staff?.id && issueIds.length > 0 && dueAtValid);

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
          <AssignmentIndOutlinedIcon color="primary" />
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 950 }}>{t('taskTracking.review.create.title')}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {t('taskTracking.review.create.selection', { count: issues.length, area: workArea })}
            </Typography>
          </Stack>
          <IconButton size="small" onClick={onClose} disabled={loading}><CloseRoundedIcon /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {staffQuery.isError && <Alert severity="error">{staffQuery.error?.message}</Alert>}
          <Autocomplete
            options={staffOptions}
            value={staff}
            onChange={(_event, value) => {
              setStaff(value);
              setStaffSearch(value ? reviewUserName(value) : '');
            }}
            inputValue={staffSearch}
            onInputChange={(_event, value, reason) => {
              if (reason === 'input' || reason === 'clear') setStaffSearch(value);
            }}
            getOptionLabel={(option) => reviewUserName(option)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={staffQuery.isLoading}
            disabled={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label={t('taskTracking.review.create.assignedTo')}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {staffQuery.isLoading ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <TextField
            multiline
            minRows={3}
            label={t('taskTracking.review.create.instructions')}
            value={instructions}
            onChange={(event) => setInstructions(event.target.value.slice(0, 1500))}
            disabled={loading}
            helperText={t('taskTracking.review.create.instructionsHelp', { count: instructions.length })}
          />
          <TextField
            type="datetime-local"
            label={t('taskTracking.review.create.dueAt')}
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: toLocalDateTimeInput(new Date(Date.now() + 60 * 1000)) }}
            error={!dueAtValid}
            helperText={!dueAtValid ? t('taskTracking.review.create.dueAtFuture') : ' '}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={imageRequired}
                onChange={(event) => setImageRequired(event.target.checked)}
                disabled={loading}
              />
            }
            label={t('taskTracking.review.create.imageRequired')}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.4, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} disabled={loading}>{t('taskTracking.common.back')}</Button>
        <Button
          variant="contained"
          disabled={loading || !valid}
          onClick={() => onSubmit({
            assignedUserId: staff.id,
            issueIds,
            instructions: instructions.trim() || null,
            imageRequired,
            dueAt: dueAt || null,
          })}
        >
          {loading && <CircularProgress size={17} color="inherit" sx={{ me: 0.8 }} />}
          {t('taskTracking.review.create.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateRecheckDialog;
