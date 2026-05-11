import httpClient from '../../../services/http/httpClient';

const BASE = '/api/crm/notes';

export async function listNotes(filters = {}) {
  const { data } = await httpClient.get(BASE, { params: filters });
  return data.items || [];
}

export async function createNote(payload) {
  const { data } = await httpClient.post(BASE, payload);
  return data;
}

export async function updateNote(id, payload) {
  const { data } = await httpClient.put(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteNote(id) {
  const { data } = await httpClient.delete(`${BASE}/${id}`);
  return data;
}
