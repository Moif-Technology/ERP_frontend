import httpClient from '../../../services/http/httpClient';

const BASE = '/api/garage/estimations';

export async function listEstimations(filters = {}) {
  const params = {};
  if (filters.search) params.q = filters.search;
  const { data } = await httpClient.get(BASE, { params });
  return data.estimations || [];
}

export async function getEstimation(id) {
  const { data } = await httpClient.get(`${BASE}/${id}`);
  return data;
}

export async function createEstimation(payload) {
  const { data } = await httpClient.post(BASE, payload);
  return data;
}

export async function updateEstimation(id, payload) {
  const { data } = await httpClient.put(`${BASE}/${id}`, payload);
  return data;
}

export async function postEstimation(id) {
  const { data } = await httpClient.patch(`${BASE}/${id}/post`);
  return data;
}

export async function unpostEstimation(id) {
  const { data } = await httpClient.patch(`${BASE}/${id}/unpost`);
  return data;
}
