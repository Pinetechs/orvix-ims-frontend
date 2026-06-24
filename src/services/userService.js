import { apiClient, cleanRequestParams, getErrorMessage } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

export async function getUsers(params = {}) {
  try {
    const response = await apiClient.get(apiRoute.users, { params: cleanRequestParams(params) });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load users'));
  }
}

export async function createUser(payload) {
  try {
    const response = await apiClient.post(apiRoute.users, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not create user'));
  }
}
