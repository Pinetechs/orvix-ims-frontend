import { apiClient } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

export const getUsers = async () => {
  const response = await apiClient.get(apiRoute.users);
  return response.data;
};
