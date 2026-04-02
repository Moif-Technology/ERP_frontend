import httpClient from '../../services/http/httpClient.js';
import { SOFTWARE_MODULE_IDS } from '../config/softwareModules.js';

export const SOFTWARE_MODULE_STORAGE_KEY = 'software_module';

export function getSoftwareModule() {
  return sessionStorage.getItem(SOFTWARE_MODULE_STORAGE_KEY) || null;
}

export function setSoftwareModule(moduleId) {
  if (moduleId) sessionStorage.setItem(SOFTWARE_MODULE_STORAGE_KEY, moduleId);
}

/**
 * POST /api/auth/login
 *
 * On success, stores the full session in sessionStorage:
 *   - access_token   : JWT for API calls
 *   - refresh_token  : JWT for refreshing access
 *   - session_user   : user info (staffId, staffName, role, stationId …)
 *   - session_company: company/station info (stationName, address …)
 *   - session_params : system parameters (heading1, softwareType …)
 *
 * sessionStorage clears automatically when the tab or browser is closed — safer for ERP.
 *
 * Returns the full session object { user, company, parameters }.
 */
export async function login(username, password) {
  const { data } = await httpClient.post('/api/auth/login', { username, password });

  sessionStorage.setItem('access_token',    data.accessToken);
  sessionStorage.setItem('refresh_token',   data.refreshToken);
  sessionStorage.setItem('session_user',    JSON.stringify(data.session.user));
  sessionStorage.setItem('session_company', JSON.stringify(data.session.company));
  sessionStorage.setItem('session_params',  JSON.stringify(data.session.parameters));

  return data.session;
}

/**
 * POST /api/auth/logout
 * Clears all tokens and session data from sessionStorage.
 */
export async function logout() {
  try {
    await httpClient.post('/api/auth/logout');
  } finally {
    sessionStorage.clear();
  }
}

/** True when the logged-in software type is back office (full UI available). */
export function isBackofficeModule() {
  const m = getSoftwareModule();
  return !m || m === SOFTWARE_MODULE_IDS.backoffice;
}

/**
 * GET /api/auth/me
 * Returns the current authenticated user from the backend.
 */
export async function getMe() {
  const { data } = await httpClient.get('/api/auth/me');
  return data.user;
}

/**
 * Returns the saved user object from sessionStorage (no network call).
 */
export function getSessionUser() {
  const raw = sessionStorage.getItem('session_user');
  return raw ? JSON.parse(raw) : null;
}

/**
 * Returns the saved company/station object from sessionStorage (no network call).
 */
export function getSessionCompany() {
  const raw = sessionStorage.getItem('session_company');
  return raw ? JSON.parse(raw) : null;
}

/**
 * Returns the saved system parameters from sessionStorage (no network call).
 */
export function getSessionParameters() {
  const raw = sessionStorage.getItem('session_params');
  return raw ? JSON.parse(raw) : null;
}

/**
 * Returns true if a valid access token exists in sessionStorage.
 */
export function isLoggedIn() {
  return !!sessionStorage.getItem('access_token');
}
