import { apiClient, cleanRequestParams, getErrorMessage } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

export async function getCompanies(params = {}) {
  try {
    const response = await apiClient.get(apiRoute.companies, { params: cleanRequestParams(params) });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load companies'));
  }
}
