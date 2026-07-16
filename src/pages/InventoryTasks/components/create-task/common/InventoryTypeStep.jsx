import React from 'react';
import {
  Alert,
  Box,
  Card,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';

import { useInventoryTypeStep } from '../../../hooks/create-task/common/useInventoryTypeStep.js';
import {
  InventoryDomainCard,
  StepHeader,
  inventoryDomainCards,
} from '../../CreateInventoryTaskDialogParts.jsx';

function InventoryTypeStep({ wizard }) {
  const { formik, locked, createMutation, updateSettingsMutation, handleDomainSelect } = useInventoryTypeStep({ wizard });
  const busy = createMutation.isPending || updateSettingsMutation.isPending;

  return (
    <Stack spacing={2.2}>
      <StepHeader
        icon={<FactCheckRoundedIcon />}
        title="Choose inventory type"
        description="The selected type controls the next steps. Vehicle and asset inventory support Excel upload in this wizard."
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {inventoryDomainCards.map((option) => (
          <InventoryDomainCard
            key={option.value}
            option={option}
            selected={formik.values.inventoryDomain === option.value}
            disabled={locked || busy}
            onSelect={handleDomainSelect}
          />
        ))}
      </Box>

      {formik.touched.inventoryDomain && formik.errors.inventoryDomain && (
        <FormHelperText error>{formik.errors.inventoryDomain}</FormHelperText>
      )}

      <Card variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
        <Stack spacing={1.4}>
          <FormControlLabel
            control={
              <Switch
                checked={formik.values.scanImageRequired}
                onChange={(event) => formik.setFieldValue('scanImageRequired', event.target.checked)}
                disabled={busy}
              />
            }
            label={
              <Box>
                <Typography sx={{ fontWeight: 900 }}>Require barcode evidence image</Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
                  The Android app must attach a scanner image with every scan operation.
                </Typography>
              </Box>
            }
          />
        </Stack>
      </Card>

      {formik.values.inventoryDomain === 'SPARE_PART' && (
        <FormControl component="fieldset">
          <Typography sx={{ fontWeight: 950, mb: 1 }}>Location progress indicators</Typography>
          <RadioGroup
            value={formik.values.sparePartLocationProgressMode}
            onChange={(event) => formik.setFieldValue('sparePartLocationProgressMode', event.target.value)}
          >
            {[
              {
                value: 'BASIC',
                label: 'Basic',
                description: 'Show only Not started (gray) and Has scans (blue).',
              },
              {
                value: 'DETAILED',
                label: 'Detailed',
                description: 'Also show Completed (green) and Needs review (orange).',
              },
            ].map((option) => (
              <Card
                key={option.value}
                variant="outlined"
                sx={(theme) => ({
                  borderRadius: 2.5,
                  mb: 1,
                  borderColor:
                    formik.values.sparePartLocationProgressMode === option.value
                      ? theme.palette.primary.main
                      : alpha(theme.palette.divider, 0.75),
                  bgcolor:
                    formik.values.sparePartLocationProgressMode === option.value
                      ? alpha(theme.palette.primary.main, 0.045)
                      : theme.palette.background.paper,
                })}
              >
                <FormControlLabel
                  value={option.value}
                  control={<Radio />}
                  disabled={busy}
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

      <Alert severity={locked ? 'info' : 'warning'}>
        {locked
          ? 'Inventory type and company are locked, but scan settings can still be updated while the task is open.'
          : 'Click Next to create the task as Draft. After that, closing the dialog will keep the task visible in the list.'}
      </Alert>
    </Stack>
  );
}

export default InventoryTypeStep;
