import { apiClient } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

export const getCompanies = async () => {
  const response = await apiClient.get(apiRoute.companies);
  return response.data;
};
