import httpClient from '../../../services/http/httpClient';

const BASE = '/api/crm/lead-statuses';

export async function listLeadStatuses() {
  const { data } = await httpClient.get(BASE);
  return data.items || [];
}

export async function createLeadStatus(payload) {
  const { data } = await httpClient.post(BASE, payload);
  return data;
}

export async function updateLeadStatus(id, payload) {
  const { data } = await httpClient.put(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteLeadStatus(id) {
  const { data } = await httpClient.delete(`${BASE}/${id}`);
  return data;
}
