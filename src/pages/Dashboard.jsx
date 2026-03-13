import React from 'react';
import { colors } from '../constants/theme';

export default function Dashboard() {
  return (
    <div style={{ padding: '32px 40px', background: '#f9fafb' }}>
      <h1 style={{ 
        color: colors.primary?.DEFAULT || '#800000', 
        fontSize: '2.5rem',
        marginBottom: '24px',
        fontWeight: 700
      }}>
        MOIF Back Office – Dashboard
      </h1>

      <div style={{
        background: 'white',
        padding: '28px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        maxWidth: '900px'
      }}>
        <h2 style={{ color: '#0000C0', marginBottom: '16px' }}>
          Welcome, Administrator
        </h2>
        
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#444' }}>
          This is your main control panel.<br />
          From here you can access:
        </p>

        <ul style={{ marginTop: '20px', paddingLeft: '24px', fontSize: '1.05rem' }}>
          <li>Products & Item Management</li>
          <li>Stock & Inventory Hub</li>
          <li>Sales & Procurement</li>
          <li>Financial Reports</li>
          <li>Configuration & Tools</li>
        </ul>

        <div style={{ marginTop: '32px', color: '#666' }}>
          <strong>Quick tip:</strong> Click any item in the left sidebar to begin.
        </div>
      </div>
    </div>
  );
}