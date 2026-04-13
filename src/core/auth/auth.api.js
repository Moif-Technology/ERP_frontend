import httpClient from '../../services/http/httpClient.js';

/**
 * HTTP-only layer for unified API auth routes. No sessionStorage — use auth.service.js.
 */
export function requestLogin(username, password) {
  return httpClient.post('/api/auth/login', { username, password });
}

export function requestLogout() {
  return httpClient.post('/api/auth/logout');
}

export function requestMe() {
  return httpClient.get('/api/auth/me');
}

export function requestWelcomeComplete() {
  return httpClient.post('/api/auth/welcome/complete');
}
