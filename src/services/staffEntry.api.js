import httpClient from './http/httpClient.js';

export function fetchStaffBranches() {
  return httpClient.get('/api/staff/branches');
}

export function createStaffMember(payload) {
  return httpClient.post('/api/staff', payload);
}
