import { useState } from 'react';
import SearchIcon from '../../shared/assets/icons/search3.svg';
import RefreshIcon from '../../shared/assets/icons/refresh.svg';
import EditIcon from '../../shared/assets/icons/edit2.svg';
import DeleteIcon from '../../shared/assets/icons/delete.svg';

import VendorIcon from '../../shared/assets/icons/vendor.svg';
import LedgerIcon from '../../shared/assets/icons/ledger.svg';
import PricingIcon from '../../shared/assets/icons/pricing.svg';
import AltIcon from '../../shared/assets/icons/alternative.svg';

import { colors } from '../../shared/constants/theme';

export default function MiniToolbar() {
  const [active, setActive] = useState('Multi vendors');

  const leftItems = [
    { label: 'Multi vendors', icon: VendorIcon },
    { label: 'Item Ledger', icon: LedgerIcon },
    { label: 'Pricing', icon: PricingIcon },
    { label: 'Alternative', icon: AltIcon },
  ];

  return (
    <div className="mx-[15px] mt-2 flex min-w-0 flex-col gap-3 px-0 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
      <div className="flex flex-wrap gap-2 min-w-0">
        {leftItems.map((item) => {
          const isActive = active === item.label;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setActive(item.label)}
              className={`flex flex-shrink-0 items-center gap-1 rounded-md border bg-white px-2 py-1 text-[9px] sm:text-[10px] transition-colors ${
                isActive
                  ? 'border-slate-400 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              style={{
                borderColor: isActive ? colors.primary.main : undefined,
                color: isActive ? colors.primary.main : '#334155',
              }}
            >
              <img src={item.icon} alt="" className="h-3 w-3 flex-shrink-0" />
              <span className="truncate font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-shrink-0 gap-1.5">
        {[SearchIcon, RefreshIcon, EditIcon].map((icon, i) => (
          <button
            key={i}
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <img src={icon} alt="" className="h-3 w-3" />
          </button>
        ))}
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded bg-red-600 transition-colors hover:bg-red-700"
        >
          <img src={DeleteIcon} alt="" className="h-3 w-3 brightness-0 invert" />
        </button>
      </div>
    </div>
  );
}
