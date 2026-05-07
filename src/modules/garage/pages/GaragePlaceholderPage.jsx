import React from 'react';
import { colors } from '../../../shared/constants/theme';

const primary = colors.primary?.main || '#790728';

export default function GaragePlaceholderPage({ title }) {
  return (
    <div className="box-border -mx-[13px] flex min-h-[calc(100vh-220px)] w-[calc(100%+26px)] min-w-0 max-w-none flex-1 self-stretch rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex min-h-0 flex-1 flex-col">
        <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
          {title}
        </h1>
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-center text-sm text-gray-600">Screen placeholder — connect garage workflow UI here.</p>
        </div>
      </div>
    </div>
  );
}
