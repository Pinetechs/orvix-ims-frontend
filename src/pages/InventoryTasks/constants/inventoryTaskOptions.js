export const INVENTORY_DOMAIN_OPTIONS = [
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'ASSET', label: 'Asset' },
  { value: 'SPARE_PART', label: 'Spare Part' },
];

export const INVENTORY_TASK_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'READY_FOR_ASSIGNMENT', label: 'Ready For Assignment' },
  { value: 'READY_TO_START', label: 'Ready To Start' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const TASK_CLOSE_ACTION_OPTIONS = [
  {
    value: 'DRAFT',
    label: 'Keep as Draft',
    description: 'The task remains saved but not ready for mobile inventory work.',
  },
  {
    value: 'READY_TO_START',
    label: 'Ready to Start',
    description: 'The task is prepared and assigned, but the team starts it later.',
  },
  {
    value: 'START_NOW',
    label: 'Start Now',
    description: 'The task moves to in-progress immediately after creation.',
  },
];
