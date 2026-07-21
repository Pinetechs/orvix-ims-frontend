export const baseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL || '').replace(/\/$/, '');

export const apiRoute = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  currentUser: '/api/account/me',
  changeAccountPassword: '/api/account/changePassword',
  getAllSettings: '/api/settings/all',

  companies: '/api/companies',
  users: '/api/users',
  inventoryTasks: '/api/inventory/tasks',
  vehicleInventory: '/api/inventory/vehicle',
  assetInventory: '/api/inventory/asset',
  sparePartInventory: '/api/inventory/spare-part',
  backgroundJobs: '/api/background-jobs',
  reports: '/api/reports',
  lookups: '/api/lookups',
  dashboardOverview: '/api/dashboard/overview',
  inventoryTrackingTasks: '/api/inventory/tracking/tasks',
};

export const storageKeys = {
  userInfo: 'orvix.auth.userInfo',
  authToken: 'orvix.auth.token',
};
