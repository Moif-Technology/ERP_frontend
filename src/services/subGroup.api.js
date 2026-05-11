import httpClient from './http/httpClient.js';

export function listSubGroups(params) {
  return httpClient.get('/api/sub-groups', { params });
}
