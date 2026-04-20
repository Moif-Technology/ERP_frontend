import httpClient from './http/httpClient.js';

export function listSuppliers(params) {
  return httpClient.get('/api/suppliers', { params });
}

export function createSupplier(payload) {
  return httpClient.post('/api/suppliers', payload);
}
