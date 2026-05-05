import httpClient from './http/httpClient.js';

export function listCustomers(params) {
  return httpClient.get('/api/customers', { params });
}

export function createCustomer(payload) {
  return httpClient.post('/api/customers', payload);
}

export function updateCustomer(customerId, payload) {
  return httpClient.put(`/api/customers/${customerId}`, payload);
}
