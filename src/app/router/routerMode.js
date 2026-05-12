export function getRouterMode() {
  return shouldUseHashRouter() ? 'hash' : 'browser';
}

export function shouldUseHashRouter() {
  try {
    const mode = String(import.meta.env?.VITE_ROUTER_MODE ?? '').toLowerCase();
    if (mode === 'browser') return false;
    if (mode === 'hash') return true;
    if (window?.location?.protocol === 'file:') return true;
  } catch {
    // fall through to browser routing
  }
  return false;
}

export function routeHref(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!shouldUseHashRouter()) return normalizedPath;
  if (window.location.protocol === 'file:') return `#${normalizedPath}`;
  return `/#${normalizedPath}`;
}

export function redirectToRoute(path) {
  window.location.replace(routeHref(path));
}

export function shouldRedirectToHashUrl() {
  return (
    shouldUseHashRouter() &&
    window.location.protocol !== 'file:' &&
    !window.location.hash &&
    window.location.pathname !== '/'
  );
}

export function currentPathAsHashUrl() {
  const path = `${window.location.pathname}${window.location.search}`;
  return `/#${path.startsWith('/') ? path : `/${path}`}`;
}
