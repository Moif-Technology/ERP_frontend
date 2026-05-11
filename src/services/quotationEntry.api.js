import httpClient from './http/httpClient.js';

export function createQuotation(payload) {
  return httpClient.post('/api/quotations', payload);
}

export function listQuotations(params) {
  return httpClient.get('/api/quotations', { params });
}

export function getQuotation(quotationId) {
  return httpClient.get(`/api/quotations/${quotationId}`);
}
