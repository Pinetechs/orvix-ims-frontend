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

export const updateInventoryTaskScanSettings = async ({ taskId, payload }) => {
  try {
    const response = await apiClient.patch(`${apiRoute.inventoryTasks}/${taskId}/scan-settings`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not update scan settings'));
  }
};

export const getEligibleInventoryStaff = async ({ taskId, ...params }) => {
  if (!taskId) return { content: [] };
  try {
    const response = await apiClient.get(`${apiRoute.inventoryTasks}/${taskId}/eligible-staff`, {
      params: cleanRequestParams(params),
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not load eligible inventory staff'));
  }
};

export const pauseInventoryTask = async ({ taskId, reason }) => {
  try {
    const response = await apiClient.post(`${apiRoute.inventoryTasks}/${taskId}/pause`, { reason });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not pause inventory task'));
  }
};

export const resumeInventoryTask = async ({ taskId }) => {
  try {
    const response = await apiClient.post(`${apiRoute.inventoryTasks}/${taskId}/resume`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not resume inventory task'));
  }
};

export const markInventoryTaskReady = async ({ taskId }) => {
  try {
    const response = await apiClient.post(`${apiRoute.inventoryTasks}/${taskId}/ready-to-start`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not mark inventory task as ready'));
  }
};

export const submitInventoryTaskForReview = async ({ taskId }) => {
  try {
    const response = await apiClient.post(`${apiRoute.inventoryTasks}/${taskId}/review`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not submit inventory task for review'));
  }
};

export const returnInventoryTaskToProgress = async ({ taskId, reason }) => {
  try {
    const response = await apiClient.post(`${apiRoute.inventoryTasks}/${taskId}/return-to-progress`, { reason });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not return inventory task to progress'));
  }
};

export const completeInventoryTask = async ({ taskId }) => {
  try {
    const response = await apiClient.post(`${apiRoute.inventoryTasks}/${taskId}/complete`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not complete inventory task'));
  }
};

export const cancelInventoryTask = async ({ taskId, reason }) => {
  try {
    const response = await apiClient.post(`${apiRoute.inventoryTasks}/${taskId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not cancel inventory task'));
  }
};

export const deleteInventoryTask = async ({ taskId }) => {
  try {
    await apiClient.delete(`${apiRoute.inventoryTasks}/${taskId}`);
    return taskId;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not delete inventory task'));
  }
};
