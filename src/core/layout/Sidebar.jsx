import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from '../auth/auth.service.js';
import { filterByAccess } from '../access/access.service.js';
import { colors } from '../../shared/constants/theme';

import DashboardIcon from '../../shared/assets/icons/dashboard.svg';
import HomeIcon from '../../shared/assets/icons/home.svg';
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
import StockAdjustmentIcon from '../../shared/assets/icons/refresh.svg';
import StockAdjustmentListIcon from '../../shared/assets/icons/stock-adjustment-list.svg';
import ReorderListIcon from '../../shared/assets/icons/reorder-list.svg';
import DiscountEntryIcon from '../../shared/assets/icons/deals-discount-entry.svg';
import GiftVoucherSettingsIcon from '../../shared/assets/icons/deals-gift-voucher-settings.svg';
import GiftVoucherViewerIcon from '../../shared/assets/icons/deals-gift-voucher-viewer.svg';
import OfferPacketCreationIcon from '../../shared/assets/icons/deals-offer-packet-creation.svg';
import OfferPackingEntryIcon from '../../shared/assets/icons/deals-offer-packing-entry.svg';
import OfferUnpackingEntryIcon from '../../shared/assets/icons/deals-offer-unpacking-entry.svg';
import OfferPacketListIcon from '../../shared/assets/icons/deals-offer-packet-list.svg';
import DamageEntryIcon from '../../shared/assets/icons/cancel.svg';
import AdditionalStockIcon from '../../shared/assets/icons/post.svg';
import ProductMovementIcon from '../../shared/assets/icons/product-movement.svg';
import CustomerListIcon from '../../shared/assets/icons/receipt_cutomer.svg';
import SupplierListIcon from '../../shared/assets/icons/invoice.svg';
import AgentListIcon from '../../shared/assets/icons/proforma.svg';
import HrModuleIcon from '../../shared/assets/icons/hr-module.svg';
import EmployeeDirectoryIcon from '../../shared/assets/icons/employee-directory.svg';
import ShiftMasterIcon from '../../shared/assets/icons/shift-master.svg';
import LeaveTypeMasterIcon from '../../shared/assets/icons/leave-type-master.svg';
import DocumentTypeIcon from '../../shared/assets/icons/document-type.svg';
import CrmModuleIcon from '../../shared/assets/icons/crm-module.svg';
import CrmOverviewIcon from '../../shared/assets/icons/trial_balance.svg';
import CrmLeadsIcon from '../../shared/assets/icons/filter.svg';
import CrmOpportunitiesIcon from '../../shared/assets/icons/QuotationIcon.svg';
import CrmFollowupsIcon from '../../shared/assets/icons/search2.svg';
import CrmInteractionsIcon from '../../shared/assets/icons/Receipt.svg';
import CrmLeadSourceIcon from '../../shared/assets/icons/alternative.svg';
import CrmLeadStatusIcon from '../../shared/assets/icons/grn.svg';
import CrmStageIcon from '../../shared/assets/icons/DeliveryIcon.svg';
import GarageModuleIcon from '../../shared/assets/icons/garage-module.svg';
import GarageTechnicianEntryIcon from '../../shared/assets/icons/garage-technician-entry.svg';
import GarageJobDescriptionIcon from '../../shared/assets/icons/garage-job-description-entry.svg';
import GarageBranchEntryIcon from '../../shared/assets/icons/garage-branch-entry.svg';
import GaragePartRequestIcon from '../../shared/assets/icons/garage-part-request.svg';
import GarageSubletJobsIcon from '../../shared/assets/icons/garage-sublet-jobs.svg';
import GarageGatePassViewerIcon from '../../shared/assets/icons/garage-gate-pass-viewer.svg';
import GaragePunchingEntryIcon from '../../shared/assets/icons/garage-punching-entry.svg';
import GarageJobCodePunchingIcon from '../../shared/assets/icons/garage-job-code-punching.svg';
import GaragePunchingListIcon from '../../shared/assets/icons/garage-punching-list.svg';
import GaragePreJobCardEntryIcon from '../../shared/assets/icons/garage-pre-job-card-entry.svg';
import GarageAdditionalVehicleHistoryIcon from '../../shared/assets/icons/garage-additional-vehicle-history.svg';
import GarageSubletLpoIcon from '../../shared/assets/icons/garage-sublet-lpo.svg';
import GarageConsumableEntryIcon from '../../shared/assets/icons/garage-consumable-entry.svg';
import GarageLubricantMonitorIcon from '../../shared/assets/icons/garage-lubricant-monitor.svg';
import GarageConsumableMonitorIcon from '../../shared/assets/icons/garage-consumable-monitor.svg';
import GarageSubletMonitorIcon from '../../shared/assets/icons/garage-sublet-monitor.svg';
import GarageHomeIcon from '../../shared/assets/icons/garage-home.svg';
import GarageDashboardIcon from '../../shared/assets/icons/garage-dashboard.svg';
import ChevronDown from '../../shared/assets/chevron-down.svg';
import SearchIcon from '../../shared/assets/iconsax-search.svg';

const HEADER_HEIGHT = 30;
const SIDEBAR_WIDTH = 200;

const menuItems = [
  { label: 'Dashboard', icon: DashboardIcon, to: '/dashboard', exact: true, feature: 'backoffice.dashboard' },
  { label: 'Home', icon: HomeIcon, to: '/home', exact: true, feature: 'backoffice.dashboard' },
  {
    label: 'Data Entry',
    icon: DataEntryIcon,
    features: ['backoffice', 'core'],
    subItems: [
      { label: 'Customer entry', to: '/data-entry/customer-entry', icon: ManagementIcon, features: ['core.customers', 'backoffice.customers'] },
      { label: 'Supplier entry', to: '/data-entry/supplier-entry', icon: VendorIcon, features: ['core.suppliers', 'backoffice.suppliers'] },
      { label: 'Product entry', to: '/data-entry/product-entry', icon: ProductEntryIcon, feature: 'backoffice.product_master' },
      { label: 'Staff entry', to: '/data-entry/staff-entry', icon: ToolsIcon, features: ['core.users', 'backoffice.staff'] },
      { label: 'Role entry', to: '/data-entry/role-entry', icon: ConfigIcon, feature: 'core.roles' },
      { label: 'Group entry', to: '/data-entry/group-entry', icon: ProductEntryIcon, feature: 'backoffice.product_group' },
      { label: 'Sub group entry', to: '/data-entry/sub-group-entry', icon: ProductEntryIcon, feature: 'backoffice.product_group' },
      { label: 'Area entry', to: '/data-entry/area-entry', icon: LogisticsIcon, features: ['backoffice.area_master', 'pos.areas'] },
      { label: 'Table entry', to: '/data-entry/table-entry', icon: LogisticsIcon, features: ['backoffice.table_master', 'pos.tables'] },
    ],
  },
  {
    label: 'List',
    icon: ListIcon,
    features: ['backoffice', 'core'],
    subItems: [
      { label: 'Product list', to: '/products', icon: ProductListIcon, features: ['backoffice.product_master', 'pos.product_search'] },
      { label: 'Product price list', to: '/lists/product-price-list', icon: ProductPriceListIcon, feature: 'backoffice.product_master' },
      { label: 'Customer list', to: '/lists/customer-list', icon: CustomerListIcon, features: ['core.customers', 'backoffice.customers', 'crm'] },
      { label: 'Supplier list', to: '/lists/supplier-list', icon: SupplierListIcon, features: ['core.suppliers', 'backoffice.suppliers', 'backoffice.purchase'] },
      { label: 'Agent list', to: '/lists/agent-list', icon: AgentListIcon, feature: 'backoffice.staff' },
    ],
  },
  {
    label: 'Stock Hub',
    icon: StockIcon,
    feature: 'backoffice.inventory',
    subItems: [
      {
        label: 'Stock Adjustment',
        icon: StockAdjustmentIcon,
        subItems: [
          { label: 'New Entry', to: '/stock-hub/stock-adjustment', icon: StockAdjustmentIcon, feature: 'backoffice.stock_adjustment' },
          { label: 'List', to: '/stock-hub/stock-adjustment-list', icon: StockAdjustmentListIcon, feature: 'backoffice.stock_adjustment' },
        ],
      },
      {
        label: 'Damage Entry',
        icon: DamageEntryIcon,
        subItems: [
          { label: 'New Entry', to: '/stock-hub/damage-entry', icon: DamageEntryIcon, feature: 'backoffice.damage_entry' },
          { label: 'List', to: '/stock-hub/damage-entry-list', icon: StockAdjustmentListIcon, feature: 'backoffice.damage_entry' },
        ],
      },
      {
        label: 'Additional Stock',
        icon: AdditionalStockIcon,
        subItems: [
          { label: 'New Entry', to: '/stock-hub/additional-stock-entry', icon: AdditionalStockIcon, feature: 'backoffice.stock_entry' },
          { label: 'List', to: '/stock-hub/additional-stock-entry-list', icon: StockAdjustmentListIcon, feature: 'backoffice.stock_entry' },
        ],
      },
      { label: 'Reorder list', to: '/stock-hub/reorder-list', icon: ReorderListIcon, feature: 'backoffice.reorder' },
      { label: 'Product movement', to: '/stock-hub/product-movement', icon: ProductMovementIcon, feature: 'backoffice.product_movement' },
    ],
  },
  { label: 'Exchange Hub', to: '/exchange-hub', icon: ExchangeIcon, feature: 'backoffice.exchange' },
  { label: 'Sales Activities', to: '/delivery-order', icon: SalesIcon, features: ['backoffice.sales', 'backoffice.delivery_order', 'backoffice.sales_quotation'] },
  { label: 'Procurement', to: '/procurement', icon: ProcurementIcon, features: ['backoffice.purchase', 'backoffice.purchase_order', 'backoffice.grn'] },
  { label: 'Trial Balance', to: '/trial-balance', icon: FinancialsIcon, feature: 'backoffice.accounts' },
  { label: 'Manufacturing', to: '/manufacturing', icon: ManufacturingIcon, feature: 'backoffice.manufacturing' },
  {
    label: 'Deals & Offers',
    icon: DealsIcon,
    feature: 'backoffice.deals_offers',
    subItems: [
      { label: 'Discount entry', to: '/deals-offers/discount-entry', icon: DiscountEntryIcon },
      { label: 'Gift Voucher Settings', to: '/deals-offers/gift-voucher-settings', icon: GiftVoucherSettingsIcon },
      { label: 'Gift Voucher Viewer', to: '/deals-offers/gift-voucher-viewer', icon: GiftVoucherViewerIcon },
      { label: 'Offer Packet Creation', to: '/deals-offers/offer-packet-creation', icon: OfferPacketCreationIcon },
      { label: 'Offer Packing Entry', to: '/deals-offers/offer-packing-entry', icon: OfferPackingEntryIcon },
      { label: 'Offer Unpacking Entry', to: '/deals-offers/offer-unpacking-entry', icon: OfferUnpackingEntryIcon },
      { label: 'Offer Packet List', to: '/deals-offers/offer-packet-list', icon: OfferPacketListIcon },
    ],
  },
  { label: 'Logistics', to: '/logistics', icon: LogisticsIcon, feature: 'backoffice.logistics' },
  { label: 'Point of Sale', to: '/point-of-sale', icon: POSIcon, feature: 'pos' },
  {
    label: 'Human Resources',
    icon: HrModuleIcon,
    feature: 'hr',
    subItems: [
      { label: 'HR dashboard', to: '/hr/dashboard', icon: ReportsIcon, feature: 'hr.dashboard' },
      { label: 'Employee directory', to: '/hr/employees', icon: EmployeeDirectoryIcon, feature: 'hr.employee_master' },
      { label: 'Attendance overview', to: '/hr/attendance', icon: CrmFollowupsIcon, feature: 'hr.attendance' },
      { label: 'Leave management', to: '/hr/leave-management', icon: LeaveTypeMasterIcon, feature: 'hr.leave' },
      { label: 'Shift master', to: '/hr/shift-master', icon: ShiftMasterIcon, feature: 'hr.shifts' },
      { label: 'Leave type master', to: '/hr/leave-type-master', icon: LeaveTypeMasterIcon, feature: 'hr.leave' },
      { label: 'Document type master', to: '/hr/document-type-master', icon: DocumentTypeIcon, feature: 'hr.document_types' },
    ],
  },
  {
    label: 'CRM',
    icon: CrmModuleIcon,
    feature: 'crm',
    subItems: [
      { label: 'CRM Overview', to: '/crm/dashboard', icon: CrmOverviewIcon, feature: 'crm.dashboard' },
      { label: 'Leads', to: '/crm/leads', icon: CrmLeadsIcon, feature: 'crm.leads' },
      { label: 'Opportunities', to: '/crm/opportunities', icon: CrmOpportunitiesIcon, feature: 'crm.opportunities' },
      { label: 'Follow-ups', to: '/crm/followups', icon: CrmFollowupsIcon, feature: 'crm.followups' },
      { label: 'Interactions', to: '/crm/interactions', icon: CrmInteractionsIcon, feature: 'crm.interactions' },
      { label: 'Lead Source Master', to: '/crm/masters/lead-sources', icon: CrmLeadSourceIcon, feature: 'crm.lead_sources' },
      { label: 'Lead Status Master', to: '/crm/masters/lead-statuses', icon: CrmLeadStatusIcon, feature: 'crm.lead_statuses' },
      { label: 'Opportunity Stage Master', to: '/crm/masters/opportunity-stages', icon: CrmStageIcon, feature: 'crm.opportunity_stages' },
    ],
  },
  {
    label: 'Garage',
    icon: GarageModuleIcon,
    subItems: [
      { label: 'Technician entry', to: '/garage/technician-entry', icon: GarageTechnicianEntryIcon },
      { label: 'Job description entry', to: '/garage/job-description-entry', icon: GarageJobDescriptionIcon },
      { label: 'Branch entry', to: '/garage/branch-entry', icon: GarageBranchEntryIcon },
      { label: 'Part request', to: '/garage/part-request', icon: GaragePartRequestIcon },
      { label: 'Sublet jobs', to: '/garage/sublet-jobs', icon: GarageSubletJobsIcon },
      { label: 'Gate pass viewer', to: '/garage/gate-pass-viewer', icon: GarageGatePassViewerIcon },
      { label: 'Punching entry', to: '/garage/punching-entry', icon: GaragePunchingEntryIcon },
      { label: 'Job code punching', to: '/garage/job-code-punching', icon: GarageJobCodePunchingIcon },
      { label: 'Punching list', to: '/garage/punching-list', icon: GaragePunchingListIcon },
      { label: 'Pre job card entry', to: '/garage/pre-job-card-entry', icon: GaragePreJobCardEntryIcon },
      { label: 'Additional vehicle history', to: '/garage/additional-vehicle-history', icon: GarageAdditionalVehicleHistoryIcon },
      { label: 'Sublet LPO', to: '/garage/sublet-lpo', icon: GarageSubletLpoIcon },
      { label: 'Consumable entry', to: '/garage/consumable-entry', icon: GarageConsumableEntryIcon },
      { label: 'Lubricant monitor', to: '/garage/lubricant-monitor', icon: GarageLubricantMonitorIcon },
      { label: 'Consumable monitor', to: '/garage/consumable-monitor', icon: GarageConsumableMonitorIcon },
      { label: 'Sublet monitor', to: '/garage/sublet-monitor', icon: GarageSubletMonitorIcon },
      { label: 'Home', to: '/garage/home', icon: GarageHomeIcon },
      { label: 'Dashboard', to: '/garage/dashboard', icon: GarageDashboardIcon },
    ],
  },
  { label: 'Reports', to: '/reports', icon: ReportsIcon, features: ['backoffice.reports', 'hr.reports', 'crm.reports'] },
  { label: 'Tools', to: '/tools', icon: ToolsIcon, feature: 'core.settings' },
  { label: 'Management', to: '/management', icon: ManagementIcon, feature: 'core.users' },
  {
    label: 'Configuration',
    icon: ConfigIcon,
    features: ['core.settings', 'backoffice.configuration', 'core.permissions'],
    subItems: [
      { label: 'Handle permissions', to: '/configuration/handle-permissions', icon: ConfigIcon, features: ['core.roles', 'core.permissions'] },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const visibleMenuItems = filterByAccess(menuItems);

  const location = useLocation();
  /** List expanded by default; also open when a list sub-route is active */
  const [openMenus, setOpenMenus] = useState({ List: true, 'Stock Hub': false, 'Deals & Offers': false, 'Stock Adjustment': false, 'Damage Entry': false, 'Additional Stock': false, 'Human Resources': false, CRM: false, Garage: false });

  useEffect(() => {
    const onListSection =
      location.pathname === '/products' || location.pathname.startsWith('/lists/');
    if (onListSection) {
      setOpenMenus((prev) => ({ ...prev, List: true }));
    }
    if (location.pathname.startsWith('/data-entry/')) {
      setOpenMenus((prev) => ({ ...prev, 'Data Entry': true }));
    }
    if (location.pathname.startsWith('/stock-hub')) {
      setOpenMenus((prev) => ({ ...prev, 'Stock Hub': true }));
    }
    if (location.pathname.startsWith('/stock-hub/stock-adjustment')) {
      setOpenMenus((prev) => ({ ...prev, 'Stock Adjustment': true }));
    }
    if (location.pathname.startsWith('/stock-hub/damage-entry')) {
      setOpenMenus((prev) => ({ ...prev, 'Damage Entry': true }));
    }
    if (location.pathname.startsWith('/stock-hub/additional-stock-entry')) {
      setOpenMenus((prev) => ({ ...prev, 'Additional Stock': true }));
    }
    if (location.pathname.startsWith('/deals-offers')) {
      setOpenMenus((prev) => ({ ...prev, 'Deals & Offers': true }));
    }
    if (location.pathname.startsWith('/garage')) {
      setOpenMenus((prev) => ({ ...prev, Garage: true }));
    }
    if (location.pathname.startsWith('/hr')) {
      setOpenMenus((prev) => ({ ...prev, 'Human Resources': true }));
    }
    if (location.pathname.startsWith('/crm')) {
      setOpenMenus((prev) => ({ ...prev, 'CRM': true }));
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
        {visibleMenuItems.map((item) => {
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
                  <img
                    src={item.icon}
                    alt=""
                    className={`w-4 h-4 ${item.label === 'Home' ? 'filter brightness-0 invert' : ''}`.trim()}
                  />
                  <span>{item.label}</span>
                </NavLink>
              )}

              {hasSub && isOpen && (
                <div className="bg-black/15">
                  {item.subItems.map((sub) => {
                    const hasSubSub = !!sub.subItems;
                    const subOpen = openMenus[sub.label] || false;
                    const iconClass = `w-4 h-4 ${
                      sub.label === 'Supplier entry' ||
                      sub.label === 'Product entry' ||
                      item.label === 'List' ||
                      item.label === 'Stock Hub' ||
                      item.label === 'Deals & Offers'
                        ? 'filter brightness-0 invert'
                        : ''
                    }`.trim();

                    if (hasSubSub) {
                      return (
                        <div key={`${item.label}-${sub.label}`}>
                          <div
                            onClick={() => toggleMenu(sub.label)}
                            className="mx-2 flex items-center justify-between gap-2.5 p-2 rounded-[10px] text-white text-[0.825rem] font-light cursor-pointer hover:bg-white/8"
                          >
                            <div className="flex items-center gap-2.5">
                              <img src={sub.icon} alt="" className={iconClass} />
                              <span>{sub.label}</span>
                            </div>
                            <img
                              src={ChevronDown}
                              alt="toggle"
                              className={`w-3 h-3 transition-transform duration-200 ${subOpen ? 'rotate-180' : ''}`}
                            />
                          </div>
                          {subOpen && (
                            <div className="bg-black/10">
                              {sub.subItems.map((leaf) => (
                                <NavLink
                                  key={`${sub.label}-${leaf.label}`}
                                  to={leaf.to}
                                  className={({ isActive }) =>
                                    `mx-3 flex items-center gap-2 p-1.5 rounded-[8px] text-white text-[0.775rem] no-underline transition ${
                                      isActive
                                        ? 'bg-white/15 border border-white/25 shadow-[0_4px_8px_0_rgba(0,0,0,0.25)] font-medium'
                                        : 'hover:bg-white/8 font-light'
                                    }`
                                  }
                                >
                                  <img src={leaf.icon} alt="" className="w-3.5 h-3.5 filter brightness-0 invert" />
                                  <span>{leaf.label}</span>
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
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
                        <img src={sub.icon} alt="" className={iconClass} />
                        <span>{sub.label}</span>
                      </NavLink>
                    );
                  })}
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
