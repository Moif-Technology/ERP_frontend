import httpClient from '../../../services/http/httpClient';

const BASE = '/api/garage/job-cards';

export async function listJobCards(filters = {}) {
  const params = {};
  if (filters.search) params.q = filters.search;
  const { data } = await httpClient.get(BASE, { params });
  return data.jobCards || [];
}

export async function getJobCard(id) {
  const { data } = await httpClient.get(`${BASE}/${id}`);
  return data;
}

export async function createJobCard(payload) {
  const { data } = await httpClient.post(BASE, payload);
  return data;
}

export async function updateJobCard(id, payload) {
  const { data } = await httpClient.put(`${BASE}/${id}`, payload);
  return data;
}

export async function postJobCard(id) {
  const { data } = await httpClient.patch(`${BASE}/${id}/post`);
  return data;
}

export async function unpostJobCard(id) {
  const { data } = await httpClient.patch(`${BASE}/${id}/unpost`);
  return data;
}
