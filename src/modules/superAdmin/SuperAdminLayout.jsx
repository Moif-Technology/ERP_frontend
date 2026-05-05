import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearPlatformSession, getPlatformUser } from './http/platformHttpClient';

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const user = getPlatformUser();

  function logout() {
    clearPlatformSession();
    navigate('/super-admin/login', { replace: true });
  }

  return (
    <div style={shell}>
      <aside style={sidebar}>
        <div style={brandWrap}>
          <div style={brandTitle}>Moifone Control</div>
          <div style={brandSub}>Super Admin</div>
        </div>
        <nav style={nav}>
          <NavItem to="/super-admin/tenants" label="Tenants" />
          <NavItem to="/super-admin/catalog/plans" label="Plans" />
          <NavItem to="/super-admin/catalog/features" label="Features" />
          <NavItem to="/super-admin/catalog/limits" label="Limits" />
        </nav>
        <div style={footer}>
          <div style={userEmail}>{user?.email || 'platform user'}</div>
          <button onClick={logout} style={logoutBtn}>Sign out</button>
        </div>
      </aside>
      <main style={main}>
        <div style={topBar}>
          <h1 style={pageTitle}>Super Admin Workspace</h1>
          <div style={pill}>Production controls</div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...navLink,
        ...(isActive ? navLinkActive : null),
      })}
    >
      {label}
    </NavLink>
  );
}

const shell = {
  display: 'flex',
  minHeight: '100vh',
  background: '#f3f6fb',
};
const sidebar = {
  width: 250,
  background: '#071533',
  color: '#fff',
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
};
const brandWrap = {
  marginBottom: 18,
  borderBottom: '1px solid rgba(255,255,255,0.12)',
  paddingBottom: 14,
};
const brandTitle = { fontSize: 18, fontWeight: 700 };
const brandSub = { fontSize: 12, color: '#a9c1f5', marginTop: 4 };
const nav = { display: 'flex', flexDirection: 'column', gap: 8 };
const navLink = {
  color: '#dbe8ff',
  textDecoration: 'none',
  padding: '10px 12px',
  borderRadius: 8,
  fontSize: 14,
};
const navLinkActive = {
  background: '#0f2b65',
  color: '#fff',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
};
const footer = {
  marginTop: 'auto',
  borderTop: '1px solid rgba(255,255,255,0.12)',
  paddingTop: 12,
};
const userEmail = { fontSize: 12, color: '#9ab2e5', marginBottom: 8 };
const logoutBtn = {
  width: '100%',
  border: '1px solid #4062a3',
  background: '#0e234d',
  color: '#fff',
  borderRadius: 8,
  padding: '8px 10px',
  cursor: 'pointer',
};
const main = { flex: 1, padding: 24 };
const topBar = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 18,
};
const pageTitle = { margin: 0, fontSize: 24, color: '#10213f' };
const pill = {
  fontSize: 12,
  padding: '6px 10px',
  borderRadius: 999,
  border: '1px solid #cdd8ee',
  background: '#fff',
  color: '#425880',
};
