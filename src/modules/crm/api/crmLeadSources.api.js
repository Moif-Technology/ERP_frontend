import httpClient from '../../../services/http/httpClient';

const BASE = '/api/crm/lead-sources';

export async function listLeadSources() {
  const { data } = await httpClient.get(BASE);
  return data.items || [];
}

export async function createLeadSource(payload) {
  const { data } = await httpClient.post(BASE, payload);
  return data;
}

export async function updateLeadSource(id, payload) {
  const { data } = await httpClient.put(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteLeadSource(id) {
  const { data } = await httpClient.delete(`${BASE}/${id}`);
  return data;
}
