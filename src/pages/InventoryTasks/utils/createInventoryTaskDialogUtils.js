import * as Yup from 'yup';

export const steps = ['Task information', 'Inventory type', 'Upload Excel', 'Review', 'Staff & status'];
export const COMPANY_LOOKUP_PARAMS = { active: true, size: 20 };
export const IMPORT_UPLOAD_STATUSES = new Set(['IMPORT_PENDING', 'IMPORT_IN_PROGRESS', 'IMPORT_FAILED']);
export const IMPORT_COMPLETED_STATUS = 'IMPORT_COMPLETED';

export const initialValues = {
  taskName: '',
  description: '',
  company: null,
  inventoryDomain: 'VEHICLE',
  staff: [],
  closeAction: 'DRAFT',
};

export const validationSchema = Yup.object({
  taskName: Yup.string()
    .trim()
    .required('Task name is required.')
    .max(150, 'Task name must be 150 characters or less.'),
  description: Yup.string().trim().max(500, 'Description must be 500 characters or less.'),
  company: Yup.object().nullable().required('Company is required.'),
  inventoryDomain: Yup.string().required('Inventory domain is required.'),
  staff: Yup.array(),
  closeAction: Yup.string().required('Final action is required.'),
});

export const getCompanyLabel = (company = {}) => {
  if (!company) return '';
  return company.label || company.name || company.companyName || company.nameEn || company.code || '';
};

export const getTaskStatus = (task = {}) => task?.status || task?.taskStatus || '';

export const getTaskImportJobId = (task = {}) => {
  return (
    task.ImportJobId ??
    task.importJobId ??
    task.backgroundJobId ??
    task.jobId ??
    task.importJob?.id ??
    task.backgroundJob?.id ??
    null
  );
};

export const buildCompanyOption = (task = {}) => {


  console.log('buildCompanyOption task:', task);

  const value = task.companyId ?? task.company?.value ?? task.company?.id ?? task.company?.companyId;
  const label =
    task.companyLabel ||
    task.companyName ||
    task.company?.label ||
    [task.companyCode, task.companyName].filter(Boolean).join(' - ') ||
    task.company?.name ||
    String(value ?? '');

  if (!value) {
    return null;
  }

  return {
    value: String(value),
    label,
  };
};

export const buildInitialValuesFromTask = (task = {}) => ({
  ...initialValues,
  taskName: task.taskName || task.name || '',
  description: task.description || '',
  company: buildCompanyOption(task),
  inventoryDomain: task.inventoryDomain || initialValues.inventoryDomain,
});

// Keep backend status-to-step mapping here so resume behavior stays easy to audit.
export const getResumeStep = (status) => {
  if (status === IMPORT_COMPLETED_STATUS) return 3;
  if (status === 'CREATED' || IMPORT_UPLOAD_STATUSES.has(status)) return 2;
  return 0;
};

export const getUserLabel = (user = {}) => {
  if (!user) return '';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return fullName || user.name || user.username || user.email || '';
};

export const getUserValue = (user = {}) => {
  return user.id ?? user.userId;
};

export const buildCreatePayload = (values) => ({
  taskName: values.taskName.trim(),
  name: values.taskName.trim(),
  description: values.description.trim(),
  companyId: values.company?.value ?? values.company?.id ?? values.company?.companyId,
  inventoryDomain: values.inventoryDomain,
});
