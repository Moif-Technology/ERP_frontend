import httpClient from './http/httpClient.js';

export function listRoles() {
  return httpClient.get('/api/roles');
}

export function createRole(payload) {
  return httpClient.post('/api/roles', payload);
}

export function updateRole(roleId, payload) {
  return httpClient.put(`/api/roles/${roleId}`, payload);
}

export function deactivateRole(roleId) {
  return httpClient.delete(`/api/roles/${roleId}`);
}

export function listPermissionCatalog() {
  return httpClient.get('/api/roles/permissions');
}

export function getRolePermissions(roleId) {
  return httpClient.get(`/api/roles/${roleId}/permissions`);
}

export function updateRolePermissions(roleId, permissionCodes) {
  return httpClient.put(`/api/roles/${roleId}/permissions`, { permissionCodes });
}
