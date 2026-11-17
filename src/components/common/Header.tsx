import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Shield,
  LogOut,
  Settings,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    currentView,
    setCurrentView,
    rentals,
    assets,
    customers,
    navigateToCustomer360,
    navigateToAssetDetail,
    currentUser,
    logout,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AD';

  // Overdue rentals
  const overdueRentals = rentals.filter((r) => r.status === 'Overdue');
  // Inspection pending assets
  const inspectionPendingAssets = assets.filter(
    (a) => a.status === 'Returned - Inspection Pending'
  );

  // Search results
  const matchingCustomers = searchQuery.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.mobile.includes(searchQuery) ||
          (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const matchingAssets = searchQuery.trim()
    ? assets.filter(
        (a) =>
          a.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const totalNotifications = overdueRentals.length + inspectionPendingAssets.length;

  const getBreadcrumb = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Overview & Real-Time Business Health';
      case 'customer360':
        return 'Customer & Contract 360° Comprehensive Profile';
      case 'customers':
        return 'Customer Directory & Accounts Master';
      case 'assets':
        return 'Physical Asset Registry & Inventory';
      case 'rentals':
        return 'Rental Contracts, Extensions & Returns';
      case 'sales':
        return 'Outright Sales & Asset Disposals';
      case 'service':
        return 'Hardware Diagnostics & Repair Center';
      case 'invoices':
        return 'Billing Engine & Tax Invoices';
      case 'payments':
        return 'Payment Ledger & Deposit Receipts';
      case 'purchases':
        return 'Supplier Procurement & Asset Intake';
      case 'reports':
        return 'Business Intelligence & Data Exports';
      case 'settings':
        return 'Company Profile & Billing Configuration';
      default:
        return 'CloudTech Portal';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden hover:bg-slate-100 transition-colors"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
            <span className="font-semibold text-[#073DBB] hidden sm:inline">CloudTech</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <h1 className="font-semibold text-slate-900 text-sm md:text-base tracking-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {getBreadcrumb()}
            </h1>
          </div>
        </div>

        {/* Center: Global Search Bar with Live Popover */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Customer ID, Name, Mobile, Asset ID or Serial..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#087BEF] focus:ring-2 focus:ring-[#087BEF]/20 rounded-lg text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchResults && searchQuery.trim() && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSearchResults(false)}
              />
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden max-h-96 overflow-y-auto">
                <div className="p-2 border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Search Results
                </div>

                {matchingCustomers.length === 0 && matchingAssets.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching records found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {matchingCustomers.length > 0 && (
                      <div className="p-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1">
                          Customers
                        </div>
                        {matchingCustomers.map((cust) => (
                          <button
                            key={cust.id}
                            onClick={() => {
                              navigateToCustomer360(cust.customerId);
                              setShowSearchResults(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-2 py-2 rounded-lg hover:bg-blue-50 text-xs flex items-center justify-between group transition-colors"
                          >
                            <div>
                              <div className="font-semibold text-slate-800 group-hover:text-[#073DBB]">
                                {cust.name} {cust.companyName && `· ${cust.companyName}`}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {cust.customerId} · 📞 {cust.mobile}
                              </div>
                            </div>
                            <span className="text-[10px] text-[#087BEF] font-medium bg-blue-50 px-2 py-0.5 rounded">
                              View 360°
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {matchingAssets.length > 0 && (
                      <div className="p-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1">
                          Assets & Inventory
                        </div>
                        {matchingAssets.map((asset) => (
                          <button
                            key={asset.id}
                            onClick={() => {
                              navigateToAssetDetail(asset.assetId);
                              setShowSearchResults(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-2 py-2 rounded-lg hover:bg-cyan-50 text-xs flex items-center justify-between group transition-colors"
                          >
                            <div>
                              <div className="font-semibold text-slate-800 group-hover:text-[#073DBB]">
                                {asset.brand} {asset.model}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {asset.assetId} · S/N: {asset.serialNumber} · {asset.category}
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                                asset.status === 'Available'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : asset.status === 'Rented'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {asset.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Zone: Quick stats notifications + Admin badge */}
        <div className="flex items-center gap-3">
          {/* Quick Action: New Rental */}
          <button
            onClick={() => setCurrentView('rentals')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] rounded-lg shadow-xs hover:shadow transition-all whitespace-nowrap shrink-0"
          >
            <span>+ Quick Rental</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="View system alerts"
            >
              <Bell className="w-5 h-5" />
              {totalNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {totalNotifications}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-900">
                      Operational Alerts ({totalNotifications})
                    </span>
                    <span className="text-[11px] text-slate-500">Real-time status</span>
                  </div>

                  <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                    {overdueRentals.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-red-50 border border-red-100 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-red-700 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Overdue Returns ({overdueRentals.length})</span>
                        </div>
                        {overdueRentals.map((r) => (
                          <div
                            key={r.id}
                            onClick={() => {
                              setCurrentView('rentals');
                              setShowNotifications(false);
                            }}
                            className="mt-1 cursor-pointer hover:underline text-red-900"
                          >
                            • {r.customerName} - {r.rentalId} (Due: {r.expectedReturnDate})
                          </div>
                        ))}
                      </div>
                    )}

                    {inspectionPendingAssets.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-100 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-amber-700 mb-1">
                          <RotateCcw className="w-4 h-4" />
                          <span>Inspection Pending ({inspectionPendingAssets.length})</span>
                        </div>
                        {inspectionPendingAssets.map((a) => (
                          <div
                            key={a.id}
                            onClick={() => {
                              setCurrentView('rentals');
                              setShowNotifications(false);
                            }}
                            className="mt-1 cursor-pointer hover:underline text-amber-900"
                          >
                            • {a.brand} {a.model} ({a.assetId})
                          </div>
                        ))}
                      </div>
                    )}

                    {totalNotifications === 0 && (
                      <div className="p-4 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <span>All assets and returns are up to date!</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Authenticated User Account Menu */}
          <div className="relative pl-2 border-l border-slate-200">
            <button
              type="button"
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Open account menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#073DBB] to-[#00D5E8] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                {userInitials}
              </div>
              <div className="hidden lg:block leading-tight text-left">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <span className="truncate max-w-[110px]">{currentUser?.name || 'Admin'}</span>
                  {currentUser?.role === 'Admin' ? (
                    <Shield className="w-3 h-3 text-[#087BEF] shrink-0" />
                  ) : (
                    <UserIcon className="w-3 h-3 text-slate-400 shrink-0" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500">{currentUser?.role || 'Admin'}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden text-xs">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 truncate">
                        {currentUser?.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#073DBB] shrink-0">
                        {currentUser?.role}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 truncate">
                      {currentUser?.email}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {currentUser?.department}
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    {currentUser?.role === 'Admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold transition-colors text-left cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-[#073DBB]" />
                        <span>Admin & User Settings</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-700 hover:bg-red-50 font-semibold transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
