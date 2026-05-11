import httpClient from './http/httpClient.js';

const BASE = '/api/deals-offers';

// ─── Discount Entries ─────────────────────────────────────────────────────────

export function listDiscountEntries() {
  return httpClient.get(`${BASE}/discounts`);
}

export function createDiscountEntry(payload) {
  return httpClient.post(`${BASE}/discounts`, payload);
}

export function updateDiscountEntry(id, payload) {
  return httpClient.put(`${BASE}/discounts/${id}`, payload);
}

export function deleteDiscountEntry(id) {
  return httpClient.delete(`${BASE}/discounts/${id}`);
}

export function deleteAllDiscountEntries() {
  return httpClient.delete(`${BASE}/discounts/all`);
}

// ─── Gift Vouchers ────────────────────────────────────────────────────────────

export function listGiftVouchers() {
  return httpClient.get(`${BASE}/gift-vouchers`);
}

export function createGiftVoucher(payload) {
  return httpClient.post(`${BASE}/gift-vouchers`, payload);
}

export function updateGiftVoucher(id, payload) {
  return httpClient.put(`${BASE}/gift-vouchers/${id}`, payload);
}

export function deleteGiftVoucher(id) {
  return httpClient.delete(`${BASE}/gift-vouchers/${id}`);
}

export function deleteAllGiftVouchers() {
  return httpClient.delete(`${BASE}/gift-vouchers/all`);
}

// ─── Offer Packets ────────────────────────────────────────────────────────────

export function listOfferPackets() {
  return httpClient.get(`${BASE}/offer-packets`);
}

export function createOfferPacket(payload) {
  return httpClient.post(`${BASE}/offer-packets`, payload);
}

export function getOfferPacket(id) {
  return httpClient.get(`${BASE}/offer-packets/${id}`);
}

export function deleteOfferPacket(id) {
  return httpClient.delete(`${BASE}/offer-packets/${id}`);
}

// ─── Packing Entries ──────────────────────────────────────────────────────────

export function listPackingEntries() {
  return httpClient.get(`${BASE}/packing-entries`);
}

export function createPackingEntry(payload) {
  return httpClient.post(`${BASE}/packing-entries`, payload);
}

export function updatePackingEntry(id, payload) {
  return httpClient.put(`${BASE}/packing-entries/${id}`, payload);
}

export function deletePackingEntry(id) {
  return httpClient.delete(`${BASE}/packing-entries/${id}`);
}

export function deleteAllPackingEntries() {
  return httpClient.delete(`${BASE}/packing-entries/all`);
}

// ─── Unpacking Entries ────────────────────────────────────────────────────────

export function listUnpackingEntries() {
  return httpClient.get(`${BASE}/unpacking-entries`);
}

export function createUnpackingEntry(payload) {
  return httpClient.post(`${BASE}/unpacking-entries`, payload);
}

export function updateUnpackingEntry(id, payload) {
  return httpClient.put(`${BASE}/unpacking-entries/${id}`, payload);
}

export function deleteUnpackingEntry(id) {
  return httpClient.delete(`${BASE}/unpacking-entries/${id}`);
}

export function deleteAllUnpackingEntries() {
  return httpClient.delete(`${BASE}/unpacking-entries/all`);
}
