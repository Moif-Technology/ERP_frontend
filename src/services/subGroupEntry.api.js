import httpClient from './http/httpClient.js';

export function fetchSubGroups(branchId, groupId) {
  const params = { branchId };
  if (groupId != null && groupId !== '') {
    params.groupId = groupId;
  }
  return httpClient.get('/api/sub-groups', { params });
}

export function createSubGroup(payload) {
  return httpClient.post('/api/sub-groups', payload);
}
