import { baseUrl } from '../util/constant.js';

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
      query.append(key, value);
    }
  });

  return query.toString();
};

const readErrorMessage = async (response, fallback) => {
  try {
    const body = await response.json();
    return body.message || body.error || body?.data?.message || fallback;
  } catch {
    return fallback;
  }
};

export async function getCompanies(params = {}) {
  const queryString = buildQueryString(params);
  const url = queryString ? `${baseUrl}/api/companies?${queryString}` : `${baseUrl}/api/companies`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await readErrorMessage(response, 'Failed to load companies');
    throw new Error(message);
  }

  return response.json();
}