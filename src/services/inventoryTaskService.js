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

export const getInventoryTask = async (taskId) => {
  if (!taskId) {
    return null;
  }

  try {
    const response = await apiClient.get(`${apiRoute.inventoryTasks}/${taskId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load inventory task'));
  }
};

export const createInventoryTask = async (payload) => {
  try {
    const response = await apiClient.post(apiRoute.inventoryTasks, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not create inventory task'));
  }
};

export const assignInventoryTaskStaff = async ({ taskId, userIds = [] }) => {
  try {
    const response = await apiClient.post(`${apiRoute.inventoryTasks}/${taskId}/assignments`, { userIds });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not assign inventory staff'));
  }
};

export const markInventoryTaskReadyToStart = async ({ taskId }) => {
  try {
    const response = await apiClient.post(`${apiRoute.inventoryTasks}/${taskId}/ready-to-start`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not mark inventory task as ready to start'));
  }
};

export const startInventoryTask = async ({ taskId }) => {
  try {
    const response = await apiClient.post(`${apiRoute.inventoryTasks}/${taskId}/start`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not start inventory task'));
  }
};
