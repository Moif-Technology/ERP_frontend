import React from 'react';
import { colors } from '../../../shared/constants/theme';

const primary = colors.primary?.main || '#790728';

export default function GarageDashboard() {
  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
        GARAGE DASHBOARD
      </h1>
    </div>
  );
}
