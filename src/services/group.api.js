import httpClient from './http/httpClient.js';

export function listGroups(params) {
  return httpClient.get('/api/groups', { params });
}
