import { Routes, Route } from 'react-router-dom';
import Layout from '../core/layout/Layout';
import AppRoutes from './router/AppRoutes';
import Login from '../modules/backoffice/pages/Login';
import ForgotPassword from '../modules/backoffice/pages/ForgotPassword';
import WelcomeSetup from '../modules/backoffice/pages/WelcomeSetup';
import ProtectedRoute from './router/ProtectedRoute';
import PublicRoute from './router/PublicRoute';
import WelcomeGate from './router/WelcomeGate';

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/welcome"
        element={
          <ProtectedRoute>
            <WelcomeSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <WelcomeGate>
              <Layout>
                <AppRoutes />
              </Layout>
            </WelcomeGate>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
