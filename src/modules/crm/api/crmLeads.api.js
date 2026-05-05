import httpClient from '../../../services/http/httpClient';

const BASE = '/api/crm/leads';

export async function listLeads(filters = {}) {
  const params = {};
  if (filters.search) params.search = filters.search;
  if (filters.sourceId) params.sourceId = filters.sourceId;
  if (filters.statusId) params.statusId = filters.statusId;
  if (filters.assignedTo) params.assignedTo = filters.assignedTo;
  if (filters.priority) params.priority = filters.priority;
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  const { data } = await httpClient.get(BASE, { params });
  return data.items || [];
}

export async function getLead(id) {
  const { data } = await httpClient.get(`${BASE}/${id}`);
  return data;
}

export async function createLead(payload) {
  const { data } = await httpClient.post(BASE, payload);
  return data;
}

export async function updateLead(id, payload) {
  const { data } = await httpClient.put(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteLead(id) {
  const { data } = await httpClient.delete(`${BASE}/${id}`);
  return data;
}
