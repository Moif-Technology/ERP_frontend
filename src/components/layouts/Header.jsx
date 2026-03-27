import React, { useMemo, useState } from "react";
import SearchIcon from "../../assets/iconsax-search.svg";
import AdminIcon from "../../assets/Group 1.svg";
import {
  getSessionCompany,
  getSessionParameters,
  getSessionUser,
} from "../../api/auth/auth.service";
import { colors } from "../../constants/theme";

/** Hardcoded logo: icon + MOIF wordmark */
function Logo() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="24"
          height="24"
          rx="6"
          fill={colors.primary.DEFAULT}
        />
        <text
          x="13"
          y="18"
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          M
        </text>
      </svg>
      <span
        className="font-bold text-sm tracking-tight truncate"
        style={{ color: colors.primary.DEFAULT }}
      >
        MOIF
      </span>
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const session = useMemo(() => {
    const user = getSessionUser();
    const company = getSessionCompany();
    const params = getSessionParameters();
    return { user, company, params };
  }, []);

  const shopName =
    session.params?.heading1 ||
    session.company?.stationName ||
    "";

  const stationLabel =
    session.company?.stationName ||
    (session.user?.stationId != null ? `Station ${session.user.stationId}` : "");

  const roleLabel = session.user?.role || "USER";
  const userLabel = session.user?.staffName || session.user?.login || "";

  return (
    <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between bg-white px-4 py-1.5 font-sans text-xs text-gray-700 shadow-md h-[30px]">
      {/* Logo + shop name (Heading1 from params) */}
      <div className="flex min-w-0 items-center gap-2">
        <Logo />
        {shopName ? (
          <>
            <span className="text-gray-400 shrink-0">·</span>
            <span className="font-medium text-sm text-gray-700 truncate" title={shopName}>
              {shopName}
            </span>
          </>
        ) : null}
        {stationLabel && !shopName ? (
          <span className="hidden sm:inline text-[11px] text-gray-500 truncate" title={stationLabel}>
            {stationLabel}
          </span>
        ) : null}
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

      {/* Right Section */}
      <div className="flex items-center gap-2.5">
        {session.user?.stationId != null ? (
          <span className="text-xs text-gray-600 hidden md:inline">
            Station: {session.user.stationId}
          </span>
        ) : null}

        {/* Admin Button */}
        <button className="flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-100">
          <img src={AdminIcon} alt="Admin" className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{roleLabel}</span>
          {userLabel ? (
            <span className="hidden lg:inline text-gray-500 font-normal">
              {userLabel}
            </span>
          ) : null}
        </button>

        {/* 3-dot menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="cursor-pointer select-none text-lg leading-none"
          >
            ⋮
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-6 z-50 min-w-[100px] rounded border border-gray-300 bg-white py-1 shadow-md">
              <div
                className="cursor-pointer px-3 py-1.5 text-sm hover:bg-gray-100"
                onClick={() => {
                  // Add logout logic here
                  setMenuOpen(false);
                }}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}