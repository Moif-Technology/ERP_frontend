import httpClient from './http/httpClient.js';

export function fetchAreas(branchId) {
  return httpClient.get('/api/areas', { params: { branchId } });
}

export function createArea(payload) {
  return httpClient.post('/api/areas', payload);
}
