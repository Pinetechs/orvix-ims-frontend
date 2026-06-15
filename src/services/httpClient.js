import { baseUrl } from '../util/constant.js';

export const buildQueryString = (params = {}) => {
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

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await readErrorMessage(response, 'Request failed');
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}