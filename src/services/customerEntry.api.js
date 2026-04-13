import httpClient from './http/httpClient.js';

export function listCustomers(params) {
  return httpClient.get('/api/customers', { params });
}

export function createCustomer(payload) {
  return httpClient.post('/api/customers', payload);
}
