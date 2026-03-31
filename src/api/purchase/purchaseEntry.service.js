import httpClient from '../client/httpClient.js';

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

/** GET /api/purchase/entry/init */
export async function fetchPurchaseEntryInit() {
  try {
    return await unwrap(await httpClient.get('/api/purchase/entry/init'));
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/purchase/entry/get?purchaseId=&purchaseNo=&stationId= */
export async function fetchPurchaseEntryGet(params) {
  try {
    return await unwrap(await httpClient.get('/api/purchase/entry/get', { params }));
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/purchase/entry/list */
export async function fetchPurchaseEntryList(params) {
  try {
    const data = await unwrap(await httpClient.get('/api/purchase/entry/list', { params }));
    return data.items ?? [];
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/purchase/entry/save */
export async function savePurchaseEntry(payload) {
  try {
    return await unwrap(await httpClient.post('/api/purchase/entry/save', payload));
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/purchase/entry/post */
export async function postPurchaseEntry(payload) {
  try {
    return await unwrap(await httpClient.post('/api/purchase/entry/post', payload));
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/purchase/entry/cancel */
export async function cancelPurchaseEntry(payload) {
  try {
    return await unwrap(await httpClient.post('/api/purchase/entry/cancel', payload));
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/products/lookup (shared) */
export async function fetchProductsLookupForPurchase(params) {
  try {
    const data = await unwrap(await httpClient.get('/api/products/lookup', { params }));
    return data.items ?? [];
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/purchase/entry/lpo-list */
export async function fetchLPOListForPurchase(params) {
  try {
    const data = await unwrap(await httpClient.get('/api/purchase/entry/lpo-list', { params }));
    return data.items ?? [];
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/purchase/entry/grn-list */
export async function fetchGRNListForPurchase(params) {
  try {
    const data = await unwrap(await httpClient.get('/api/purchase/entry/grn-list', { params }));
    return data.items ?? [];
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/purchase/entry/grn-items?grnMasterId= */
export async function fetchGRNItemsForPurchase(grnMasterId) {
  try {
    const data = await unwrap(await httpClient.get('/api/purchase/entry/grn-items', { params: { grnMasterId } }));
    return data.items ?? [];
  } catch (e) {
    throw apiError(e);
  }
}
