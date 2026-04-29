import React from 'react';
import { colors } from '../../../shared/constants/theme';

const primary = colors.primary?.main || '#790728';

export default function PartRequest() {
  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
            Part Request
          </h1>
          <p className="text-[11px] text-gray-500">Raise and track part requests for job cards</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-24">
        <div className="text-center">
          <svg className="mx-auto mb-3 h-10 w-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            <path d="M19 12h3M21 10l2 2-2 2" />
          </svg>
          <p className="text-sm font-medium text-gray-400">Part Request</p>
          <p className="text-xs text-gray-300">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
