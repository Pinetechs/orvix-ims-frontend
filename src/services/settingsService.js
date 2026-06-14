import { apiClient, getErrorMessage } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

export const getAllSettingsRequest = async () => {
  try {
    const response = await apiClient.get(apiRoute.getAllSettings);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not load settings'));
  }
};

export const mapSettings = (settings = []) => ({
  companyLogoUrl: settings.find((setting) => setting.name === 'companyLogo')?.value || null,
});
