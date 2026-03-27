import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { colors } from '../../constants/theme';

import DashboardIcon from '../../assets/icons/dashboard.svg';
import DataEntryIcon from '../../assets/icons/data-entry (2) 2.svg';
import ListIcon from '../../assets/icons/list.svg';
import StockIcon from '../../assets/icons/stock-hub.svg';
import ExchangeIcon from '../../assets/icons/exchange.svg';
import SalesIcon from '../../assets/icons/sales.svg';
import ProcurementIcon from '../../assets/icons/procurement.svg';
import FinancialsIcon from '../../assets/icons/financials.svg';
import ManufacturingIcon from '../../assets/icons/manufacturing.svg';
import DealsIcon from '../../assets/icons/deals.svg';
import LogisticsIcon from '../../assets/icons/logistics.svg';
import POSIcon from '../../assets/icons/pos.svg';
import ReportsIcon from '../../assets/icons/reports.svg';
import ToolsIcon from '../../assets/icons/tools.svg';
import ManagementIcon from '../../assets/icons/management.svg';
import ConfigIcon from '../../assets/icons/config.svg';
import ChevronDown from '../../assets/chevron-down.svg';
import SearchIcon from '../../assets/iconsax-search.svg';

const HEADER_HEIGHT = 30;
const DEFAULT_WIDTH = 232;
const COLLAPSED_WIDTH = 76;

// Minimum touch target (ui-ux-pro-max: 44×44pt)
const TOUCH_MIN = 'min-h-[44px] min-w-[44px]';
const ICON_SIZE = 'h-5 w-5'; // 20px icon token (clearer in expanded mode)

// Some SVGs have extra whitespace inside their viewBox, so they look smaller.
// Scale ONLY those specific icons to match the others visually.
const ICON_TWEAK = {
  [DataEntryIcon]: 'scale-[1.22]',
  [ListIcon]: 'scale-[1.38]',
  [StockIcon]: 'scale-[1.38]',
};

function iconClass(src, base) {
  return `${base} ${ICON_TWEAK[src] ?? ''}`.trim();
}

const menuItems = [
  { label: 'Dashboard', icon: DashboardIcon, to: '/dashboard', exact: true },
  {
    label: 'Data Entry',
    icon: DataEntryIcon,
    subItems: [
      { label: 'Sub 1', to: '/sub 1', icon: ListIcon },
      { label: 'Sub 2', to: '/sub 2', icon: StockIcon },
      { label: 'Sub 3', to: '/sub 3', icon: ExchangeIcon },
    ],
  },
  { label: 'List', to: '/data-entry/list', icon: ListIcon },
  { label: 'Stock Hub', to: '/stock-hub', icon: StockIcon },
  { label: 'Exchange Hub', to: '/exchange-hub', icon: ExchangeIcon },
  { label: 'Sales Activities', to: '/delivery-order', icon: SalesIcon },
  { label: 'Procurement', to: '/procurement', icon: ProcurementIcon },
  { label: 'Financials', to: '/financials', icon: FinancialsIcon },
  { label: 'Manufacturing', to: '/manufacturing', icon: ManufacturingIcon },
  { label: 'Deals & Offers', to: '/deals-offers', icon: DealsIcon },
  { label: 'Logistics', to: '/logistics', icon: LogisticsIcon },
  { label: 'Point of Sale', to: '/point-of-sale', icon: POSIcon },
  { label: 'Reports', to: '/reports', icon: ReportsIcon },
  { label: 'Tools', to: '/tools', icon: ToolsIcon },
  { label: 'Management', to: '/management', icon: ManagementIcon },
  { label: 'Configuration', to: '/configuration', icon: ConfigIcon },
];

export default function Sidebar({ collapsed = false, width = DEFAULT_WIDTH, onToggleCollapsed }) {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) =>
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));

  const effectiveWidth = width ?? (collapsed ? COLLAPSED_WIDTH : DEFAULT_WIDTH);

  return (
    <aside
      className="sidebar-scroll fixed flex flex-col overflow-y-auto overflow-x-hidden font-sans"
      style={{
        top: HEADER_HEIGHT,
        left: 0,
        width: effectiveWidth,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        background: `linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), ${colors.primary.gradient}`,
        color: 'white',
        transition: 'width 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
      aria-label="Main navigation"
    >
      {/* Top: toggle + search — 8px spacing rhythm */}
      <div className={collapsed ? 'px-2 pt-4 pb-3' : 'px-3 pt-4 pb-3'}>
        {/* Expanded: toggle + search on same row. Collapsed: stacked + centered. */}
        <div className={collapsed ? 'flex flex-col items-center gap-2' : 'flex items-center gap-2'}>
          <button
            type="button"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleCollapsed}
            className={`flex items-center justify-center rounded-2xl border border-white/14 bg-white/10 text-white/95 hover:bg-white/16 active:bg-white/22 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent transition duration-200 ${TOUCH_MIN} h-11 w-11 shadow-[0_10px_18px_rgba(0,0,0,0.12)]`}
          >
            <Chevron direction={collapsed ? 'right' : 'left'} />
          </button>

          {collapsed ? (
            <button
              type="button"
              aria-label="Search menu"
              title="Search menu"
              className={`flex items-center justify-center rounded-2xl border border-white/14 bg-white/10 hover:bg-white/16 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 transition duration-200 ${TOUCH_MIN} h-11 w-11 shadow-[0_10px_18px_rgba(0,0,0,0.10)]`}
            >
              <img
                src={SearchIcon}
                alt=""
                aria-hidden="true"
                className={`${ICON_SIZE} filter brightness-0 invert opacity-90`}
              />
            </button>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 rounded-2xl border border-white/12 bg-white/10 px-3 h-11 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                <img
                  src={SearchIcon}
                  alt=""
                  aria-hidden="true"
                  className={`${ICON_SIZE} shrink-0 filter brightness-0 invert opacity-90`}
                />
                <input
                  type="search"
                  placeholder="Search…"
                  aria-label="Search menu"
                  className="bg-transparent outline-none text-white/95 placeholder:text-white/55 text-[15px] w-full min-h-[44px] py-2"
                />
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="mt-4 px-2">
            <div className="text-[11px] tracking-[0.14em] uppercase text-white/65">
              Navigation
            </div>
          </div>
        )}

        <div className="mt-3 mx-2 border-t border-white/10" aria-hidden="true" />
      </div>

      <nav className="flex-1 px-2 py-2" role="navigation" aria-label="App sections">
        {menuItems.map((item) => {
          const isOpen = openMenus[item.label] || false;
          const hasSub = !!item.subItems;

          return (
            <div key={item.label}>
              {hasSub ? (
                <button
                  type="button"
                  aria-label={collapsed ? item.label : undefined}
                  aria-expanded={!collapsed ? isOpen : undefined}
                  title={collapsed ? item.label : undefined}
                  onClick={() => toggleMenu(item.label)}
                  className={`group relative flex w-full items-center rounded-2xl text-left text-white/92 no-underline transition-colors duration-200 hover:bg-white/10 active:bg-white/16 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-inset ${TOUCH_MIN} ${
                    collapsed ? 'justify-center px-0 py-3' : 'justify-between gap-3 px-3 py-2.5'
                  }`}
                >
                  <div className={`flex items-center min-w-0 ${collapsed ? 'gap-0' : 'gap-3'}`}>
                    <img
                      src={item.icon}
                      alt=""
                      aria-hidden="true"
                      className={iconClass(item.icon, `${ICON_SIZE} shrink-0 opacity-90 group-hover:opacity-100 transition-opacity`)}
                    />
                    {!collapsed && (
                      <span className="text-[14px] font-medium truncate">{item.label}</span>
                    )}
                  </div>
                  {!collapsed && (
                    <img
                      src={ChevronDown}
                      alt=""
                      aria-hidden="true"
                      className={`w-4 h-4 shrink-0 opacity-90 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>
              ) : (
                <NavLink
                  to={item.to}
                  end={item.exact}
                  aria-label={collapsed ? item.label : undefined}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `group relative flex w-full items-center rounded-2xl text-left no-underline transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-inset ${TOUCH_MIN} ${
                      collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-white/20 text-white font-semibold border border-white/12 shadow-[inset_4px_0_12px_-2px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.18)]'
                        : 'text-white/92 hover:bg-white/10 active:bg-white/16'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* No bar: selected state = pill with soft left-edge glow */}
                      <img
                        src={item.icon}
                        alt=""
                        aria-hidden="true"
                        className={iconClass(item.icon, `${ICON_SIZE} shrink-0 opacity-95 group-hover:opacity-100 transition-opacity`)}
                      />
                      {!collapsed && (
                        <span className="text-[14px] truncate tracking-[0.01em]">
                          {item.label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )}

              {hasSub && isOpen && !collapsed && (
                <div
                  className="mt-2 ml-2 pl-4 border-l border-white/10 space-y-1"
                  role="group"
                  aria-label={`${item.label} submenu`}
                >
                  {item.subItems.map((sub) => (
                    <NavLink
                      key={`${item.label}-${sub.label}`}
                      to={sub.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-white/90 no-underline transition-colors duration-200 hover:bg-white/10 active:bg-white/14 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-inset min-h-[44px] ${
                          isActive ? 'bg-white/18 border border-white/14 font-semibold text-white' : 'font-normal'
                        }`
                      }
                    >
                      <img
                        src={sub.icon}
                        alt=""
                        aria-hidden="true"
                        className={iconClass(sub.icon, `${ICON_SIZE} shrink-0 opacity-90`)}
                      />
                      <span className="truncate">{sub.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function Chevron({ direction }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 opacity-90"
      aria-hidden="true"
    >
      {direction === 'left' ? (
        <path
          d="M14.5 6L8.5 12L14.5 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9.5 6L15.5 12L9.5 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
