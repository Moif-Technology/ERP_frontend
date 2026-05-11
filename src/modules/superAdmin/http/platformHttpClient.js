import axios from 'axios';
import { routeHref } from '../../../app/router/routerMode';

const PLATFORM_KEYS = {
  access: 'platform_access_token',
  refresh: 'platform_refresh_token',
  user: 'platform_user',
  caps: 'platform_capabilities',
};

const platformHttpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

platformHttpClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(PLATFORM_KEYS.access);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

platformHttpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = sessionStorage.getItem(PLATFORM_KEYS.refresh);
      if (!refreshToken) {
        clearPlatformSession();
        window.location.href = routeHref('/super-admin/login');
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/auth/refresh`,
          { refreshToken }
        );
        sessionStorage.setItem(PLATFORM_KEYS.access, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return platformHttpClient(original);
      } catch {
        clearPlatformSession();
        window.location.href = routeHref('/super-admin/login');
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export function persistPlatformSession({ accessToken, refreshToken, user, capabilities }) {
  sessionStorage.setItem(PLATFORM_KEYS.access, accessToken);
  sessionStorage.setItem(PLATFORM_KEYS.refresh, refreshToken);
  sessionStorage.setItem(PLATFORM_KEYS.user, JSON.stringify(user || null));
  sessionStorage.setItem(PLATFORM_KEYS.caps, JSON.stringify(capabilities || []));
}

export function clearPlatformSession() {
  sessionStorage.removeItem(PLATFORM_KEYS.access);
  sessionStorage.removeItem(PLATFORM_KEYS.refresh);
  sessionStorage.removeItem(PLATFORM_KEYS.user);
  sessionStorage.removeItem(PLATFORM_KEYS.caps);
}

export function getPlatformUser() {
  const raw = sessionStorage.getItem(PLATFORM_KEYS.user);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function getPlatformCapabilities() {
  const raw = sessionStorage.getItem(PLATFORM_KEYS.caps);
  if (!raw) return [];
  try { return JSON.parse(raw) || []; } catch { return []; }
}

export function hasCapability(code) {
  return getPlatformCapabilities().includes(code);
}

export function isPlatformAuthed() {
  return Boolean(sessionStorage.getItem(PLATFORM_KEYS.access));
}

export default platformHttpClient;
