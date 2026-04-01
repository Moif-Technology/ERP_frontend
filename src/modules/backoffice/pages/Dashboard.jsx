import React from 'react';
import { colors } from '../../../shared/constants/theme';

export default function Dashboard() {
  return (
    <div style={{ padding: '32px 40px', background: '#f9fafb' }}>
      <h1 style={{ 
        color: colors.primary?.DEFAULT || '#800000', 
        fontSize: '2.5rem',
        marginBottom: '24px',
        fontWeight: 700
      }}>
        MOIF  – Dashboard
      </h1>
      
    </div>
  );
}