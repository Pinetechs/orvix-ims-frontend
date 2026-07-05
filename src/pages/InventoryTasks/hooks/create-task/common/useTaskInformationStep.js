import React, { useEffect } from 'react';
import { useFormik } from 'formik';

import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

import {
  normalizeTaskInformationValues,
  taskInformationSchema,
} from '../../../forms/create-task/taskInformationForm.js';

export function useTaskInformationStep({ wizard }) {
  const locked = Boolean(wizard.createdTask);

  const formik = useFormik({
    initialValues: normalizeTaskInformationValues(wizard.taskInformation),
    validationSchema: taskInformationSchema,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: (values) => {
      wizard.setTaskInformation(normalizeTaskInformationValues(values));
      wizard.goNext();
    },
  });

  useEffect(() => {
    wizard.setStepConfig({
      subtitle: 'Add the visible task name, description and company before choosing the inventory type.',
      canClose: true,
      closeBlocked: false,
      closeConfirmMessage: null,
      nextLabel: 'Next',
      nextDisabled: formik.isSubmitting,
      nextLoading: formik.isSubmitting,
      onNext: formik.submitForm,
      nextEndIcon: React.createElement(KeyboardArrowRightRoundedIcon),
    });

    return wizard.resetStepControls;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.isSubmitting, formik.values]);

  return {
    formik,
    locked,
  };
}
