import * as authApi from './auth.api.js';
import { getSessionAccessVersion, persistSessionAccess } from '../access/access.service.js';

/**
 * Persists tokens and session from POST /api/auth/login (same credentials for every tenant:
 * login_name or email + password from registration).
 *
 * sessionStorage clears when the tab closes.
 */
export async function login(username, password) {
  const { data } = await authApi.requestLogin(username, password);

  sessionStorage.setItem('access_token', data.accessToken);
  sessionStorage.setItem('refresh_token', data.refreshToken);
  sessionStorage.setItem('session_user', JSON.stringify(data.session.user));
  sessionStorage.setItem('session_company', JSON.stringify(data.session.company));
  persistSessionAccess({ ...data.session, accessVersion: data.session?.accessVersion ?? 0 });
  if (data.session.welcome != null) {
    sessionStorage.setItem('session_welcome', JSON.stringify(data.session.welcome));
  } else {
    sessionStorage.removeItem('session_welcome');
  }

  return data.session;
}

export async function logout() {
  try {
    await authApi.requestLogout();
  } finally {
    sessionStorage.clear();
  }
}

/**
 * Calls POST /api/auth/logout, clears session storage, then navigates to login (if `navigate` is passed).
 */
export async function signOut(navigate) {
  await logout();
  if (typeof navigate === 'function') {
    navigate('/login', { replace: true });
  }
}

export async function getMe() {
  const { data } = await authApi.requestMe();
  if (data.session) {
    sessionStorage.setItem('session_user', JSON.stringify(data.session.user));
    sessionStorage.setItem('session_company', JSON.stringify(data.session.company));
    persistSessionAccess({ ...data.session, accessVersion: data.session?.accessVersion ?? 0 });
  }
  return data.user;
}

export async function syncAccessIfChanged() {
  const { data: versionRes } = await authApi.requestAccessVersion();
  const serverVersion = Number(versionRes?.version || 0);
  const localVersion = getSessionAccessVersion();

  if (serverVersion <= localVersion) {
    return { changed: false, version: localVersion };
  }

  const { data: refreshRes } = await authApi.requestAccessRefresh();
  const access = refreshRes?.access || {};
  persistSessionAccess({
    subscription: access.subscription ?? null,
    features: access.features ?? {},
    limits: access.limits ?? {},
    permissions: access.permissions ?? [],
    accessVersion: serverVersion,
  });
  return { changed: true, version: serverVersion };
}

export function getSessionUser() {
  const raw = sessionStorage.getItem('session_user');
  return raw ? JSON.parse(raw) : null;
}

export function getSessionCompany() {
  const raw = sessionStorage.getItem('session_company');
  return raw ? JSON.parse(raw) : null;
}

/** First-login welcome payload from login/register; `show: true` until skipped/completed. */
export function getWelcomeState() {
  const raw = sessionStorage.getItem('session_welcome');
  if (!raw) return { show: false };
  try {
    const w = JSON.parse(raw);
    if (w && typeof w === 'object' && typeof w.show === 'boolean') return w;
  } catch {
    /* ignore */
  }
  return { show: false };
}

export function dismissWelcomeLocally() {
  sessionStorage.setItem('session_welcome', JSON.stringify({ show: false }));
}

export async function completeWelcomeOnServer() {
  await authApi.requestWelcomeComplete();
  dismissWelcomeLocally();
}

export function isLoggedIn() {
  return !!sessionStorage.getItem('access_token');
}
