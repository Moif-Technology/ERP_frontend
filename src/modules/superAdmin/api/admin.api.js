import platformHttpClient, { persistPlatformSession } from '../http/platformHttpClient';

export async function platformLogin(email, password) {
  const { data } = await platformHttpClient.post('/api/admin/auth/login', { email, password });
  persistPlatformSession(data);
  return data;
}

export async function fetchPlatformMe() {
  const { data } = await platformHttpClient.get('/api/admin/auth/me');
  return data;
}

export async function listTenants(params = {}) {
  const { data } = await platformHttpClient.get('/api/admin/tenants', { params });
  return data.tenants;
}

export async function getTenant(companyId) {
  const { data } = await platformHttpClient.get(`/api/admin/tenants/${companyId}`);
  return data;
}

export async function patchSubscription(companyId, patch) {
  const { data } = await platformHttpClient.patch(
    `/api/admin/tenants/${companyId}/subscription`,
    patch
  );
  return data.subscription;
}

export async function setFeatureOverride(companyId, body) {
  const { data } = await platformHttpClient.put(
    `/api/admin/tenants/${companyId}/features`,
    body
  );
  return data.override;
}

export async function clearFeatureOverride(companyId, featureCode) {
  const { data } = await platformHttpClient.delete(
    `/api/admin/tenants/${companyId}/features/${encodeURIComponent(featureCode)}`
  );
  return data;
}

export async function setLimitOverride(companyId, body) {
  const { data } = await platformHttpClient.put(
    `/api/admin/tenants/${companyId}/limits`,
    body
  );
  return data.override;
}

export async function clearLimitOverride(companyId, limitCode) {
  const { data } = await platformHttpClient.delete(
    `/api/admin/tenants/${companyId}/limits/${encodeURIComponent(limitCode)}`
  );
  return data;
}

export async function suspendTenant(companyId, reason) {
  const { data } = await platformHttpClient.post(
    `/api/admin/tenants/${companyId}/suspend`,
    { reason }
  );
  return data.subscription;
}

export async function reactivateTenant(companyId) {
  const { data } = await platformHttpClient.post(
    `/api/admin/tenants/${companyId}/reactivate`,
    {}
  );
  return data.subscription;
}

export async function extendTrial(companyId, days) {
  const { data } = await platformHttpClient.post(
    `/api/admin/tenants/${companyId}/extend-trial`,
    { days }
  );
  return data.subscription;
}

export async function listCatalogFeatures() {
  const { data } = await platformHttpClient.get('/api/admin/catalog/features');
  return data.features;
}
export async function upsertCatalogFeature(body) {
  const { data } = await platformHttpClient.put('/api/admin/catalog/features', body);
  return data.feature;
}
export async function listCatalogLimits() {
  const { data } = await platformHttpClient.get('/api/admin/catalog/limits');
  return data.limits;
}
export async function upsertCatalogLimit(body) {
  const { data } = await platformHttpClient.put('/api/admin/catalog/limits', body);
  return data.limit;
}
export async function listCatalogPlans() {
  const { data } = await platformHttpClient.get('/api/admin/catalog/plans');
  return data.plans;
}
export async function upsertCatalogPlan(body) {
  const { data } = await platformHttpClient.put('/api/admin/catalog/plans', body);
  return data.plan;
}
export async function listPlanFeatures(planCode) {
  const { data } = await platformHttpClient.get(`/api/admin/catalog/plans/${planCode}/features`);
  return data.features;
}
export async function setPlanFeature(planCode, featureCode, isEnabled) {
  const { data } = await platformHttpClient.put(`/api/admin/catalog/plans/${planCode}/features`, { featureCode, isEnabled });
  return data.planFeature;
}
export async function listPlanLimits(planCode) {
  const { data } = await platformHttpClient.get(`/api/admin/catalog/plans/${planCode}/limits`);
  return data.limits;
}
export async function setPlanLimit(planCode, limitCode, limitValue) {
  const { data } = await platformHttpClient.put(`/api/admin/catalog/plans/${planCode}/limits`, { limitCode, limitValue });
  return data.planLimit;
}

export async function fetchAuditLog(companyId, params = {}) {
  const { data } = await platformHttpClient.get(
    `/api/admin/tenants/${companyId}/audit`,
    { params }
  );
  return data.entries;
}
