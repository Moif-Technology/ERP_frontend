import httpClient from './http/httpClient.js';

const BASE = '/api/stock-entries';

export function listEntries(docType) {
  return httpClient.get(BASE, { params: { docType } }).then((r) => r.data.entries);
}

export function saveEntry(payload) {
  if (payload.entryId) {
    return httpClient.put(`${BASE}/${payload.entryId}`, payload).then((r) => r.data);
  }
  return httpClient.post(BASE, payload).then((r) => r.data);
}

export function getEntry(entryId) {
  return httpClient.get(`${BASE}/${entryId}`).then((r) => r.data.entry);
}

export function postEntry(entryId) {
  return httpClient.post(`${BASE}/${entryId}/post`).then((r) => r.data);
}

export function unpostEntry(entryId) {
  return httpClient.post(`${BASE}/${entryId}/unpost`).then((r) => r.data);
}

export function deleteEntry(entryId) {
  return httpClient.delete(`${BASE}/${entryId}`).then((r) => r.data);
}

export function getReorderList() {
  return httpClient.get(`${BASE}/reorder`).then((r) => r.data.items);
}

export function getDraftEnteredQty(productId) {
  return httpClient.get(`${BASE}/draft-entered-qty`, { params: { productId } }).then((r) => r.data.row);
}

export function getProductMovement(params) {
  return httpClient.get(`${BASE}/movement`, { params }).then((r) => r.data.rows);
}

export function lookupProductByBarcode(barcode, branchId) {
  return httpClient
    .get('/api/products', { params: { barcode, branchId, limit: 1 } })
    .then((r) => {
      const list = r.data.products ?? r.data ?? [];
      return Array.isArray(list) ? list[0] ?? null : null;
    });
}
