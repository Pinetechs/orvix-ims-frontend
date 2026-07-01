export const queryKeys = {
  settings: {
    all: ['settings'],
  },
  users: {
    all: ['users'],
    list: (params) => ['users', 'list', params],
    details: (id) => ['users', 'details', id],
  },
  companies: {
    all: ['companies'],
    list: (params) => ['companies', 'list', params],
    autocomplete: (params) => ['companies', 'autocomplete', params],
  },
  lookups: {
    all: ['lookups'],
    companies: (params) => ['lookups', 'companies', params],
    inventoryDomains: (params) => ['lookups', 'inventory-domains', params],
    taskStatuses: (params) => ['lookups', 'task-statuses', params],
    userTypes: (params) => ['lookups', 'user-types', params],
  },
  backgroundJobs: {
    all: ['background-jobs'],
    details: (id) => ['background-jobs', 'details', id],
  },
  inventoryTasks: {
    all: ['inventory-tasks'],
    list: (params) => ['inventory-tasks', 'list', params],
    details: (id) => ['inventory-tasks', 'details', id],
    vehicleItemsAll: (taskId) => ['inventory-tasks', 'details', taskId, 'vehicle-items'],
    vehicleItems: (taskId, params) => ['inventory-tasks', 'details', taskId, 'vehicle-items', params],
  },
};
