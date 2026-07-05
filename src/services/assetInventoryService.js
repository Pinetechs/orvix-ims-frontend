import { apiClient, cleanRequestParams, getErrorMessage } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

export const uploadAssetInventoryExcel = async ({ taskId, file }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`${apiRoute.assetInventory}/${taskId}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not upload asset inventory Excel file'));
  }
};

export const getAssetInventoryItems = async ({ taskId, page = 0, size = 10, sortBy = 'id', sortOrder = 'desc' } = {}) => {
  if (!taskId) {
    return { content: [], totalElements: 0, number: page, size };
  }

  try {
    const response = await apiClient.get(`${apiRoute.assetInventory}/${taskId}/items`, {
      params: cleanRequestParams({ page, size, sortBy, sortOrder }),
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load uploaded asset inventory records'));
  }
};

export const getAssetInventoryLocations = async ({ taskId } = {}) => {
  if (!taskId) {
    return [];
  }

  try {
    const response = await apiClient.get(`${apiRoute.assetInventory}/${taskId}/locations`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load asset inventory locations'));
  }
};

export const getMyAssetInventoryLocations = async ({ taskId } = {}) => {
  if (!taskId) {
    return [];
  }

  try {
    const response = await apiClient.get(`${apiRoute.assetInventory}/${taskId}/my-locations`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load assigned asset inventory locations'));
  }
};

export const getAssetInventoryFloors = async ({ taskId, locationId } = {}) => {
  if (!taskId || !locationId) {
    return [];
  }

  try {
    const response = await apiClient.get(`${apiRoute.assetInventory}/${taskId}/locations/${locationId}/floors`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load asset inventory floors'));
  }
};

export const getAssetInventoryPlaces = async ({ taskId, floorId } = {}) => {
  if (!taskId || !floorId) {
    return [];
  }

  try {
    const response = await apiClient.get(`${apiRoute.assetInventory}/${taskId}/floors/${floorId}/places`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load asset inventory places'));
  }
};

export const getAssetInventoryCategories = async ({ taskId } = {}) => {
  if (!taskId) {
    return [];
  }

  try {
    const response = await apiClient.get(`${apiRoute.assetInventory}/${taskId}/categories`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load asset inventory categories'));
  }
};

export const getInventoryAssetTaskAssignments = async (taskId) => {
  if (!taskId) {
    return [];
  }

  try {
    const response = await apiClient.get(`${apiRoute.assetInventory}/${taskId}/assignments`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load asset inventory task assignments'));
  }
};

export const assignInventoryAssetTaskStaff = async ({ taskId, userIds = [], locationAssignments = [], taskStatus = null }) => {
  try {
    const response = await apiClient.post(`${apiRoute.assetInventory}/${taskId}/assignments`, {
      userIds,
      locationAssignments,
      taskStatus,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not assign asset inventory staff and locations'));
  }
};

export const scanAssetInventoryBarcode = async ({ taskId, barcode, locationId, floorId, placeId, notes }) => {
  try {
    const response = await apiClient.post(`${apiRoute.assetInventory}/${taskId}/scan`, {
      barcode,
      locationId,
      floorId,
      placeId,
      notes,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not scan asset barcode'));
  }
};
