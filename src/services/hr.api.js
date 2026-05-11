import httpClient from './http/httpClient.js';

// ── Dashboard ─────────────────────────────────────────
export function getHrDashboardSummary(params) {
  return httpClient.get('/api/hr/dashboard-summary', { params });
}

// ── Employees ─────────────────────────────────────────
export function listHrEmployees(params) {
  return httpClient.get('/api/hr/employees', { params });
}

export function getHrEmployee(employeeId, params) {
  return httpClient.get(`/api/hr/employees/${employeeId}`, { params });
}

export function createHrEmployee(payload) {
  return httpClient.post('/api/hr/employees', payload);
}

export function updateHrEmployee(employeeId, payload) {
  return httpClient.put(`/api/hr/employees/${employeeId}`, payload);
}

export function deleteHrEmployee(employeeId) {
  return httpClient.delete(`/api/hr/employees/${employeeId}`);
}

// ── Shifts ────────────────────────────────────────────
export function listHrShifts(params) {
  return httpClient.get('/api/hr/shifts', { params });
}

export function createHrShift(payload) {
  return httpClient.post('/api/hr/shifts', payload);
}

export function updateHrShift(shiftId, payload) {
  return httpClient.put(`/api/hr/shifts/${shiftId}`, payload);
}

export function deleteHrShift(shiftId) {
  return httpClient.delete(`/api/hr/shifts/${shiftId}`);
}

// ── Leave Types ───────────────────────────────────────
export function listHrLeaveTypes(params) {
  return httpClient.get('/api/hr/leave-types', { params });
}

export function createHrLeaveType(payload) {
  return httpClient.post('/api/hr/leave-types', payload);
}

export function updateHrLeaveType(leaveTypeId, payload) {
  return httpClient.put(`/api/hr/leave-types/${leaveTypeId}`, payload);
}

export function deleteHrLeaveType(leaveTypeId) {
  return httpClient.delete(`/api/hr/leave-types/${leaveTypeId}`);
}

// ── Leave Requests ────────────────────────────────────
export function listHrLeaveRequests(params) {
  return httpClient.get('/api/hr/leave-requests', { params });
}

export function createHrLeaveRequest(payload) {
  return httpClient.post('/api/hr/leave-requests', payload);
}

export function updateHrLeaveRequestStatus(leaveRequestId, payload) {
  return httpClient.patch(`/api/hr/leave-requests/${leaveRequestId}/status`, payload);
}

// ── Attendance ────────────────────────────────────────
export function listHrAttendanceDaily(params) {
  return httpClient.get('/api/hr/attendance/daily', { params });
}

export function createHrAttendance(payload) {
  return httpClient.post('/api/hr/attendance/daily', payload);
}

// ── Document Types ────────────────────────────────────
export function listHrDocumentTypes(params) {
  return httpClient.get('/api/hr/document-types', { params });
}

export function createHrDocumentType(payload) {
  return httpClient.post('/api/hr/document-types', payload);
}

export function deleteHrDocumentType(documentTypeId) {
  return httpClient.delete(`/api/hr/document-types/${documentTypeId}`);
}

// ── Documents / Attachments ───────────────────────────
export function listHrDocuments(employeeId, params) {
  return httpClient.get(`/api/hr/employees/${employeeId}/documents`, { params });
}

export function uploadHrDocument(employeeId, payload) {
  return httpClient.post(`/api/hr/employees/${employeeId}/documents`, payload);
}

export function deleteHrDocument(attachmentId) {
  return httpClient.delete(`/api/hr/documents/${attachmentId}`);
}

// ── Leave Balances ────────────────────────────────────
export function listHrLeaveBalances(employeeId, params) {
  return httpClient.get(`/api/hr/employees/${employeeId}/leave-balances`, { params });
}

// ── Loans ─────────────────────────────────────────────
export function listHrLoans(employeeId, params) {
  return httpClient.get(`/api/hr/employees/${employeeId}/loans`, { params });
}
