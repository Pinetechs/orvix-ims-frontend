import { apiClient, getErrorMessage } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

export const getDashboardOverview = async () => {
  try {
    const response = await apiClient.get(apiRoute.dashboardOverview);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load dashboard overview'));
  }
};
