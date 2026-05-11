import httpClient from './http/httpClient.js';
import { getDeliveryOrder, listDeliveryOrders } from './deliveryOrderEntry.api.js';
import { getQuotation, listQuotations } from './quotationEntry.api.js';

/** Quotations for a branch (same contract as quotation entry). */
export function listQuotationsForSale(params) {
  return listQuotations(params);
}

/** Delivery orders for a branch (same contract as delivery order entry). */
export function listDeliveryOrdersForSale(params) {
  return listDeliveryOrders(params);
}

export function getQuotationForSale(quotationId) {
  return getQuotation(quotationId);
}

export function getDeliveryOrderForSale(deliveryOrderId) {
  return getDeliveryOrder(deliveryOrderId);
}

export function listSales(params) {
  return httpClient.get('/api/sales', { params });
}

/**
 * Back-office sales entry: saves ops.sales_master + lines + payment (no KOT).
 * Body: branchId, customerId?, quotationId?, deliveryOrderId?, lines[], headerDiscAmt, headerDiscPct,
 * roundOffAdjustment, netAmount, paidAmount?, paymentMode?, counterNo?, creditCardNo?, billing?.
 */
export function createSale(payload) {
  return httpClient.post('/api/sales', payload);
}
