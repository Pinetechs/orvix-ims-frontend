import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { getTaskName, getTaskNumber } from '../utils/inventoryTaskMappers.js';

const PROGRESS_OPTIONS = [
  {
    value: 'BASIC',
    label: 'Basic indicators',
    description: 'Gray: not started. Blue: contains scans.',
  },
  {
    value: 'DETAILED',
    label: 'Detailed indicators',
    description: 'Also show green for employee-completed locations and orange for open review items.',
  },
];

function InventoryTaskScanSettingsDialog({ open, task, loading, error, onClose, onSubmit }) {
  const [scanImageRequired, setScanImageRequired] = useState(true);
  const [progressMode, setProgressMode] = useState('BASIC');
  const sparePart = task?.inventoryDomain === 'SPARE_PART';

  useEffect(() => {
    if (!open) return;
    setScanImageRequired(task?.scanImageRequired !== false);
    setProgressMode(task?.sparePartLocationProgressMode || 'BASIC');
  }, [open, task?.id, task?.scanImageRequired, task?.sparePartLocationProgressMode]);

  const handleSubmit = () => {
    onSubmit?.({
      scanImageRequired,
      ...(sparePart ? { sparePartLocationProgressMode: progressMode } : {}),
    });
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Scan settings</DialogTitle>
      <DialogContent>
        <Stack spacing={2.2} sx={{ mt: 0.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 900 }}>{getTaskName(task)}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
              {getTaskNumber(task)} · {task?.inventoryDomain || '-'}
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Card variant="outlined" sx={{ borderRadius: 2.5, p: 1.5 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={scanImageRequired}
                  onChange={(event) => setScanImageRequired(event.target.checked)}
                  disabled={loading}
                />
              }
              label={
                <Box>
                  <Typography sx={{ fontWeight: 900 }}>Require barcode evidence image</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
                    Every new scan or correction must include an image captured by the UROVO scanner.
                  </Typography>
                </Box>
              }
            />
          </Card>

          {sparePart && (
            <FormControl component="fieldset">
              <Typography sx={{ fontWeight: 950, mb: 1 }}>Location progress indicators</Typography>
              <RadioGroup value={progressMode} onChange={(event) => setProgressMode(event.target.value)}>
                {PROGRESS_OPTIONS.map((option) => (
                  <Card
                    key={option.value}
                    variant="outlined"
                    sx={(theme) => ({
                      borderRadius: 2.5,
                      mb: 1,
                      borderColor: progressMode === option.value ? theme.palette.primary.main : theme.palette.divider,
                      bgcolor: progressMode === option.value
                        ? alpha(theme.palette.primary.main, 0.045)
                        : theme.palette.background.paper,
                    })}
                  >
                    <FormControlLabel
                      value={option.value}
                      control={<Radio />}
                      disabled={loading}
                      label={
                        <Box sx={{ py: 1 }}>
                          <Typography sx={{ fontWeight: 900 }}>{option.label}</Typography>
                          <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
                            {option.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0, px: 1.5 }}
                    />
                  </Card>
                ))}
              </RadioGroup>
            </FormControl>
          )}

          <Alert severity="info">
            Changes affect future scan requests immediately. Existing scan records and images are not changed.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Save settings'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InventoryTaskScanSettingsDialog;
