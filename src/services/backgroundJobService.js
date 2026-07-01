import { apiClient, getErrorMessage } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

export const getBackgroundJob = async (jobId) => {
  if (!jobId) {
    return null;
  }

  try {
    const response = await apiClient.get(`${apiRoute.backgroundJobs}/${jobId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load background job status'));
  }
};
