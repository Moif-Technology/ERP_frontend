import { Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from '../../core/auth/auth.service.js';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  if (location.pathname.startsWith('/super-admin')) {
    return children;
  }
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}
