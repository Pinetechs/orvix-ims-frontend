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

export async function updateUser({ id, payload }) {
  try {
    const response = await apiClient.put(`${apiRoute.users}/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not update user'));
  }
}

export async function resetUserPassword({ id, password }) {
  try {
    const response = await apiClient.put(`${apiRoute.users}/${id}/reset-password`, { newPassword: password });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not reset user password'));
  }
}

export async function setUserActive({ id, active }) {
  try {
    const response = await apiClient.put(`${apiRoute.users}/${id}/${active ? 'enable' : 'disable'}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, active ? 'Could not enable user' : 'Could not disable user'));
  }
}
