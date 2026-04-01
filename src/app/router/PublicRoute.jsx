import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../../core/auth/auth.service.js';

export default function PublicRoute({ children }) {
  return isLoggedIn() ? <Navigate to="/dashboard" replace /> : children;
}
