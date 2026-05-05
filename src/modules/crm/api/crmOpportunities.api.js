import httpClient from '../../../services/http/httpClient';

const BASE = '/api/crm/opportunities';

export async function listOpportunities(filters = {}) {
  const { data } = await httpClient.get(BASE, { params: filters });
  return data.items || [];
}

export async function getOpportunity(id) {
  const { data } = await httpClient.get(`${BASE}/${id}`);
  return data;
}

export async function createOpportunity(payload) {
  const { data } = await httpClient.post(BASE, payload);
  return data;
}

export async function updateOpportunity(id, payload) {
  const { data } = await httpClient.put(`${BASE}/${id}`, payload);
  return data;
}

export async function setOpportunityStatus(id, payload) {
  const { data } = await httpClient.patch(`${BASE}/${id}/status`, payload);
  return data;
}

export async function deleteOpportunity(id) {
  const { data } = await httpClient.delete(`${BASE}/${id}`);
  return data;
}
