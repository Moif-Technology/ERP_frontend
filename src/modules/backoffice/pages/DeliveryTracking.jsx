import React from 'react';
import { colors } from '../../../shared/constants/theme';

const primary = colors.primary?.main || '#790728';

export default function DeliveryTracking() {
  return (
    <div className="box-border w-full min-w-0 max-w-full rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        DELIVERY TRACKING
      </h1>
      <p className="mt-6 text-center text-sm text-gray-600">Delivery tracking screen — coming soon.</p>
    </div>
  );
}
