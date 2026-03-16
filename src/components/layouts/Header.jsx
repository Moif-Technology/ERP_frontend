import React, { useState } from "react";
import SearchIcon from "../../assets/iconsax-search.svg";
import AdminIcon from "../../assets/Group 1.svg";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between bg-white px-4 py-1.5 font-sans text-xs text-gray-700 shadow-md h-[30px]">
      {/* Logo */}
      <div className="font-semibold text-sm">logo</div>

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
        <span className="text-xs">Station: 10</span>

        {/* Admin Button */}
        <button className="flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-100">
          <img src={AdminIcon} alt="Admin" className="h-3.5 w-3.5" />
          <span>ADMIN</span>
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