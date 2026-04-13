import { Navigate } from 'react-router-dom';
import { isLoggedIn, getWelcomeState } from '../../core/auth/auth.service.js';

export default function PublicRoute({ children }) {
  if (!isLoggedIn()) return children;
  const to = getWelcomeState().show ? '/welcome' : '/dashboard';
  return <Navigate to={to} replace />;
}
