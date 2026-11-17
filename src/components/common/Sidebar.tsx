import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Laptop,
  CalendarRange,
  ShoppingBag,
  Wrench,
  Receipt,
  CreditCard,
  Truck,
  FileSpreadsheet,
  Settings,
  X,
  AlertCircle,
  Clock,
  LogOut,
  Shield,
} from 'lucide-react';
import { CloudTechLogo } from './CloudTechLogo';
import { useApp, ActiveView } from '../../context/AppContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    currentView,
    setCurrentView,
    assets,
    rentals,
    serviceRequests,
    invoices,
    currentUser,
    logout,
  } = useApp();

  const overdueCount = rentals.filter((r) => r.status === 'Overdue').length;
  const inspectionPendingCount = assets.filter(
    (a) => a.status === 'Returned - Inspection Pending'
  ).length;
  const pendingServiceCount = serviceRequests.filter(
    (s) => s.status !== 'Completed' && s.status !== 'Delivered' && s.status !== 'Cancelled'
  ).length;
  const pendingInvoicesCount = invoices.filter(
    (i) => i.paymentStatus === 'Pending' || i.paymentStatus === 'Overdue'
  ).length;

  const navItems: Array<{
    id: ActiveView;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    highlight?: boolean;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'customer360',
      label: 'Customer & Contract 360°',
      icon: UserCheck,
      highlight: true,
      badge: 'Core',
      badgeColor: 'bg-[#00D5E8]/20 text-[#073DBB]',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
    },
    {
      id: 'assets',
      label: 'Assets & Inventory',
      icon: Laptop,
      badge: assets.length,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'rentals',
      label: 'Rentals & Returns',
      icon: CalendarRange,
      badge: overdueCount > 0 ? `${overdueCount} Overdue` : inspectionPendingCount > 0 ? `${inspectionPendingCount} Inspect` : undefined,
      badgeColor: overdueCount > 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
    },
    {
      id: 'sales',
      label: 'Sales Management',
      icon: ShoppingBag,
    },
    {
      id: 'service',
      label: 'Service & Repairs',
      icon: Wrench,
      badge: pendingServiceCount > 0 ? pendingServiceCount : undefined,
      badgeColor: 'bg-indigo-50 text-indigo-700',
    },
    {
      id: 'invoices',
      label: 'Invoices & Billing',
      icon: Receipt,
      badge: pendingInvoicesCount > 0 ? `${pendingInvoicesCount} Due` : undefined,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'payments',
      label: 'Payments & Receipts',
      icon: CreditCard,
    },
    {
      id: 'purchases',
      label: 'Purchases & Suppliers',
      icon: Truck,
    },
    {
      id: 'reports',
      label: 'Reports & Exports',
      icon: FileSpreadsheet,
    },
    {
      id: 'settings',
      label: currentUser?.role === 'Admin' ? 'Settings & Admin' : 'Settings',
      icon: Settings,
      badge: currentUser?.role === 'Admin' ? 'Admin' : undefined,
      badgeColor: 'bg-blue-50 text-[#073DBB]',
    },
  ];

  const handleNavClick = (viewId: ActiveView) => {
    setCurrentView(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <CloudTechLogo variant="full" size="sm" />
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white shadow-xs'
                      : item.highlight
                      ? 'text-slate-800 hover:bg-blue-50/80 hover:text-[#073DBB]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-[#087BEF]'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Alert & Account Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 space-y-2.5">
          {overdueCount > 0 ? (
            <div
              onClick={() => handleNavClick('rentals')}
              className="p-2.5 bg-red-50 border border-red-200 rounded-xl cursor-pointer hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Action Required ({overdueCount} Overdue)</span>
              </div>
              <p className="text-[11px] text-red-700 mt-0.5 leading-snug">
                Follow up with client or extend lease.
              </p>
            </div>
          ) : inspectionPendingCount > 0 ? (
            <div
              onClick={() => handleNavClick('rentals')}
              className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Inspection Pending ({inspectionPendingCount})</span>
              </div>
              <p className="text-[11px] text-amber-700 mt-0.5 leading-snug">
                Returned devices awaiting technician review.
              </p>
            </div>
          ) : null}

          <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                <span>{currentUser?.name || 'Admin'}</span>
                {currentUser?.role === 'Admin' && (
                  <Shield className="w-3 h-3 text-[#073DBB] shrink-0" />
                )}
              </div>
              <div className="text-[10px] text-slate-500 truncate">{currentUser?.role}</div>
            </div>

            <button
              type="button"
              onClick={() => {
                onCloseMobile();
                logout();
              }}
              className="px-2.5 py-2 min-h-[36px] text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
