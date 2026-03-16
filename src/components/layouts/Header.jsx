import React from 'react';
import { colors, borderRadius, typography } from '../../constants/theme';
import SearchIcon from '../../assets/iconsax-search.svg';
import AdminIcon from '../../assets/Group 1.svg';

const HEADER_HEIGHT = 48;
const SIDEBAR_WIDTH = 220;

export default function Header() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
        width: '100%',
        background: colors.surface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px 0 20px',
        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.12)',
        fontFamily: typography.fontFamily.sans,
        fontSize: '0.82rem',
        color: colors.neutral[700],
        zIndex: 1000,
      }}
    >
      <div
        style={{
          fontWeight: '600',
          fontSize: '0.95rem',
          letterSpacing: '-0.3px',
          whiteSpace: 'nowrap',
        }}
      >
        logo
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          paddingLeft: SIDEBAR_WIDTH - 120,
        }}
      >
        <div
          style={{
            width: 420,
            maxWidth: '100%',
            height: 32,
            display: 'flex',
            alignItems: 'center',
            background: colors.input.background,
            border: `1px solid ${colors.neutral[300]}`,
            borderRadius: borderRadius.full,
            padding: '0 12px',
          }}
        >
          <img
            src={SearchIcon}
            alt="Search"
            style={{ width: 14, height: 14, marginRight: 8 }}
          />

          <input
            type="text"
            placeholder="Search here"
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: '0.85rem',
              color: colors.neutral[600],
              padding: 0,
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontSize: '0.82rem',
          color: colors.neutral[600],
        }}
      >
        <span>Station : 10</span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            border: `1px solid ${colors.neutral[300]}`,
            borderRadius: borderRadius.full,
            background: colors.neutral[50],
            fontWeight: '400',
            fontSize: '0.68rem',
          }}
        >
          <img
            src={AdminIcon}
            alt="Admin"
            style={{ width: 16, height: 16 }}
          />
          <span>ADMIN</span>
        </div>

        <span style={{ cursor: 'pointer', fontSize: 14 }}>...</span>
      </div>
    </header>
  );
}
