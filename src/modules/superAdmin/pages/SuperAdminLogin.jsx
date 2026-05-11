import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { platformLogin } from '../api/admin.api';

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await platformLogin(email, password);
      navigate('/super-admin/tenants', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .sal * { box-sizing: border-box; }
        .sal input, .sal button { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .sal input { transition: border-color 150ms, box-shadow 150ms; }
        .sal input:focus {
          outline: none;
          border-color: #4f46e5 !important;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
        }
        .sal .sa-submit { transition: background 150ms; }
        .sal .sa-submit:hover:not(:disabled) { background: #4338ca !important; }
        .sal .sa-submit:disabled { opacity: 0.65; cursor: not-allowed; }
      `}</style>

      <div
        className="sal"
        style={{
          minHeight: '100vh',
          display: 'flex',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          background: '#f8fafc',
        }}
      >
        {/* Left: dark intro panel */}
        <div style={{
          flex: '0 0 400px',
          background: '#0f172a',
          padding: '52px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 52 }}>
              <div style={{
                width: 34, height: 34,
                background: '#4f46e5',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: "'JetBrains Mono', monospace" }}>M</span>
              </div>
              <div>
                <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, letterSpacing: '-0.2px' }}>Moifone</div>
                <div style={{ color: '#475569', fontSize: 11 }}>Control Center</div>
              </div>
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
              Platform admin.
            </h1>
            <p style={{ fontSize: 14, color: '#475569', margin: '0 0 40px', lineHeight: 1.65 }}>
              Manage tenants, subscriptions, features, and usage limits from one place.
            </p>

            <div style={{ display: 'grid', gap: 20 }}>
              {[
                ['Tenants', 'Subscription state, overrides, and audit log per company.'],
                ['Plans', 'Pricing tiers and the features each tier includes.'],
                ['Catalog', 'Define features and limits available to plans.'],
              ].map(([label, desc]) => (
                <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 3, background: '#4f46e5', borderRadius: 2, alignSelf: 'stretch', flexShrink: 0, minHeight: 20 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 11, color: '#334155', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            Restricted access · MOIF ERP v2
          </div>
        </div>

        {/* Right: login form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: '100%', maxWidth: 340 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
              Sign in
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 28px' }}>
              Super admin credentials required.
            </p>

            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={LABEL}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@moiftech.com"
                  required
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={INPUT}
                />
              </div>

              {error && (
                <div style={{ padding: '9px 12px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="sa-submit"
                disabled={loading}
                style={{
                  marginTop: 4,
                  height: 42,
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '-0.1px',
                }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

const LABEL = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#374151',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const INPUT = {
  width: '100%',
  height: 40,
  border: '1.5px solid #e2e8f0',
  borderRadius: 8,
  padding: '0 12px',
  fontSize: 14,
  color: '#0f172a',
  background: '#fff',
};
