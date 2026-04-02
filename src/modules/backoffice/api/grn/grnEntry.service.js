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

/** GET /api/grn/entry/init */
export async function fetchGrnEntryInit() {
  try {
    return await unwrap(await httpClient.get('/api/grn/entry/init'));
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/grn/entry/get?grnMasterId=&grnNo= */
export async function fetchGrnEntryGet(params) {
  try {
    return await unwrap(await httpClient.get('/api/grn/entry/get', { params }));
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/grn/entry/list */
export async function fetchGrnEntryList(params) {
  try {
    const data = await unwrap(await httpClient.get('/api/grn/entry/list', { params }));
    return data.data ?? [];
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/grn/entry/save */
export async function saveGrnEntry(payload) {
  try {
    return await unwrap(await httpClient.post('/api/grn/entry/save', payload));
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/grn/entry/cancel */
export async function cancelGrnEntry(payload) {
  try {
    return await unwrap(await httpClient.post('/api/grn/entry/cancel', payload));
  } catch (e) {
    throw apiError(e);
  }
}
