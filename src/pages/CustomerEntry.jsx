import React from 'react';
import { colors } from '../constants/theme';

export default function CustomerEntry() {
  const primary = colors.primary?.main || '#790728';
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        Customer entry
      </h1>
      <div className="mt-3 rounded border border-gray-200 bg-white p-3 text-sm text-gray-700">
        Customer entry screen placeholder.
      </div>
    </div>
  );
}

