import httpClient from './http/httpClient.js';

/* ──────────── Chart of Accounts ──────────── */

export function listAccountHeads(params) {
  return httpClient.get('/api/account-heads', { params });
}

export function getAccountTree() {
  return httpClient.get('/api/account-heads/tree');
}

export function getAccountHead(accountId) {
  return httpClient.get(`/api/account-heads/${accountId}`);
}

export function createAccountHead(body) {
  return httpClient.post('/api/account-heads', body);
}

export function updateAccountHead(accountId, body) {
  return httpClient.put(`/api/account-heads/${accountId}`, body);
}

export function deleteAccountHead(accountId) {
  return httpClient.delete(`/api/account-heads/${accountId}`);
}

/* ──────────── Branch defaults ──────────── */

export function getAccountBranchDefaults(params) {
  return httpClient.get('/api/account-parameters/branch-defaults', { params });
}

export function patchAccountBranchDefaults(body) {
  return httpClient.patch('/api/account-parameters/branch-defaults', body);
}

/* ──────────── Voucher Types ──────────── */

export function listVoucherTypes() {
  return httpClient.get('/api/vouchers/types');
}

/* ──────────── Vouchers CRUD ──────────── */

export function listVouchers(params) {
  return httpClient.get('/api/vouchers', { params });
}

export function getVoucher(id) {
  return httpClient.get(`/api/vouchers/${id}`);
}

export function createVoucher(body) {
  return httpClient.post('/api/vouchers', body);
}

export function updateVoucher(id, body) {
  return httpClient.put(`/api/vouchers/${id}`, body);
}

export function postVoucher(id) {
  return httpClient.post(`/api/vouchers/${id}/post`);
}

export function unpostVoucher(id) {
  return httpClient.post(`/api/vouchers/${id}/unpost`);
}

export function deleteVoucher(id) {
  return httpClient.delete(`/api/vouchers/${id}`);
}

/* ──────────── Ledger & Reports ──────────── */

export function getLedgerTransactions(accountId, params) {
  return httpClient.get(`/api/vouchers/ledger/${accountId}`, { params });
}

export function getTrialBalance(params) {
  return httpClient.get('/api/vouchers/trial-balance', { params });
}

export function getAgingSummary(params) {
  return httpClient.get('/api/vouchers/aging-summary', { params });
}
