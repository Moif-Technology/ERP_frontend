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
    <div style={page}>
      <div style={panel}>
        <div style={left}>
          <div style={brand}>Moifone</div>
          <div style={sub}>Control Center</div>
          <p style={desc}>Manage tenants, subscriptions, features, and limits from one secure admin workspace.</p>
        </div>
        <div style={right}>
          <h2 style={title}>Super Admin Login</h2>
          <form onSubmit={onSubmit} style={form}>
            <label style={label}>Email</label>
            <input
              style={input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
            <label style={label}>Password</label>
            <input
              style={input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
            {error && <div style={errorStyle}>{error}</div>}
            <button style={button} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const page = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #dbeafe 100%)',
  padding: 20,
};
const panel = {
  width: 'min(980px, 96vw)',
  minHeight: 520,
  borderRadius: 14,
  overflow: 'hidden',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  background: '#fff',
  boxShadow: '0 30px 60px rgba(15,23,42,0.35)',
};
const left = {
  background: 'linear-gradient(160deg, #0b1d45 0%, #133d8f 100%)',
  color: '#e8f0ff',
  padding: '56px 48px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};
const right = {
  padding: '56px 48px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};
const brand = { fontSize: 34, fontWeight: 700, letterSpacing: 0 };
const sub = { marginTop: 8, fontSize: 16, color: '#bfd4ff' };
const desc = { marginTop: 24, lineHeight: 1.6, color: '#d6e3ff', maxWidth: 360 };
const title = { margin: 0, marginBottom: 20, color: '#0f1f43' };
const form = { display: 'flex', flexDirection: 'column', gap: 10 };
const label = { fontSize: 13, color: '#455578', fontWeight: 600 };
const input = {
  height: 42,
  border: '1px solid #cbd5e1',
  borderRadius: 10,
  padding: '0 12px',
  fontSize: 14,
};
const errorStyle = {
  color: '#b42318',
  background: '#fee4e2',
  border: '1px solid #fecdca',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 13,
};
const button = {
  marginTop: 8,
  height: 44,
  border: 'none',
  borderRadius: 10,
  background: '#143d8e',
  color: '#fff',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
};
