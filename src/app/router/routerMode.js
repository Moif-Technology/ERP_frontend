export function getRouterMode() {
  const configuredMode = String(import.meta.env?.VITE_ROUTER_MODE ?? '').toLowerCase();
  if (configuredMode === 'browser' || configuredMode === 'hash') return configuredMode;

  try {
    return window.location.protocol === 'file:' ? 'hash' : 'browser';
  } catch {
    return 'hash';
  }
}

export function routeHref(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return getRouterMode() === 'hash' ? `#${normalizedPath}` : normalizedPath;
}
