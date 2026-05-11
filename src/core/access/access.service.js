const ACCESS_KEYS = {
  subscription: 'session_subscription',
  features: 'session_features',
  limits: 'session_limits',
  permissions: 'session_permissions',
  version: 'session_access_version',
};

function readJson(key, fallback) {
  const raw = sessionStorage.getItem(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function hasKnownFeatureCatalog(features) {
  return features && typeof features === 'object' && Object.keys(features).length > 0;
}

export function persistSessionAccess(session = {}) {
  sessionStorage.setItem(
    ACCESS_KEYS.subscription,
    JSON.stringify(session.subscription ?? null),
  );
  sessionStorage.setItem(ACCESS_KEYS.features, JSON.stringify(session.features ?? {}));
  sessionStorage.setItem(ACCESS_KEYS.limits, JSON.stringify(session.limits ?? {}));
  sessionStorage.setItem(ACCESS_KEYS.permissions, JSON.stringify(session.permissions ?? []));
  if (session.accessVersion != null) {
    sessionStorage.setItem(ACCESS_KEYS.version, String(session.accessVersion));
  }
  window.dispatchEvent(new Event('access:updated'));
}

export function getSessionSubscription() {
  return readJson(ACCESS_KEYS.subscription, null);
}

export function getSessionFeatures() {
  return readJson(ACCESS_KEYS.features, {});
}

export function getSessionLimits() {
  return readJson(ACCESS_KEYS.limits, {});
}

export function getSessionPermissions() {
  return readJson(ACCESS_KEYS.permissions, []);
}

export function getSessionAccessVersion() {
  const raw = sessionStorage.getItem(ACCESS_KEYS.version);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isSubscriptionUsable() {
  const subscription = getSessionSubscription();
  if (!subscription) return true;
  return subscription.isUsable !== false;
}

export function hasAnyFeature(featureCodes) {
  const codes = Array.isArray(featureCodes) ? featureCodes.filter(Boolean) : [featureCodes].filter(Boolean);
  if (!codes.length) return isSubscriptionUsable();
  if (!isSubscriptionUsable()) return false;

  const features = getSessionFeatures();
  if (!hasKnownFeatureCatalog(features)) return true;
  return codes.some((code) => features[code] === true);
}

export function hasAllFeatures(featureCodes) {
  const codes = Array.isArray(featureCodes) ? featureCodes.filter(Boolean) : [featureCodes].filter(Boolean);
  if (!codes.length) return isSubscriptionUsable();
  if (!isSubscriptionUsable()) return false;

  const features = getSessionFeatures();
  if (!hasKnownFeatureCatalog(features)) return true;
  return codes.every((code) => features[code] === true);
}

export function hasFeature(featureCode) {
  return hasAnyFeature([featureCode]);
}

export function hasPermission(permissionCode) {
  if (!isSubscriptionUsable()) return false;
  if (!permissionCode) return true;
  const permissions = getSessionPermissions();
  if (!Array.isArray(permissions) || permissions.length === 0) return false;
  return permissions.includes(permissionCode);
}

export function getLimit(limitCode) {
  const limits = getSessionLimits();
  return limits?.[limitCode] ?? null;
}

export function filterByAccess(items = []) {
  return items
    .map((item) => {
      const hasFeatGate = item.features != null || item.feature != null;
      const hasAllFeatGate = item.allFeatures != null;
      const allowed = hasAllFeatGate
        ? hasAllFeatures(item.allFeatures)
        : hasAnyFeature(item.features ?? item.feature);
      // Explicit feature gate on parent → hard block; skip sub-item processing entirely
      if (!allowed && (hasFeatGate || hasAllFeatGate)) return null;
      const subItems = item.subItems ? filterByAccess(item.subItems) : undefined;
      if (!allowed && (!subItems || subItems.length === 0)) return null;
      if (subItems && subItems.length === 0 && !item.to) return null;
      return { ...item, ...(subItems ? { subItems } : {}) };
    })
    .filter(Boolean);
}
