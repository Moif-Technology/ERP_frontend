import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../../api/auth/auth.service.js';

export default function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}
