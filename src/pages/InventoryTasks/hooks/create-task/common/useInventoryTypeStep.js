import React, { useEffect } from 'react';
import { useFormik } from 'formik';

import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { queryClient } from '../../../../../services/queryClient.js';
import { queryKeys } from '../../../../../services/queryKeys.js';
import { useCreateInventoryTaskMutation } from '../../useCreateInventoryTaskMutation.js';
import { buildCreatePayload } from '../../../utils/createInventoryTaskDialogUtils.js';
import { unwrapResponseData } from '../../../utils/inventoryTaskMappers.js';
import { inventoryTypeSchema } from '../../../forms/create-task/inventoryTypeForm.js';

export function useInventoryTypeStep({ wizard }) {
  const locked = Boolean(wizard.createdTask);

  const createMutation = useCreateInventoryTaskMutation({
    onSuccess: async (response) => {
      const task = unwrapResponseData(response);
      wizard.setCreatedTask(task);
      await queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.all });
    },
  });

  const formik = useFormik({
    initialValues: {
      inventoryDomain: wizard.inventoryDomain || 'VEHICLE',
    },
    validationSchema: inventoryTypeSchema,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: async (values) => {
      wizard.clearError();
      wizard.setInventoryDomain(values.inventoryDomain);

      if (!wizard.createdTask) {
        try {
          const response = await createMutation.mutateAsync(
            buildCreatePayload({ ...wizard.taskInformation, inventoryDomain: values.inventoryDomain }),
          );
          wizard.setCreatedTask(unwrapResponseData(response));
        } catch (error) {
          wizard.setLocalError(error.message || 'Could not create inventory task draft.');
          return;
        }
      }

      wizard.goNext();
    },
  });

  const handleDomainSelect = (value) => {
    if (locked || createMutation.isPending) return;
    formik.setFieldValue('inventoryDomain', value);
    formik.setFieldTouched('inventoryDomain', true, false);
    wizard.setInventoryDomain(value);
  };

  useEffect(() => {
    wizard.setStepConfig({
      subtitle: 'The selected type controls the next steps and their internal business logic.',
      canClose: !createMutation.isPending,
      closeBlocked: createMutation.isPending,
      closeConfirmMessage: null,
      nextLabel: locked ? 'Continue' : 'Create Draft & Next',
      nextDisabled: createMutation.isPending || !formik.values.inventoryDomain,
      nextLoading: createMutation.isPending,
      nextLoadingLabel: 'Creating draft...',
      onNext: formik.submitForm,
      nextStartIcon: locked ? null : React.createElement(SaveRoundedIcon),
      nextEndIcon: locked ? React.createElement(KeyboardArrowRightRoundedIcon) : null,
    });

    return wizard.resetStepControls;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createMutation.isPending, formik.values.inventoryDomain, locked]);

  return {
    formik,
    locked,
    createMutation,
    handleDomainSelect,
  };
}
