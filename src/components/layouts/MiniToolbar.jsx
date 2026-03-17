import { useState } from 'react';
import SearchIcon from '../../assets/icons/search3.svg';
import RefreshIcon from '../../assets/icons/refresh.svg';
import EditIcon from '../../assets/icons/edit2.svg';
import DeleteIcon from '../../assets/icons/delete.svg';

import VendorIcon from '../../assets/icons/vendor.svg';
import LedgerIcon from '../../assets/icons/ledger.svg';
import PricingIcon from '../../assets/icons/pricing.svg';
import AltIcon from '../../assets/icons/alternative.svg';

import { colors } from '../../constants/theme';

export default function MiniToolbar() {
  const [active, setActive] = useState('Multi vendors');

  const leftItems = [
    { label: 'Multi vendors', icon: VendorIcon },
    { label: 'Item Ledger', icon: LedgerIcon },
    { label: 'Pricing', icon: PricingIcon },
    { label: 'Alternative', icon: AltIcon },
  ];

  return (
   <div className="mt-[15px] mx-[15px] flex items-center justify-between">

  {/* LEFT SIDE */}
  <div className="flex gap-2">
    {leftItems.map((item) => {
      const isActive = active === item.label;

      return (
        <button
          key={item.label}
          onClick={() => setActive(item.label)}
          className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded 
            bg-white border transition-all
            ${isActive ? 'shadow-md' : ''}
          `}
          style={{
            borderColor: isActive ? colors.primary.main : '#000',
          }}
        >
          <img
            src={item.icon}
            alt=""
            className="w-3 h-3"
          />
          {item.label}
        </button>
      );
    })}
  </div>

  {/* RIGHT SIDE */}
  <div className="flex gap-2">
    
    {[SearchIcon, RefreshIcon, EditIcon].map((icon, i) => (
      <button
        key={i}
        className="w-6 h-6 flex items-center justify-center bg-white border border-black rounded hover:shadow-sm"
      >
        <img src={icon} alt="" className="w-3 h-3" />
      </button>
    ))}

    {/* Delete */}
    <button className="w-6 h-6 flex items-center justify-center rounded bg-red-500 hover:bg-red-600">
      <img src={DeleteIcon} alt="" className="w-3 h-3 " />
    </button>

  </div>
</div>
  );
}