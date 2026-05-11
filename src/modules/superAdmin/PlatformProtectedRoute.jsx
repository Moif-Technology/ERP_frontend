import React from 'react';
import { Navigate } from 'react-router-dom';
import { isPlatformAuthed } from './http/platformHttpClient';

export default function PlatformProtectedRoute({ children }) {
  if (!isPlatformAuthed()) {
    return <Navigate to="/super-admin/login" replace />;
  }
  return children;
}
