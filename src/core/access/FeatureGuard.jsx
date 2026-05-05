import { Navigate, useLocation } from 'react-router-dom';
import { hasAnyFeature } from './access.service.js';

export default function FeatureGuard({ feature, any, children }) {
  const location = useLocation();
  const featureCodes = any ?? feature;

  if (hasAnyFeature(featureCodes)) {
    return children;
  }

  return <Navigate to="/locked" replace state={{ from: location.pathname, featureCodes }} />;
}
