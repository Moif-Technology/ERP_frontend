import { Navigate, useLocation } from 'react-router-dom';
import { getWelcomeState } from '../../core/auth/auth.service.js';

/**
 * Sends users to /welcome until first-login plan screen is completed (server + local state).
 */
export default function WelcomeGate({ children }) {
  const { pathname } = useLocation();
  if (getWelcomeState().show && pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }
  return children;
}
