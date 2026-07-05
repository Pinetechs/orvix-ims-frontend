import { apiClient, cleanRequestParams, getErrorMessage } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

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
    const response = await apiClient.get(`${apiRoute.vehicleInventory}/${taskId}/items`, {
      params: cleanRequestParams({ page, size, sort }),
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load uploaded vehicle inventory records'));
  }
};


export const getVehicleInventoryLocations = async ({ taskId } = {}) => {
  if (!taskId) {
    return [];
  }

  try {
    const response = await apiClient.get(`${apiRoute.vehicleInventory}/${taskId}/locations`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load vehicle inventory locations'));
  }
};



export const getInventoryVehicleTaskAssignments = async (taskId) => {
  if (!taskId) {
    return [];
  }

  try {
    const response = await apiClient.get(`${apiRoute.vehicleInventory}/${taskId}/assignments`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load inventory task assignments'));
  }
};


export const assignInventoryVehicleTaskStaff = async ({ taskId, userIds = [], locationAssignments = [], taskStatus = null }) => {
  try {
    const response = await apiClient.post(`${apiRoute.vehicleInventory}/${taskId}/assignments`, {
      userIds,
      locationAssignments,
      taskStatus,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not assign inventory staff and locations'));
  }
};