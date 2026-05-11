import httpClient from './http/httpClient.js';

export function createDeliveryOrder(payload) {
  return httpClient.post('/api/delivery-orders', payload);
}

export function listDeliveryOrders(params) {
  return httpClient.get('/api/delivery-orders', { params });
}

export function getDeliveryOrder(deliveryOrderId) {
  return httpClient.get(`/api/delivery-orders/${deliveryOrderId}`);
}
