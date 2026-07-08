import { apiClient, cleanRequestParams, getErrorMessage } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

export const uploadSparePartInventoryExcel = async ({ taskId, file }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`${apiRoute.sparePartInventory}/${taskId}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not upload spare part inventory Excel file'));
  }
};

export const getSparePartInventoryItems = async ({ taskId, page = 0, size = 10, sortBy = 'id', sortOrder = 'desc' } = {}) => {
  if (!taskId) {
    return { content: [], totalElements: 0, number: page, size };
  }

  try {
    const response = await apiClient.get(`${apiRoute.sparePartInventory}/${taskId}/items`, {
      params: cleanRequestParams({ page, size, sortBy, sortOrder }),
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load uploaded spare part inventory records'));
  }
};

export const getSparePartInventoryBranches = async ({ taskId } = {}) => {
  if (!taskId) {
    return [];
  }

  try {
    const response = await apiClient.get(`${apiRoute.sparePartInventory}/${taskId}/branches`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load spare part inventory branches'));
  }
};

export const getMySparePartInventoryBranches = async ({ taskId } = {}) => {
  if (!taskId) {
    return [];
  }

  try {
    const response = await apiClient.get(`${apiRoute.sparePartInventory}/${taskId}/my-branches`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load assigned spare part inventory branches'));
  }
};

export const getSparePartInventoryLocations = async ({ taskId, branchId } = {}) => {
  if (!taskId || !branchId) {
    return [];
  }

  try {
    const response = await apiClient.get(`${apiRoute.sparePartInventory}/${taskId}/branches/${branchId}/locations`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load spare part inventory locations'));
  }
};

export const getSparePartInventoryBrands = async ({ taskId } = {}) => {
  if (!taskId) {
    return [];
  }

  try {
    const response = await apiClient.get(`${apiRoute.sparePartInventory}/${taskId}/brands`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load spare part inventory brands'));
  }
};

export const getInventorySparePartTaskAssignments = async (taskId) => {
  if (!taskId) {
    return [];
  }

  try {
    const response = await apiClient.get(`${apiRoute.sparePartInventory}/${taskId}/assignments`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load spare part inventory task assignments'));
  }
};

export const assignInventorySparePartTaskStaff = async ({ taskId, userIds = [], branchAssignments = [], taskStatus = null }) => {
  try {
    const response = await apiClient.post(`${apiRoute.sparePartInventory}/${taskId}/assignments`, {
      userIds,
      branchAssignments,
      // Keep locationAssignments for compatibility with older assignment DTO naming if the backend reuses the common shape.
      locationAssignments: branchAssignments,
      taskStatus,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not assign spare part inventory staff and branches'));
  }
};

export const scanSparePartInventoryItem = async ({ taskId, itemNo, branchId, locationId, countedQty, notes }) => {
  try {
    const response = await apiClient.post(`${apiRoute.sparePartInventory}/${taskId}/scan`, {
      itemNo,
      barcode: itemNo,
      branchId,
      locationId,
      countedQty,
      notes,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not scan spare part item'));
  }
};
