import { Navigate, useLocation } from 'react-router-dom';
import { hasAllFeatures, hasAnyFeature } from './access.service.js';

export default function FeatureGuard({ feature, any, all, children }) {
  const location = useLocation();
  const featureCodes = all ?? any ?? feature;

  if (all ? hasAllFeatures(featureCodes) : hasAnyFeature(featureCodes)) {
    return children;
  }

  return <Navigate to="/locked" replace state={{ from: location.pathname, featureCodes }} />;
}
