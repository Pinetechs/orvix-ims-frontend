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

export async function createCompany(payload) {
  try {
    const response = await apiClient.post(apiRoute.companies, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not create company'));
  }
}

export async function updateCompany({ id, payload }) {
  try {
    const response = await apiClient.put(`${apiRoute.companies}/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not update company'));
  }
}

export async function setCompanyActive({ id, active }) {
  try {
    const response = await apiClient.patch(`${apiRoute.companies}/${id}/${active ? 'enable' : 'disable'}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, active ? 'Could not enable company' : 'Could not disable company'));
  }
}
