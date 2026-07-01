import { apiRoute } from "../util/constant";
import { apiClient, cleanRequestParams, getErrorMessage } from "./apiClient";



export async function getLookupCompanies(params = {}) {
  try {
    const response = await apiClient.get(apiRoute.lookups+"/companies", { params: cleanRequestParams(params) });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load lookup companies'));
  }
}


export async function getLookupInventoryDomains(params = {}) {
  try {
    const response = await apiClient.get(apiRoute.lookups+"/inventory-domains", { params: cleanRequestParams(params) });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load lookup domains'));
  }
}

export async function getLookupTaskStatuses(params = {}) {
  try {
    const response = await apiClient.get(apiRoute.lookups+"/task-statuses", { params: cleanRequestParams(params) });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load lookup task statuses'));
  }
}

export async function getLookupUserTypes(params = {}) {
  try {
    const response = await apiClient.get(apiRoute.lookups+"/user-types", { params: cleanRequestParams(params) });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load lookup user types'));
  }
}


