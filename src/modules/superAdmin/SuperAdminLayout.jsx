import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearPlatformSession, getPlatformUser } from './http/platformHttpClient';

const SA_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  .sa * { box-sizing: border-box; }
  .sa input, .sa select, .sa textarea, .sa button { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
  .sa input:focus, .sa select:focus, .sa textarea:focus {
    outline: none !important;
    border-color: #4f46e5 !important;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.1) !important;
  }
  .sa button, .sa a { transition: background 120ms, border-color 120ms, color 120ms, opacity 120ms; }
  .sa input, .sa select, .sa textarea { transition: border-color 150ms, box-shadow 150ms; }
  .sa .sa-btn-primary:hover:not(:disabled) { background: #4338ca !important; }
  .sa .sa-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .sa .sa-btn-ghost:hover:not(:disabled) { background: #f1f5f9 !important; }
  .sa .sa-btn-ghost:disabled { opacity: 0.6; cursor: not-allowed; }
  .sa .sa-btn-danger:hover:not(:disabled) { background: #fff1f2 !important; border-color: #fca5a5 !important; }
  .sa .sa-btn-warn:hover:not(:disabled) { background: #fefce8 !important; border-color: #fde047 !important; }
  .sa .sa-btn-danger:disabled, .sa .sa-btn-warn:disabled { opacity: 0.6; cursor: not-allowed; }
  .sa .sa-btn-indigo-ghost:hover:not(:disabled) { background: #eef2ff !important; border-color: #818cf8 !important; }
  .sa .sa-btn-indigo-ghost:disabled { opacity: 0.6; cursor: not-allowed; }
  .sa .sa-nav-link:hover { background: rgba(255,255,255,0.07) !important; color: #e2e8f0 !important; }
  .sa .sa-logout:hover { background: rgba(255,255,255,0.1) !important; color: #e2e8f0 !important; }
  .sa .sa-tr:hover > td { background: #f8fafc !important; }
  .sa .sa-plan-item:hover { border-color: #a5b4fc !important; background: #f5f3ff !important; }
  .sa .sa-toggle { cursor: pointer; transition: background 150ms; }
  .sa .sa-toggle-thumb { transition: left 150ms; }
  .sa .sa-toggle:disabled { opacity: 0.5; cursor: not-allowed; }
  .sa .sa-toggle:focus { outline: none; box-shadow: 0 0 0 2px rgba(79,70,229,0.4); border-radius: 999px; }
  .sa .sa-feature-row:hover { background: #f8fafc !important; }
  .sa .sa-tab:hover { color: #475569 !important; }
  .sa .sa-link-btn { background: none; border: none; padding: 0; cursor: pointer; transition: color 120ms; }
  .sa .sa-link-btn:hover { color: #4338ca !important; }
  .sa .sa-mini-btn:hover:not(:disabled) { background: #eef2ff !important; border-color: #818cf8 !important; }
  .sa .sa-plan-item-active { border-color: #4f46e5 !important; background: #eef2ff !important; }
`;

const NAV_ITEMS = [
  {
    to: '/super-admin/tenants',
    label: 'Tenants',
    icon: (active) => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? '#a5b4fc' : '#4b5563'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9M15 21V9" />
      </svg>
    ),
  },
  {
    to: '/super-admin/catalog/plans',
    label: 'Plans',
    icon: (active) => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? '#a5b4fc' : '#4b5563'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    to: '/super-admin/catalog/features',
    label: 'Features',
    icon: (active) => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? '#a5b4fc' : '#4b5563'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    to: '/super-admin/catalog/limits',
    label: 'Limits',
    icon: (active) => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? '#a5b4fc' : '#4b5563'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    ),
  },
];

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const user = getPlatformUser();

  function logout() {
    clearPlatformSession();
    navigate('/super-admin/login', { replace: true });
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SA_CSS }} />
      <div
        className="sa"
        style={{
          display: 'flex',
          minHeight: '100vh',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          background: '#f8fafc',
        }}
      >
        {/* Sidebar */}
        <aside style={{
          width: 220,
          flexShrink: 0,
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}>
          {/* Brand */}
          <div style={{ padding: '18px 14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32,
                background: '#4f46e5',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>M</span>
              </div>
              <div>
                <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13, letterSpacing: '-0.2px' }}>Moifone</div>
                <div style={{ color: '#475569', fontSize: 10 }}>Control Center</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: '10px 8px', flex: 1, overflowY: 'auto' }}>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              color: '#334155',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '4px 6px 10px',
            }}>
              Management
            </div>
            {NAV_ITEMS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className="sa-nav-link"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '7px 8px',
                  borderRadius: 7,
                  marginBottom: 1,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  color: isActive ? '#e2e8f0' : '#6b7280',
                  background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                })}
              >
                {({ isActive }) => (
                  <>
                    {icon(isActive)}
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User footer */}
          <div style={{ padding: '12px 14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{
              fontSize: 11,
              color: '#475569',
              marginBottom: 8,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user?.email || 'platform user'}
            </div>
            <button
              onClick={logout}
              className="sa-logout"
              style={{
                width: '100%',
                padding: '6px 8px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 7,
                color: '#6b7280',
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0, padding: '28px 32px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
