import { Routes, Route } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import AppRoutes from './Routes';
import Login from './pages/Login';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <Layout>
          <AppRoutes />
        </Layout>
      } />
    </Routes>
  );
}

export default App;
