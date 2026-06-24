import { apiClient, cleanRequestParams, getErrorMessage } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

export const getInventoryTasks = async (params = {}) => {
  try {
    const response = await apiClient.get(apiRoute.inventoryTasks, { params: cleanRequestParams(params) });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load inventory tasks'));
  }
};
