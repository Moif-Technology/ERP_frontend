import httpClient from '../../../../services/http/httpClient.js';

function unwrap(response) {
  const { data, status } = response;
  if (status >= 400 || data?.success === false) {
    const err = new Error(data?.message || 'Request failed');
    err.status = status;
    throw err;
  }
  return data;
}

function apiError(err) {
  const msg = err.response?.data?.message || err.message || 'Network error';
  const e = new Error(msg);
  e.status = err.response?.status;
  return e;
}

/** GET /api/quotation/entry/init */
export async function fetchQuotationEntryInit() {
  try {
    return await unwrap(await httpClient.get('/api/quotation/entry/init'));
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/quotation/entry/get */
export async function fetchQuotationEntryGet(params) {
  try {
    return await unwrap(await httpClient.get('/api/quotation/entry/get', { params }));
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/quotation/entry/list */
export async function fetchQuotationEntryList(params) {
  try {
    const data = await unwrap(await httpClient.get('/api/quotation/entry/list', { params }));
    return data.items ?? [];
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/quotation/entry/save */
export async function saveQuotationEntryRequest(payload) {
  try {
    return await unwrap(await httpClient.post('/api/quotation/entry/save', payload));
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/customers (shared) */
export async function fetchCustomersList() {
  try {
    const data = await unwrap(await httpClient.get('/api/customers'));
    return data.customers ?? [];
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/products/lookup (shared) */
export async function fetchProductsLookup(params) {
  try {
    const data = await unwrap(await httpClient.get('/api/products/lookup', { params }));
    return data.items ?? [];
  } catch (e) {
    throw apiError(e);
  }
}
