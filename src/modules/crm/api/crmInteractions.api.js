import httpClient from '../../../services/http/httpClient';

const BASE = '/api/crm/interactions';

export async function listInteractions(filters = {}) {
  const { data } = await httpClient.get(BASE, { params: filters });
  return data.items || [];
}

export async function getInteraction(id) {
  const { data } = await httpClient.get(`${BASE}/${id}`);
  return data;
}

export async function createInteraction(payload) {
  const { data } = await httpClient.post(BASE, payload);
  return data;
}

export async function updateInteraction(id, payload) {
  const { data } = await httpClient.put(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteInteraction(id) {
  const { data } = await httpClient.delete(`${BASE}/${id}`);
  return data;
}
