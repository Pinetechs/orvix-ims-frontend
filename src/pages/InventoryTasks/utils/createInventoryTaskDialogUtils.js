import * as Yup from 'yup';

export const steps = ['Task information', 'Inventory type', 'Upload Excel', 'Review', 'Staff & locations'];
export const COMPANY_LOOKUP_PARAMS = { active: true, size: 20 };
export const IMPORT_UPLOAD_STATUSES = new Set(['IMPORT_PENDING', 'IMPORT_IN_PROGRESS']);
export const IMPORT_COMPLETED_STATUS = 'IMPORT_COMPLETED';

export const initialValues = {
  taskName: '',
  description: '',
  company: null,
  inventoryDomain: 'VEHICLE',
  scanImageRequired: true,
  sparePartLocationProgressMode: 'BASIC',
  staff: [],
  closeAction: 'DRAFT',
  locationAssignments: {},
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
  locationAssignments: Yup.object(),
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
  if (status === 'IN_PROGRESS' || status === 'PAUSED') return 4;
  if (status === 'READY_TO_START' || status === 'READY_FOR_ASSIGNMENT') return 4;
  if (status === IMPORT_COMPLETED_STATUS) return 3;
  if (status === 'CREATED' || status === 'IMPORT_FAILED' || IMPORT_UPLOAD_STATUSES.has(status)) return 2;
  return 0;
};

export const getUserLabel = (user = {}) => {
  if (!user) return '';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return user.fullName || fullName || user.name || user.username || user.email || '';
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
  scanImageRequired: values.scanImageRequired !== false,
  sparePartLocationProgressMode:
    values.inventoryDomain === 'SPARE_PART'
      ? values.sparePartLocationProgressMode || 'BASIC'
      : 'BASIC',
});

export const buildScanSettingsPayload = (values) => ({
  scanImageRequired: values.scanImageRequired !== false,
  ...(values.inventoryDomain === 'SPARE_PART'
    ? { sparePartLocationProgressMode: values.sparePartLocationProgressMode || 'BASIC' }
    : {}),
});


export const getLocationValue = (location = {}) => {
  return location.id ?? location.locationId ?? location.value;
};

export const getLocationLabel = (location = {}) => {
  if (!location) return '';

  const storeNo = location.storeNo || location.stStoreNo || location.code || '';
  const locationName = location.locationName || location.name || location.label || '';
  const totalItems = location.totalVehicles ?? location.totalAssets ?? location.totalItems ?? location.count ?? null;
  const baseLabel = [storeNo, locationName].filter(Boolean).join(' - ');

  if (totalItems !== null && totalItems !== undefined) {
    return `${baseLabel || getLocationValue(location)} (${totalItems})`;
  }

  return baseLabel || String(getLocationValue(location) ?? '');
};

export const buildLocationAssignmentPayload = (values = {}) => {
  const staff = Array.isArray(values.staff) ? values.staff : [];
  const locationAssignments = values.locationAssignments || {};

  return staff
    .map((user) => {
      const userId = getUserValue(user);
      const locations = Array.isArray(locationAssignments[String(userId)])
        ? locationAssignments[String(userId)]
        : [];

      return {
        userId: Number(userId),
        locationIds: locations
          .map((location) => getLocationValue(location))
          .filter((locationId) => locationId !== undefined && locationId !== null && locationId !== '')
          .map(Number),
      };
    })
    .filter((assignment) => assignment.userId);
};


export const getBranchValue = (branch = {}) => {
  return branch.id ?? branch.branchId ?? branch.value;
};

export const getBranchLabel = (branch = {}) => {
  if (!branch) return '';

  const branchCode = branch.branchCode || branch.code || '';
  const branchName = branch.branchName || branch.name || branch.label || branch.branch || '';
  const totalItems = branch.totalItems ?? branch.totalRecords ?? branch.count ?? null;
  const baseLabel = [branchCode, branchName].filter(Boolean).join(' - ');

  if (totalItems !== null && totalItems !== undefined) {
    return `${baseLabel || getBranchValue(branch)} (${totalItems})`;
  }

  return baseLabel || String(getBranchValue(branch) ?? '');
};

export const buildBranchAssignmentPayload = (values = {}) => {
  const staff = Array.isArray(values.staff) ? values.staff : [];
  const branchAssignments = values.branchAssignments || {};

  return staff
    .map((user) => {
      const userId = getUserValue(user);
      const branches = Array.isArray(branchAssignments[String(userId)])
        ? branchAssignments[String(userId)]
        : [];

      return {
        userId: Number(userId),
        branchIds: branches
          .map((branch) => getBranchValue(branch))
          .filter((branchId) => branchId !== undefined && branchId !== null && branchId !== '')
          .map(Number),
      };
    })
    .filter((assignment) => assignment.userId);
};
