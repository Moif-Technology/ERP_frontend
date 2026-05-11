import httpClient from '../../../services/http/httpClient';

const BASE = '/api/garage/pre-job-cards';

export async function listPreJobCards(filters = {}) {
  const params = {};
  if (filters.search) params.q = filters.search;
  const { data } = await httpClient.get(BASE, { params });
  return data.preJobCards || [];
}

export async function getPreJobCard(id) {
  const { data } = await httpClient.get(`${BASE}/${id}`);
  return data;
}

export async function searchPreJobCardByRegNo(regNo) {
  const { data } = await httpClient.get(`${BASE}/search`, { params: { regNo } });
  return data.preJobCard;
}

export async function createPreJobCard(payload) {
  const { data } = await httpClient.post(BASE, payload);
  return data;
}

export async function updatePreJobCard(id, payload) {
  const { data } = await httpClient.put(`${BASE}/${id}`, payload);
  return data;
}
