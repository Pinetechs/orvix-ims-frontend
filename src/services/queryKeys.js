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
  inventoryTasks: {
    all: ['inventory-tasks'],
    list: (params) => ['inventory-tasks', 'list', params],
  },
};
