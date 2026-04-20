import httpClient from './http/httpClient.js';

export function fetchProducts(branchId) {
  return httpClient.get('/api/products', { params: { branchId } });
}

export function createProduct(payload) {
  return httpClient.post('/api/products', payload);
}
