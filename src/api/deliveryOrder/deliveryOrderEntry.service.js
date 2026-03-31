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

/** GET /api/delivery-order/entry/init */
export async function fetchDOEntryInit() {
  try {
    return await unwrap(await httpClient.get('/api/delivery-order/entry/init'));
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/delivery-order/entry/get?doId=&doNo=&stationId= */
export async function fetchDOEntryGet(params) {
  try {
    return await unwrap(await httpClient.get('/api/delivery-order/entry/get', { params }));
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/delivery-order/entry/list */
export async function fetchDOEntryList(params) {
  try {
    const data = await unwrap(await httpClient.get('/api/delivery-order/entry/list', { params }));
    return data.items ?? [];
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/delivery-order/entry/load-quotation-items */
export async function loadDOQuotationItems(body) {
  try {
    const data = await unwrap(
      await httpClient.post('/api/delivery-order/entry/load-quotation-items', body)
    );
    return data.items ?? [];
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/delivery-order/entry/save */
export async function saveDOEntryRequest(payload) {
  try {
    return await unwrap(await httpClient.post('/api/delivery-order/entry/save', payload));
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/delivery-order/entry/post */
export async function postDOEntryRequest(payload) {
  try {
    return await unwrap(await httpClient.post('/api/delivery-order/entry/post', payload));
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/delivery-order/entry/cancel */
export async function cancelDOEntryRequest(payload) {
  try {
    return await unwrap(await httpClient.post('/api/delivery-order/entry/cancel', payload));
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
