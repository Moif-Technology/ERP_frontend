import React from 'react';
import { hasPermission, hasFeature } from '../../../core/access/access.service';

export function PermissionGate({
  permission,
  feature,
  fallback = null,
  children,
}) {
  if (feature && !hasFeature(feature)) return fallback;
  if (permission && !hasPermission(permission)) return fallback;
  return children;
}

export function useCanDo({ permission, feature } = {}) {
  if (feature && !hasFeature(feature)) return false;
  if (permission && !hasPermission(permission)) return false;
  return true;
}

export function disabledIfNoAccess({ permission, feature } = {}) {
  if (feature && !hasFeature(feature)) {
    return { disabled: true, title: 'Feature not enabled for your subscription' };
  }
  if (permission && !hasPermission(permission)) {
    return { disabled: true, title: 'You do not have permission for this action' };
  }
  return { disabled: false };
}

export default PermissionGate;
