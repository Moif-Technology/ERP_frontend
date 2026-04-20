import httpClient from './http/httpClient.js';

/** Quotations for a branch (same contract as quotation entry). */
export function listQuotationsForSale(params) {
  return httpClient.get('/api/quotations', { params });
}

/** Delivery orders for a branch (same contract as delivery order entry). */
export function listDeliveryOrdersForSale(params) {
  return httpClient.get('/api/delivery-orders', { params });
}

export function getQuotationForSale(quotationId) {
  return httpClient.get(`/api/quotations/${quotationId}`);
}

export function getDeliveryOrderForSale(deliveryOrderId) {
  return httpClient.get(`/api/delivery-orders/${deliveryOrderId}`);
}

/**
 * Back-office sales entry: saves ops.sales_master + lines + payment (no KOT).
 * Body: branchId, customerId?, quotationId?, deliveryOrderId?, lines[], headerDiscAmt, headerDiscPct,
 * roundOffAdjustment, netAmount, paidAmount?, paymentMode?, counterNo?, creditCardNo?, billing?.
 */
export function createSale(payload) {
  return httpClient.post('/api/sales', payload);
}
