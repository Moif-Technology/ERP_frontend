import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '../../shared/assets/iconsax-search.svg';
import AdminIcon from '../../shared/assets/Group 1.svg';
import {
  getSessionUser,
  getSessionCompany,
  signOut,
} from '../auth/auth.service.js';

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const user = getSessionUser();
  const company = getSessionCompany();
  const stationLabel = company?.stationName
    ? `Station: ${company.stationName}`
    : user?.stationId != null
      ? `Station: ${user.stationId}`
      : 'Station: —';
  const staffLabel = user?.staffName?.trim() || 'User';
  const companyTitle = company?.companyName?.trim() || '';

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut(navigate);
  };

  return (
    <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between bg-white px-4 py-1.5 font-sans text-xs text-gray-700 shadow-md h-[30px]">
      <div
        className="min-w-0 max-w-[140px] truncate font-semibold text-sm sm:max-w-[200px]"
        title={companyTitle || undefined}
      >
        {companyTitle || 'logo'}
      </div>

      {/* Search */}
      <div className="flex flex-1 justify-center">
        <div className="flex w-[300px] max-w-full items-center rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 h-5">
          <img
            src={SearchIcon}
            alt="Search"
            className="mr-1.5 h-3.5 w-3.5"
          />
          <input
            type="text"
            placeholder="Search here"
            className="h-full flex-1 bg-transparent outline-none text-xs text-gray-600 placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-shrink-0 items-center gap-2 sm:gap-2.5">
        <span
          className="hidden max-w-[100px] truncate text-xs text-gray-600 sm:inline sm:max-w-[140px] md:max-w-[200px]"
          title={company?.stationName || undefined}
        >
          {stationLabel}
        </span>
        <button
          type="button"
          className="flex max-w-[120px] items-center gap-1 truncate rounded-full border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-100 sm:max-w-[160px]"
          title={staffLabel}
        >
          <img src={AdminIcon} alt="" className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{staffLabel}</span>
        </button>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="cursor-pointer select-none text-lg leading-none text-gray-700"
            aria-expanded={menuOpen}
            aria-label="Menu"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-6 z-50 min-w-[120px] rounded border border-gray-300 bg-white py-1 shadow-md">
              <button
                type="button"
                className="w-full cursor-pointer px-3 py-1.5 text-left text-sm hover:bg-gray-100"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
