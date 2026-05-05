import httpClient from './http/httpClient.js';

export function listSuppliers(params) {
  return httpClient.get('/api/suppliers', { params });
}

export function createSupplier(payload) {
  return httpClient.post('/api/suppliers', payload);
}

export function updateSupplier(supplierId, payload) {
  return httpClient.put(`/api/suppliers/${supplierId}`, payload);
}
