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
  },
  vehicleInventory: {
    all: ['vehicle-inventory'],
    vehicleItemsAll: (taskId) => ['inventory-tasks', 'details', taskId, 'vehicle-items'],
    vehicleItems: (taskId, params) => ['inventory-tasks', 'details', taskId, 'vehicle-items', params],
    vehicleLocations: (taskId) => ['inventory-tasks', 'details', taskId, 'vehicle-locations'],
    assignments: (taskId) => ['inventory-tasks', 'details', taskId, 'vehicle-assignments'],
    details: (id) => ['inventory-tasks', 'details', id],
  },

  sparePartInventory: {
    all: ['spare-part-inventory'],
    sparePartItemsAll: (taskId) => ['inventory-tasks', 'details', taskId, 'spare-part-items'],
    sparePartItems: (taskId, params) => ['inventory-tasks', 'details', taskId, 'spare-part-items', params],
    sparePartBranches: (taskId) => ['inventory-tasks', 'details', taskId, 'spare-part-branches'],
    sparePartLocations: (taskId, branchId) => ['inventory-tasks', 'details', taskId, 'spare-part-branches', branchId, 'locations'],
    sparePartBrands: (taskId) => ['inventory-tasks', 'details', taskId, 'spare-part-brands'],
    assignments: (taskId) => ['inventory-tasks', 'details', taskId, 'spare-part-assignments'],
    details: (id) => ['inventory-tasks', 'details', id],
  },
  assetInventory: {
    all: ['asset-inventory'],
    assetItemsAll: (taskId) => ['inventory-tasks', 'details', taskId, 'asset-items'],
    assetItems: (taskId, params) => ['inventory-tasks', 'details', taskId, 'asset-items', params],
    assetLocations: (taskId) => ['inventory-tasks', 'details', taskId, 'asset-locations'],
    assetFloors: (taskId, locationId) => ['inventory-tasks', 'details', taskId, 'asset-locations', locationId, 'floors'],
    assetPlaces: (taskId, floorId) => ['inventory-tasks', 'details', taskId, 'asset-floors', floorId, 'places'],
    assetCategories: (taskId) => ['inventory-tasks', 'details', taskId, 'asset-categories'],
    assignments: (taskId) => ['inventory-tasks', 'details', taskId, 'asset-assignments'],
    details: (id) => ['inventory-tasks', 'details', id],
  },
};
