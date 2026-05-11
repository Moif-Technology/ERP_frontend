import httpClient from './http/httpClient.js';

export function fetchTables(branchId, areaId) {
  return httpClient.get('/api/tables', { params: { branchId, areaId } });
}

export function createTable(payload) {
  return httpClient.post('/api/tables', payload);
}
