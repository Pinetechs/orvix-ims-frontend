import React, { useEffect } from 'react';
import { useFormik } from 'formik';

import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { queryClient } from '../../../../../services/queryClient.js';
import { queryKeys } from '../../../../../services/queryKeys.js';
import { useCreateInventoryTaskMutation } from '../../useCreateInventoryTaskMutation.js';
import { useUpdateInventoryTaskScanSettingsMutation } from '../../useInventoryTaskManagementMutations.js';
import {
  buildCreatePayload,
  buildScanSettingsPayload,
} from '../../../utils/createInventoryTaskDialogUtils.js';
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
  const updateSettingsMutation = useUpdateInventoryTaskScanSettingsMutation({
    onSuccess: (response) => {
      wizard.setCreatedTask(unwrapResponseData(response));
    },
  });

  const sourceTask = wizard.currentTask || {};

  const formik = useFormik({
    initialValues: {
      inventoryDomain: wizard.inventoryDomain || 'VEHICLE',
      scanImageRequired: sourceTask.scanImageRequired !== false,
      sparePartLocationProgressMode: sourceTask.sparePartLocationProgressMode || 'BASIC',
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
            buildCreatePayload({ ...wizard.taskInformation, ...values }),
          );
          wizard.setCreatedTask(unwrapResponseData(response));
        } catch (error) {
          wizard.setLocalError(error.message || 'Could not create inventory task draft.');
          return;
        }
      } else {
        try {
          const response = await updateSettingsMutation.mutateAsync({
            taskId: wizard.taskId,
            payload: buildScanSettingsPayload(values),
          });
          wizard.setCreatedTask(unwrapResponseData(response));
        } catch (error) {
          wizard.setLocalError(error.message || 'Could not update scan settings.');
          return;
        }
      }

      wizard.goNext();
    },
  });

  const handleDomainSelect = (value) => {
    if (locked || createMutation.isPending || updateSettingsMutation.isPending) return;
    formik.setFieldValue('inventoryDomain', value);
    formik.setFieldTouched('inventoryDomain', true, false);
    wizard.setInventoryDomain(value);
  };

  useEffect(() => {
    wizard.setStepConfig({
      subtitle: 'The selected type controls the next steps and their internal business logic.',
      canClose: !createMutation.isPending && !updateSettingsMutation.isPending,
      closeBlocked: createMutation.isPending || updateSettingsMutation.isPending,
      closeConfirmMessage: null,
      nextLabel: locked ? 'Save Settings & Continue' : 'Create Draft & Next',
      nextDisabled: createMutation.isPending || updateSettingsMutation.isPending || !formik.values.inventoryDomain,
      nextLoading: createMutation.isPending || updateSettingsMutation.isPending,
      nextLoadingLabel: locked ? 'Saving settings...' : 'Creating draft...',
      onNext: formik.submitForm,
      nextStartIcon: locked ? null : React.createElement(SaveRoundedIcon),
      nextEndIcon: locked ? React.createElement(KeyboardArrowRightRoundedIcon) : null,
    });

    return wizard.resetStepControls;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createMutation.isPending,
    updateSettingsMutation.isPending,
    formik.values.inventoryDomain,
    formik.values.scanImageRequired,
    formik.values.sparePartLocationProgressMode,
    locked,
  ]);

  return {
    formik,
    locked,
    createMutation,
    updateSettingsMutation,
    handleDomainSelect,
  };
}
