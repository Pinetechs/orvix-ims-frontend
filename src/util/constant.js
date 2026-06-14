export const baseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL || '').replace(/\/$/, '');

export const apiRoute = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  currentUser: '/api/account/me',
  changeAccountPassword: '/api/account/changePassword',
  getAllSettings: '/api/settings/all',

  companies: '/api/companies',
  users: '/api/users',
  inventoryTasks: '/api/inventory-tasks',
  vehicleInventory: '/api/inventory/vehicles',
  reports: '/api/reports',
};

export const storageKeys = {
  userInfo: 'orvix.auth.userInfo',
};
