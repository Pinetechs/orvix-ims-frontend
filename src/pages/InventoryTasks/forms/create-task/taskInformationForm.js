import * as Yup from 'yup';

import { buildCompanyOption } from '../../utils/createInventoryTaskDialogUtils.js';

export const initialTaskInformationValues = {
  taskName: '',
  description: '',
  company: null,
};

export const taskInformationSchema = Yup.object({
  taskName: Yup.string()
    .trim()
    .required('Task name is required.')
    .max(150, 'Task name must be 150 characters or less.'),
  description: Yup.string().trim().max(500, 'Description must be 500 characters or less.'),
  company: Yup.object().nullable().required('Company is required.'),
});

export const normalizeTaskInformationValues = (values = {}) => ({
  taskName: values.taskName || '',
  description: values.description || '',
  company: values.company || null,
});

export const buildTaskInformationValuesFromTask = (task = {}) => ({
  taskName: task.taskName || task.name || '',
  description: task.description || '',
  company: buildCompanyOption(task),
});
