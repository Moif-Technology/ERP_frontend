import React from 'react';
import { colors } from '../../../shared/constants/theme';

const primary = colors.primary?.main || '#790728';

export default function SubletJobs() {
  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
            Sublet Jobs
          </h1>
          <p className="text-[11px] text-gray-500">Manage jobs sublet to external workshops</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-24">
        <div className="text-center">
          <svg className="mx-auto mb-3 h-10 w-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="10" height="13" rx="1.5" />
            <path d="M4 10h6M4 13h4" />
            <path d="M12 12h2.5M13.5 10l2 2-2 2" />
            <rect x="15" y="6" width="7" height="13" rx="1.5" />
            <path d="M16.5 10h4M16.5 13h3" />
          </svg>
          <p className="text-sm font-medium text-gray-400">Sublet Jobs</p>
          <p className="text-xs text-gray-300">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
