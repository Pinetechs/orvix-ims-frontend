import { apiClient } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

export const getInventoryTasks = async () => {
  const response = await apiClient.get(apiRoute.inventoryTasks);
  return response.data;
};
