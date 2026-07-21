import { apiClient, cleanRequestParams, getErrorMessage } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

const taskUrl = (taskId, suffix = '') => `${apiRoute.inventoryTrackingTasks}/${taskId}${suffix}`;

const get = async (url, params, fallback) => {
  try {
    const response = await apiClient.get(url, { params: cleanRequestParams(params) });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, fallback));
  }
};

export const getTrackingTasks = (params = {}) =>
  get(apiRoute.inventoryTrackingTasks, params, 'Failed to load tracking tasks');

export const getTrackingOverview = (taskId) =>
  get(taskUrl(taskId, '/overview'), undefined, 'Failed to load task tracking overview');

export const getTrackingAreas = (taskId) =>
  get(taskUrl(taskId, '/areas'), undefined, 'Failed to load tracking areas');

export const getTrackingTeam = (taskId) =>
  get(taskUrl(taskId, '/team'), undefined, 'Failed to load task team');

export const getTrackingAttention = (taskId) =>
  get(taskUrl(taskId, '/attention'), undefined, 'Failed to load attention items');

export const getTrackingResults = ({ taskId, ...params }) =>
  get(taskUrl(taskId, '/results'), params, 'Failed to load inventory results');

export const getTrackingScanEvents = ({ taskId, ...params }) =>
  get(taskUrl(taskId, '/scan-events'), params, 'Failed to load scan events');

export const getTrackingTimeline = ({ taskId, ...params }) =>
  get(taskUrl(taskId, '/timeline'), params, 'Failed to load task timeline');

export const getTrackingScanImage = async ({ taskId, scanId }) => {
  try {
    const response = await apiClient.get(taskUrl(taskId, `/scan-events/${scanId}/image`), {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load scan image'));
  }
};
