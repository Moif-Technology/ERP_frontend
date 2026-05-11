import httpClient from './http/httpClient.js';

export function fetchGroups(branchId) {
  return httpClient.get('/api/groups', { params: { branchId } });
}

export function createGroup(payload) {
  return httpClient.post('/api/groups', payload);
}
