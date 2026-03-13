import React from 'react';
import { colors } from '../constants/theme';

export default function ProductList() {
  return (
    <div style={{ padding: '32px 40px' }}>
      <h1 style={{ 
        color: colors.primary?.DEFAULT || '#800000', 
        fontSize: '2.2rem',
        marginBottom: '28px'
      }}>
        Products / Item Management
      </h1>

      {/* Temporary pink tab simulation */}
      <div style={{
        background: colors.primary?.[50] || '#fdf2f2',
        borderBottom: '2px solid #d1a8a8',
        padding: '12px 0',
        marginBottom: '32px',
        display: 'flex',
        gap: '4px',
        overflowX: 'auto',
      }}>
        {['Product', 'Quotation', 'Delivery Order', 'Sale', 'Sale Return'].map((tab, i) => (
          <button
            key={tab}
            style={{
              padding: '10px 24px',
              background: i === 0 ? colors.primary.DEFAULT : 'transparent',
              color: i === 0 ? 'white' : colors.primary.DEFAULT,
              border: 'none',
              fontWeight: i === 0 ? 600 : 500,
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
        minHeight: '500px'
      }}>
        <h2 style={{ color: colors.accent?.DEFAULT || '#0000C0', marginBottom: '20px' }}>
          Item Details – Placeholder
        </h2>

        <p style={{ color: '#555', lineHeight: 1.7 }}>
          Here you will see:<br />
          • Product Code, Description, Brand, Group<br />
          • Packing details, Re-order level<br />
          • Pricing (Min, Unit, Selling, Margin %)<br />
          • Multi-location stock table<br />
          • Alternative products<br />
          • Procurement / Revenue / Purchase logs below
        </p>

        <div style={{ marginTop: '40px', color: '#777', fontStyle: 'italic' }}>
          (Form fields + tables coming in the next step...)
        </div>
      </div>
    </div>
  );
}