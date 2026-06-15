import { apiRequest, buildQueryString } from './httpClient.js';

export function getUsers(params = {}) {
  const query = buildQueryString(params);
  return apiRequest(query ? `/api/users?${query}` : '/api/users');
}

export function createUser(payload) {
  return apiRequest('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}