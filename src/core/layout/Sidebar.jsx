import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from '../auth/auth.service.js';
import { colors } from '../../shared/constants/theme';

import DashboardIcon from '../../shared/assets/icons/dashboard.svg';
import DataEntryIcon from '../../shared/assets/icons/data-entry (2) 2.svg';
import ListIcon from '../../shared/assets/icons/list.svg';
import StockIcon from '../../shared/assets/icons/stock-hub.svg';
import ExchangeIcon from '../../shared/assets/icons/exchange.svg';
import SalesIcon from '../../shared/assets/icons/sales.svg';
import ProcurementIcon from '../../shared/assets/icons/procurement.svg';
import FinancialsIcon from '../../shared/assets/icons/financials.svg';
import ManufacturingIcon from '../../shared/assets/icons/manufacturing.svg';
import DealsIcon from '../../shared/assets/icons/deals.svg';
import LogisticsIcon from '../../shared/assets/icons/logistics.svg';
import POSIcon from '../../shared/assets/icons/pos.svg';
import ReportsIcon from '../../shared/assets/icons/reports.svg';
import ToolsIcon from '../../shared/assets/icons/tools.svg';
import ManagementIcon from '../../shared/assets/icons/management.svg';
import ConfigIcon from '../../shared/assets/icons/config.svg';
import VendorIcon from '../../shared/assets/icons/vendor.svg';
import ProductEntryIcon from '../../shared/assets/icons/stock-hub.svg';
import ProductListIcon from '../../shared/assets/icons/ProductIcon.svg';
import ProductPriceListIcon from '../../shared/assets/icons/pricing.svg';
import CustomerListIcon from '../../shared/assets/icons/receipt_cutomer.svg';
import SupplierListIcon from '../../shared/assets/icons/invoice.svg';
import AgentListIcon from '../../shared/assets/icons/proforma.svg';
import ChevronDown from '../../shared/assets/chevron-down.svg';
import SearchIcon from '../../shared/assets/iconsax-search.svg';

const HEADER_HEIGHT = 30;
const SIDEBAR_WIDTH = 200;

const menuItems = [
  { label: 'Dashboard', icon: DashboardIcon, to: '/dashboard', exact: true },
  {
    label: 'Data Entry',
    icon: DataEntryIcon,
    subItems: [
      { label: 'Customer entry', to: '/data-entry/customer-entry', icon: ManagementIcon },
      { label: 'Supplier entry', to: '/data-entry/supplier-entry', icon: VendorIcon },
      { label: 'Product entry', to: '/data-entry/product-entry', icon: ProductEntryIcon },
      { label: 'Staff entry', to: '/data-entry/staff-entry', icon: ToolsIcon },
      { label: 'Group entry', to: '/data-entry/group-entry', icon: ProductEntryIcon },
      { label: 'Sub group entry', to: '/data-entry/sub-group-entry', icon: ProductEntryIcon },
      { label: 'Area entry', to: '/data-entry/area-entry', icon: LogisticsIcon },
    ],
  },
  {
    label: 'List',
    icon: ListIcon,
    subItems: [
      { label: 'Product list', to: '/products', icon: ProductListIcon },
      { label: 'Product price list', to: '/lists/product-price-list', icon: ProductPriceListIcon },
      { label: 'Customer list', to: '/lists/customer-list', icon: CustomerListIcon },
      { label: 'Supplier list', to: '/lists/supplier-list', icon: SupplierListIcon },
      { label: 'Agent list', to: '/lists/agent-list', icon: AgentListIcon },
    ],
  },
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

export default function Sidebar() {
  const navigate = useNavigate();

  const location = useLocation();
  /** List expanded by default; also open when a list sub-route is active */
  const [openMenus, setOpenMenus] = useState({ List: true });

  useEffect(() => {
    const onListSection =
      location.pathname === '/products' || location.pathname.startsWith('/lists/');
    if (onListSection) {
      setOpenMenus((prev) => ({ ...prev, List: true }));
    }
    if (location.pathname.startsWith('/data-entry/')) {
      setOpenMenus((prev) => ({ ...prev, 'Data Entry': true }));
    }
  }, [location.pathname]);

  const toggleMenu = (label) =>
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside
      className="fixed flex min-h-0 flex-col overflow-x-hidden overflow-y-hidden pt-4 font-sans"
      style={{
        top: HEADER_HEIGHT,
        left: 0,
        width: SIDEBAR_WIDTH,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        background: colors.primary?.gradient ?? '#790728',
        color: 'white',
      }}
    >
      <div className="shrink-0 px-4 pb-4">
        <div className="flex items-center w-40 h-8 border border-white bg-transparent rounded-[10px] px-2">
          <img
            src={SearchIcon}
            alt="Search"
            className="w-4 h-4 mr-2 filter brightness-0 invert"
          />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-white text-xs w-full"
          />
        </div>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto sidebar-scroll">
        {menuItems.map((item) => {
          const isOpen = openMenus[item.label] || false;
          const hasSub = !!item.subItems;

          return (
            <div key={item.label}>
              {hasSub ? (
                <div
                  onClick={() => toggleMenu(item.label)}
                  className="mx-1 flex items-center justify-between p-2 rounded-[10px] cursor-pointer text-sm font-light transition backdrop-blur-md hover:backdrop-blur-lg hover:bg-white/8"
                >
                  <div className="flex items-center gap-3">
                    <img src={item.icon} alt="" className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <img
                    src={ChevronDown}
                    alt="toggle"
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              ) : (
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `mx-1 flex items-center gap-3 p-2 rounded-[10px] text-white text-sm no-underline transition backdrop-blur-md hover:backdrop-blur-lg ${
                      isActive
                        ? 'bg-white/15 font-medium border border-white/25 shadow-[0_4px_8px_0_rgba(0,0,0,0.25)]'
                        : 'font-light hover:bg-white/8'
                    }`
                  }
                >
                  <img src={item.icon} alt="" className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              )}

              {hasSub && isOpen && (
                <div className="bg-black/15">
                  {item.subItems.map((sub) => (
                    <NavLink
                      key={`${item.label}-${sub.label}`}
                      to={sub.to}
                      className={({ isActive }) =>
                        `mx-2 flex items-center gap-2.5 p-2 rounded-[10px] text-white text-[0.825rem] no-underline transition ${
                          isActive
                            ? 'bg-white/15 border border-white/25 shadow-[0_4px_8px_0_rgba(0,0,0,0.25)] font-medium'
                            : 'hover:bg-white/8 font-light'
                        }`
                      }
                    >
                      <img
                        src={sub.icon}
                        alt=""
                        className={`w-4 h-4 ${
                          sub.label === 'Supplier entry' ||
                          sub.label === 'Product entry' ||
                          item.label === 'List'
                            ? 'filter brightness-0 invert'
                            : ''
                        }`.trim()}
                      />
                      <span>{sub.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 border-t border-white/15 px-2 py-3">
        <button
          type="button"
          onClick={() => signOut(navigate)}
          className="mx-1 w-[calc(100%-8px)] rounded-[10px] p-2 text-left text-sm font-light text-white/90 transition hover:bg-white/10"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
