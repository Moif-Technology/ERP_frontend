import httpClient from './http/httpClient.js';

export function listLposForPurchase(params) {
  return httpClient.get('/api/lpos', { params });
}

export function getLpoForPurchase(lpoMasterId) {
  return httpClient.get(`/api/lpos/${lpoMasterId}`);
}

/** Create ops.lpo_master + lines (Local Purchase Order screen). */
export function createLpo(payload) {
  return httpClient.post('/api/lpos', payload);
}

/** Replace lines and update header for an existing LPO. */
export function updateLpo(lpoMasterId, payload) {
  return httpClient.put(`/api/lpos/${encodeURIComponent(String(lpoMasterId))}`, payload);
}

export function listGrnsForPurchase(params) {
  return httpClient.get('/api/grns', { params });
}

export function getGrnForPurchase(grnId) {
  return httpClient.get(`/api/grns/${grnId}`);
}

export function createGrn(payload) {
  return httpClient.post('/api/grns', payload);
}

/**
 * Back-office purchase: ops.purchase_master + purchase_child.
 * Body: branchId, supplierId, grnId?, lpoMasterId?, supplierInvoiceNo?, purchaseDate?, invoiceAmount, netAmount,
 * paymentMode?, paymentNow?, remark?, lines[{ productId, qty, ... }].
 */
export function createPurchase(payload) {
  return httpClient.post('/api/purchases', payload);
}
