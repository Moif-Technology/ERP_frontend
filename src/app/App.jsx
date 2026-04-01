import { Routes, Route } from 'react-router-dom';
import Layout from '../core/layout/Layout';
import AppRoutes from './router/AppRoutes';
import Login from '../modules/backoffice/pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <Layout>
            <AppRoutes />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
