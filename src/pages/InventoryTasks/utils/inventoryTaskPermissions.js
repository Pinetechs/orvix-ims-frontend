const DOMAIN_PREFIX = {
  VEHICLE: 'VEHICLE',
  ASSET: 'ASSET',
  SPARE_PART: 'SPARE_PART',
};

const permission = (row, suffix) => {
  const prefix = DOMAIN_PREFIX[row?.inventoryDomain];
  return prefix ? `${prefix}_TASK_${suffix}` : null;
};

export const canUpdateInventoryTask = (auth, row) => {
  const code = permission(row, 'UPDATE');
  return Boolean(code && auth?.hasPermission(code));
};

export const canAssignInventoryTask = (auth, row) => {
  const code = permission(row, 'ASSIGN_USERS');
  return Boolean(code && auth?.hasPermission(code));
};

export const resolveAllowedActions = (row = {}) => {
  const status = row.status;
  const scanCount = Number(row.scanCount || 0);
  const closed = status === 'COMPLETED' || status === 'CANCELLED';
  const fallback = {
    editScanSettings: !closed,
    editAssignments: ['IMPORT_COMPLETED', 'READY_FOR_ASSIGNMENT', 'READY_TO_START', 'IN_PROGRESS', 'PAUSED'].includes(status),
    start: ['IMPORT_COMPLETED', 'READY_FOR_ASSIGNMENT', 'READY_TO_START'].includes(status),
    pause: status === 'IN_PROGRESS',
    resume: status === 'PAUSED',
    delete: !closed && status !== 'IN_PROGRESS' && status !== 'IMPORT_IN_PROGRESS' && scanCount < 10,
    deleteRequiresPause: status === 'IN_PROGRESS' && scanCount < 10,
    cancel: !closed && !['IMPORT_PENDING', 'IMPORT_IN_PROGRESS'].includes(status),
  };

  return { ...fallback, ...(row.allowedActions || {}) };
};
