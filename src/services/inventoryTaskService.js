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

export const createInventoryTask = async (payload) => {
  try {
    const response = await apiClient.post(apiRoute.inventoryTasks, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not create inventory task'));
  }
};

export const uploadVehicleInventoryExcel = async ({ taskId, file }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`${apiRoute.vehicleInventory}/${taskId}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not upload vehicle inventory Excel file'));
  }
};

export const getVehicleInventoryItems = async ({ taskId, page = 0, size = 10, sort } = {}) => {
  if (!taskId) {
    return { content: [], totalElements: 0, number: page, size };
  }

  try {
    const response = await apiClient.get(`${apiRoute.inventoryTasks}/${taskId}/vehicles/items`, {
      params: cleanRequestParams({ page, size, sort }),
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load uploaded vehicle inventory records'));
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
