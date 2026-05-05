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

export function requestAccessVersion() {
  return httpClient.get('/api/auth/access/version');
}

export function requestAccessRefresh() {
  return httpClient.get('/api/auth/access/refresh');
}

export function requestWelcomeComplete() {
  return httpClient.post('/api/auth/welcome/complete');
}

export function requestForgotPasswordOtp(usernameOrEmail) {
  return httpClient.post('/api/auth/forgot-password', { usernameOrEmail });
}

export function requestResetPassword({ usernameOrEmail, otp, newPassword }) {
  return httpClient.post('/api/auth/reset-password', { usernameOrEmail, otp, newPassword });
}
