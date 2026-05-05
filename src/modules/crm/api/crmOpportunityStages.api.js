import httpClient from '../../../services/http/httpClient';

const BASE = '/api/crm/opportunity-stages';

export async function listOpportunityStages() {
  const { data } = await httpClient.get(BASE);
  return data.items || [];
}

export async function createOpportunityStage(payload) {
  const { data } = await httpClient.post(BASE, payload);
  return data;
}

export async function updateOpportunityStage(id, payload) {
  const { data } = await httpClient.put(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteOpportunityStage(id) {
  const { data } = await httpClient.delete(`${BASE}/${id}`);
  return data;
}
