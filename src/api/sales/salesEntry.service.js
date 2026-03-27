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

/** GET /api/sales/entry/init */
export async function fetchSalesEntryInit() {
  try {
    const data = await unwrap(await httpClient.get('/api/sales/entry/init'));
    return data;
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/sales/entry/customers */
export async function fetchSalesEntryCustomers() {
  try {
    const data = await unwrap(await httpClient.get('/api/sales/entry/customers'));
    return data.customers ?? [];
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/sales/entry/customer-summary?customerId= */
export async function fetchSalesCustomerSummary(customerId) {
  try {
    const data = await unwrap(
      await httpClient.get('/api/sales/entry/customer-summary', {
        params: { customerId },
      })
    );
    return data;
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/sales/entry/product-lookup */
export async function fetchSalesProductLookup(params) {
  try {
    const data = await unwrap(
      await httpClient.get('/api/sales/entry/product-lookup', { params })
    );
    return data;
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/sales/entry/quotation-list */
export async function fetchSalesQuotationList(params) {
  try {
    const data = await unwrap(
      await httpClient.get('/api/sales/entry/quotation-list', { params })
    );
    return data.quotationList ?? [];
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/sales/entry/do-list */
export async function fetchSalesDOList(params) {
  try {
    const data = await unwrap(
      await httpClient.get('/api/sales/entry/do-list', { params })
    );
    return data.doList ?? [];
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/sales/entry/load-quotation-items */
export async function loadSalesQuotationItems(body) {
  try {
    const data = await unwrap(await httpClient.post('/api/sales/entry/load-quotation-items', body));
    return data;
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/sales/entry/load-do-items */
export async function loadSalesDOItems(body) {
  try {
    const data = await unwrap(await httpClient.post('/api/sales/entry/load-do-items', body));
    return data;
  } catch (e) {
    throw apiError(e);
  }
}

/** GET /api/sales/entry/get?salesId=&stationId= */
export async function fetchSalesEntryById(params) {
  try {
    const data = await unwrap(await httpClient.get('/api/sales/entry/get', { params }));
    return data;
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/sales/entry/save */
export async function saveSalesEntry(payload) {
  try {
    const data = await unwrap(await httpClient.post('/api/sales/entry/save', payload));
    return data;
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/sales/entry/post */
export async function postSalesEntry(payload) {
  try {
    const data = await unwrap(await httpClient.post('/api/sales/entry/post', payload));
    return data;
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/sales/entry/unpost */
export async function unpostSalesEntry(payload) {
  try {
    const data = await unwrap(await httpClient.post('/api/sales/entry/unpost', payload));
    return data;
  } catch (e) {
    throw apiError(e);
  }
}

/** POST /api/sales/entry/cancel */
export async function cancelSalesEntry(payload) {
  try {
    const data = await unwrap(await httpClient.post('/api/sales/entry/cancel', payload));
    return data;
  } catch (e) {
    throw apiError(e);
  }
}
