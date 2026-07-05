import React from 'react';
import { Alert, Stack } from '@mui/material';

import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';

import FormikAsyncAutocomplete from '../../../../../components/form/FormikAsyncAutocomplete.jsx';
import FormikTextField from '../../../../../components/form/FormikTextField.jsx';
import { getLookupCompanies } from '../../../../../services/lookupsServices.js';
import { queryKeys } from '../../../../../services/queryKeys.js';
import { useTaskInformationStep } from '../../../hooks/create-task/common/useTaskInformationStep.js';
import { COMPANY_LOOKUP_PARAMS } from '../../../utils/createInventoryTaskDialogUtils.js';
import { StepHeader } from '../../CreateInventoryTaskDialogParts.jsx';

function TaskInformationStep({ wizard }) {
  const { formik, locked } = useTaskInformationStep({ wizard });

  return (
    <Stack spacing={2.2}>
      <StepHeader
        icon={<ApartmentRoundedIcon />}
        title="Task information"
        description="Add the visible task name, description and company before choosing the inventory type."
      />

      <FormikTextField
        formik={formik}
        name="taskName"
        label="Task Name"
        disabled={locked}
        required
        helperText="Example: June vehicle inventory - Main warehouse"
      />

      <FormikTextField
        formik={formik}
        name="description"
        label="Description"
        disabled={locked}
        multiline
        minRows={3}
        helperText="Optional notes for supervisors and inventory staff."
      />

      <FormikAsyncAutocomplete
        formik={formik}
        name="company"
        label="Company"
        queryKey={queryKeys.lookups.companies(COMPANY_LOOKUP_PARAMS)}
        queryFn={getLookupCompanies}
        disabled={locked}
        extraParams={COMPANY_LOOKUP_PARAMS}
        lookup
        helperText="Select the company that owns this inventory task."
      />

      {locked && (
        <Alert severity="info">
          This draft has already been created. Basic information is locked in this wizard.
        </Alert>
      )}
    </Stack>
  );
}

export default TaskInformationStep;
