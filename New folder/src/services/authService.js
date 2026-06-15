import { apiClient, getErrorMessage } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

export const loginRequest = async ({ username, password }) => {
  try {
    const response = await apiClient.post(apiRoute.login, { username, password });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Login failed'));
  }
};

export const logoutRequest = async () => {
  try {
    const response = await apiClient.get(apiRoute.logout);
    return response.data;
  } catch (error) {
    // Logout should still clear client state even if server session is already expired.
    return null;
  }
};

export const changePasswordRequest = async ({ oldPassword, newPassword }) => {
  try {
    const response = await apiClient.put(apiRoute.changeAccountPassword, { oldPassword, newPassword });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not change password'));
  }
};
