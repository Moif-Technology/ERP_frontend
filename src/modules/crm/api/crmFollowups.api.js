import httpClient from '../../../services/http/httpClient';

const BASE = '/api/crm/followups';

export async function listFollowups(filters = {}) {
  const { data } = await httpClient.get(BASE, { params: filters });
  return data.items || [];
}

export async function getFollowup(id) {
  const { data } = await httpClient.get(`${BASE}/${id}`);
  return data;
}

export async function createFollowup(payload) {
  const { data } = await httpClient.post(BASE, payload);
  return data;
}

export async function updateFollowup(id, payload) {
  const { data } = await httpClient.put(`${BASE}/${id}`, payload);
  return data;
}

export async function completeFollowup(id, payload = {}) {
  const { data } = await httpClient.patch(`${BASE}/${id}/complete`, payload);
  return data;
}

export async function deleteFollowup(id) {
  const { data } = await httpClient.delete(`${BASE}/${id}`);
  return data;
}
