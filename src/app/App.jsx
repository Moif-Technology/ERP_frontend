import { Routes, Route } from 'react-router-dom';
import Layout from '../core/layout/Layout';
import AppRoutes from './router/AppRoutes';
import Login from '../modules/backoffice/pages/Login';
import ForgotPassword from '../modules/backoffice/pages/ForgotPassword';
import WelcomeSetup from '../modules/backoffice/pages/WelcomeSetup';
import ProtectedRoute from './router/ProtectedRoute';
import PublicRoute from './router/PublicRoute';
import WelcomeGate from './router/WelcomeGate';
import PlatformProtectedRoute from '../modules/superAdmin/PlatformProtectedRoute.jsx';
import SuperAdminLayout from '../modules/superAdmin/SuperAdminLayout.jsx';
import SuperAdminLogin from '../modules/superAdmin/pages/SuperAdminLogin.jsx';
import TenantsListPage from '../modules/superAdmin/pages/TenantsListPage.jsx';
import TenantDetailPage from '../modules/superAdmin/pages/TenantDetailPage.jsx';
import FeatureCatalogPage from '../modules/superAdmin/pages/FeatureCatalogPage.jsx';
import LimitCatalogPage from '../modules/superAdmin/pages/LimitCatalogPage.jsx';
import PlanCatalogPage from '../modules/superAdmin/pages/PlanCatalogPage.jsx';

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
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />
      <Route
        path="/super-admin"
        element={
          <PlatformProtectedRoute>
            <SuperAdminLayout />
          </PlatformProtectedRoute>
        }
      >
        <Route index element={<TenantsListPage />} />
        <Route path="tenants" element={<TenantsListPage />} />
        <Route path="tenants/:companyId" element={<TenantDetailPage />} />
        <Route path="catalog/features" element={<FeatureCatalogPage />} />
        <Route path="catalog/limits" element={<LimitCatalogPage />} />
        <Route path="catalog/plans" element={<PlanCatalogPage />} />
      </Route>
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
