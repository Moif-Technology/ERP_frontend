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

const HEADER_HEIGHT = 48;
const SIDEBAR_WIDTH = 220;

const menuItems = [
  { label: 'Dashboard', icon: DashboardIcon, to: '/', exact: true },
  {
    label: 'Data Entry',
    icon: DataEntryIcon,
    subItems: [
      { label: 'Sub 1', to: '/', icon: ListIcon },
      { label: 'Sub 2', to: '/', icon: StockIcon },
      { label: 'Sub 3', to: '/', icon: ExchangeIcon },
    ],
  },
  { label: 'List', to: '/data-entry/list', icon: ListIcon },
  { label: 'Stock Hub', to: '/stock-hub', icon: StockIcon },
  { label: 'Exchange Hub', to: '/exchange-hub', icon: ExchangeIcon },
  { label: 'Sales Activities', to: '/sales-activities', icon: SalesIcon },
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
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) =>
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside
      style={{
        position: 'fixed',
        top: HEADER_HEIGHT,
        left: 0,
        width: SIDEBAR_WIDTH,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        background: colors.primary.gradient,
        color: 'white',
        fontFamily: "'Open Sans', sans-serif",
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 16,
      }}
    >
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const isOpen = openMenus[item.label] || false;
          const hasSub = !!item.subItems;

          return (
            <div key={item.label}>
              {hasSub ? (
                <div
                  onClick={() => toggleMenu(item.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: isOpen ? 'rgba(255,255,255,0.12)' : 'transparent',
                    fontSize: '0.875rem',
                    fontWeight: isOpen ? 400 : 200,
                  }}
                  className="hover-glass"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={item.icon}
                      alt=""
                      style={{
                        width: 18,
                        height: 18,
                        filter: 'brightness(0) invert(1)',
                      }}
                    />
                    <span>{item.label}</span>
                  </div>
                  <img
                    src={ChevronDown}
                    alt="toggle"
                    style={{
                      width: 14,
                      height: 14,
                      transition: 'transform 0.25s ease',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      filter: 'brightness(0) invert(1)',
                    }}
                  />
                </div>
              ) : (
                <NavLink
                  to={item.to}
                  end={item.exact}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    color: 'white',
                    textDecoration: 'none',
                    background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                    fontWeight: isActive ? 400 : 200,
                    fontSize: '0.875rem',
                  })}
                  className="hover-glass"
                >
                  <img
                    src={item.icon}
                    alt=""
                    style={{
                      width: 18,
                      height: 18,
                      filter: 'brightness(0) invert(1)',
                    }}
                  />
                  <span>{item.label}</span>
                </NavLink>
              )}

              {hasSub && isOpen && (
                <div style={{ background: 'rgba(0,0,0,0.15)' }}>
                  {item.subItems.map((sub) => (
                    <NavLink
                      key={`${item.label}-${sub.label}`}
                      to={sub.to}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 16px 10px 40px',
                        color: 'white',
                        textDecoration: 'none',
                        background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                        fontSize: '0.825rem',
                      })}
                      className="hover-glass"
                    >
                      <img
                        src={sub.icon}
                        alt=""
                        style={{
                          width: 16,
                          height: 16,
                          filter: 'brightness(0) invert(1)',
                        }}
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

      <style>{`
        .hover-glass {
          backdrop-filter: blur(8px);
          transition: backdrop-filter 0.3s, background 0.2s;
        }
        .hover-glass:hover {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.08) !important;
        }
      `}</style>
    </aside>
  );
}
