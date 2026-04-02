import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../../core/auth/auth.service.js';

export default function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}
