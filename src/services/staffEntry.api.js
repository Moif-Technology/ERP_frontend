import httpClient from './http/httpClient.js';

export function fetchStaffBranches() {
  return httpClient.get('/api/staff/branches');
}

/** Company staff list (staff_id, name) — salesman dropdown, etc. */
export function listStaffMembers(params) {
  return httpClient.get('/api/staff/members', { params });
}

export function createStaffMember(payload) {
  return httpClient.post('/api/staff', payload);
}

export function fetchStaffRoles() {
  return httpClient.get('/api/roles');
}

export function updateStaffRole(staffId, roleId) {
  return httpClient.patch(`/api/staff/members/${staffId}/role`, { roleId });
}
