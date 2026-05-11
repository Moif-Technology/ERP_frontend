import httpClient from './http/httpClient.js';

export function listProducts(params) {
  return httpClient.get('/api/products', { params });
}

export function fetchProducts(branchId) {
  return listProducts(branchId ? { branchId } : undefined);
}

export function createProduct(payload) {
  return httpClient.post('/api/products', payload);
}


/**
 * Fetch a single product for editing.
 * productId  — the numeric product_id (comes from URL query param)
 * branchId   — needed to find the correct product_inventory row
 */
export function fetchProductById(productId, branchId) {
  return httpClient.get(`/api/products/${productId}`, {
    params: branchId ? { branchId } : undefined,
  });
}
 
/**
 * Update an existing product master + inventory.
 * productId  — the numeric product_id
 * payload    — same shape as createProduct payload
 */
export function updateProduct(productId, payload) {
  return httpClient.put(`/api/products/${productId}`, payload);
}