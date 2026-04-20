import React from 'react';
import { useLocation } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';

const primary = colors.primary?.main || '#790728';

const TITLES = {
  '/deals-offers/offer-packing-entry': 'OFFER PACKING ENTRY',
  '/deals-offers/offer-unpacking-entry': 'OFFER UNPACKING ENTRY',
  '/deals-offers/offer-packet-list': 'OFFER PACKET LIST',
};

/**
 * Placeholder for Deals & Offers sub-routes until dedicated screens exist.
 */
export default function DealsOffersPlaceholderPage() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'DEALS & OFFERS';

  return (
    <div className="box-border w-full min-w-0 max-w-full rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        {title}
      </h1>
      <p className="mt-6 text-center text-sm text-gray-600">Screen placeholder — connect API and UI here.</p>
    </div>
  );
}
