import React from 'react';
import { Alert, Box, FormHelperText, Stack } from '@mui/material';

import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';

import { useInventoryTypeStep } from '../../../hooks/create-task/common/useInventoryTypeStep.js';
import {
  InventoryDomainCard,
  StepHeader,
  inventoryDomainCards,
} from '../../CreateInventoryTaskDialogParts.jsx';

function InventoryTypeStep({ wizard }) {
  const { formik, locked, createMutation, handleDomainSelect } = useInventoryTypeStep({ wizard });

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
            disabled={locked || createMutation.isPending}
            onSelect={handleDomainSelect}
          />
        ))}
      </Box>

      {formik.touched.inventoryDomain && formik.errors.inventoryDomain && (
        <FormHelperText error>{formik.errors.inventoryDomain}</FormHelperText>
      )}

      <Alert severity={locked ? 'info' : 'warning'}>
        {locked
          ? 'Inventory type is locked because the draft task has already been created.'
          : 'Click Next to create the task as Draft. After that, closing the dialog will keep the task visible in the list.'}
      </Alert>
    </Stack>
  );
}

export default InventoryTypeStep;
