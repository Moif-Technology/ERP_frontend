import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../../api/auth/auth.service.js';

export default function PublicRoute({ children }) {
  return isLoggedIn() ? <Navigate to="/dashboard" replace /> : children;
}
