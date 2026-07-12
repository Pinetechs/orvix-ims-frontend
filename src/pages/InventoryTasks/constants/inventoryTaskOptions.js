export const INVENTORY_DOMAIN_OPTIONS = [
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'ASSET', label: 'Asset' },
  { value: 'SPARE_PART', label: 'Spare Part' },
];

export const INVENTORY_TASK_STATUS_OPTIONS = [
  { value: 'CREATED', label: 'Created' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IMPORT_PENDING', label: 'Import Pending' },
  { value: 'IMPORT_IN_PROGRESS', label: 'Import In Progress' },
  { value: 'IMPORT_FAILED', label: 'Import Failed' },
  { value: 'IMPORT_COMPLETED', label: 'Import Completed' },
  { value: 'READY_FOR_ASSIGNMENT', label: 'Ready For Assignment' },
  { value: 'READY_TO_START', label: 'Ready To Start' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const TASK_CLOSE_ACTION_OPTIONS = [
  {
    value: 'DRAFT',
    label: 'Keep as Draft',
    description: 'The task remains saved but not ready for app inventory work.',
  },
  {
    value: 'READY_TO_START',
    label: 'Ready to Start',
    description: 'The task is prepared and assigned, but the team starts it later.',
  },
  
];
