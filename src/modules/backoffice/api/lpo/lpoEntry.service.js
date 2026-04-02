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

/** GET /api/lpo/entry/init */
export async function fetchLpoEntryInit() {
  try {
    return await unwrap(await httpClient.get('/api/lpo/entry/init'));
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/lpo/entry/get?lpoMasterId=&lpoNo= */
export async function fetchLpoEntryGet(params) {
  try {
    return await unwrap(await httpClient.get('/api/lpo/entry/get', { params }));
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/lpo/entry/list */
export async function fetchLpoEntryList(params) {
  try {
    const data = await unwrap(await httpClient.get('/api/lpo/entry/list', { params }));
    return data.data ?? [];
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/lpo/entry/save */
export async function saveLpoEntry(payload) {
  try {
    return await unwrap(await httpClient.post('/api/lpo/entry/save', payload));
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/lpo/entry/post */
export async function postLpoEntry(payload) {
  try {
    return await unwrap(await httpClient.post('/api/lpo/entry/post', payload));
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/lpo/entry/cancel */
export async function cancelLpoEntry(payload) {
  try {
    return await unwrap(await httpClient.post('/api/lpo/entry/cancel', payload));
  } catch (e) {
    throw apiError(e);
  }
}
