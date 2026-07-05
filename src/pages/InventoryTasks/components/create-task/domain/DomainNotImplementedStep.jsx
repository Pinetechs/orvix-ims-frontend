import React from 'react';
import { Alert, Stack } from '@mui/material';

import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';

import { useDomainNotImplementedStep } from '../../../hooks/create-task/domain/useDomainNotImplementedStep.js';
import { StepHeader } from '../../CreateInventoryTaskDialogParts.jsx';

function DomainNotImplementedStep({ wizard }) {
  useDomainNotImplementedStep({ wizard });

  return (
    <Stack spacing={2.2}>
      <StepHeader
        icon={<ConstructionRoundedIcon />}
        title={`${wizard.inventoryDomain || 'Selected domain'} workflow`}
        description="The common task steps are ready. The domain-specific workflow is intentionally isolated here for future expansion."
      />

      <Alert severity="info">
        The task draft has been created successfully, but the full import/review/assignment workflow for this inventory domain is not implemented yet.
      </Alert>

      <Alert severity="success">
        You can safely save this task as Draft and continue after the domain-specific steps are implemented.
      </Alert>
    </Stack>
  );
}

export default DomainNotImplementedStep;
