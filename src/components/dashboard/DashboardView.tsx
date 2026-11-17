import React, { useState } from 'react';
import {
  Laptop,
  Monitor,
  CheckCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  Wrench,
  DollarSign,
  Users,
  TrendingUp,
  ArrowRight,
  Calendar,
  Filter,
  PackageX,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const {
    assets,
    customers,
    rentals,
    sales,
    serviceRequests,
    invoices,
    payments,
    settings,
    setCurrentView,
    navigateToCustomer360,
    navigateToAssetDetail,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'last_30_days'>('all');

  // Asset counts
  const totalAssets = assets.length;
  const availableAssets = assets.filter((a) => a.status === 'Available').length;
  const rentedAssets = assets.filter((a) => a.status === 'Rented').length;
  const underServiceAssets = assets.filter((a) => a.status === 'Under Service').length;
  const inspectionPendingAssets = assets.filter(
    (a) => a.status === 'Returned - Inspection Pending'
  ).length;
  const damagedAssets = assets.filter((a) => a.status === 'Damaged').length;
  const soldAssets = assets.filter((a) => a.status === 'Sold').length;

  // Rental statistics
  const activeRentals = rentals.filter((r) => r.status === 'Active' || r.status === 'Partially Returned');
  const overdueRentals = rentals.filter((r) => r.status === 'Overdue');

  // Financial statistics
  const rentalRevenue = payments
    .filter((p) => p.paymentType === 'Rental Fee')
    .reduce((sum, p) => sum + p.amount, 0);

  const salesRevenue = payments
    .filter((p) => p.paymentType === 'Sale Payment')
    .reduce((sum, p) => sum + p.amount, 0);

  const securityDepositsHeld = invoices.reduce(
    (sum, inv) => sum + (inv.securityDeposit || 0),
    0
  );

  const totalOutstandingBalance = invoices.reduce(
    (sum, inv) => sum + inv.balanceDue,
    0
  );

  const formatCurrency = (val: number) => {
    return `${settings.currencySymbol}${val.toLocaleString('en-IN')}`;
  };

  // Category breakdown for split cards (Requirement 2: Dashboard need to Card how much Laptop and How much Desktop each split card need)
  const laptopAssets = assets.filter((a) => a.category === 'Laptop');
  const desktopAssets = assets.filter((a) => a.category === 'Desktop');

  const totalLaptops = laptopAssets.length;
  const laptopsAvailable = laptopAssets.filter((a) => a.status === 'Available').length;
  const laptopsRented = laptopAssets.filter((a) => a.status === 'Rented').length;
  const laptopsService = laptopAssets.filter((a) => a.status === 'Under Service' || a.status === 'Damaged').length;

  const totalDesktops = desktopAssets.length;
  const desktopsAvailable = desktopAssets.filter((a) => a.status === 'Available').length;
  const desktopsRented = desktopAssets.filter((a) => a.status === 'Rented').length;
  const desktopsService = desktopAssets.filter((a) => a.status === 'Under Service' || a.status === 'Damaged').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero with CloudTech Branding */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#073DBB] via-[#087BEF] to-[#00D5E8] p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-200 text-xs font-semibold uppercase tracking-wider">
              <span>Enterprise Fleet Management</span>
              <span>·</span>
              <span>{settings.companyName} {settings.brandTagline}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-white">
              Operations & Inventory Control Center
            </h2>
            <p className="text-blue-100 text-xs md:text-sm mt-1 max-w-2xl">
              Real-time monitoring of {totalAssets} physical laptops & desktops, active customer leases, service requests, and receivables.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setCurrentView('rentals')}
              className="px-4 py-2.5 bg-white text-[#073DBB] hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>+ New Rental</span>
            </button>
            <button
              onClick={() => setCurrentView('customer360')}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl backdrop-blur-xs transition-all flex items-center gap-1.5"
            >
              <span>Customer 360°</span>
            </button>
          </div>
        </div>
      </div>

      {/* Unified Fleet & Status KPI Cards Grid (Consistent Dimensions & Styling) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Total Fleet */}
        <div
          onClick={() => setCurrentView('assets')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-[#073DBB] hover:shadow-xs cursor-pointer transition-all group"
          title="View all hardware in fleet"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Fleet</span>
            <div className="p-1 rounded-md bg-blue-50 text-[#073DBB] group-hover:scale-110 transition-transform">
              <Laptop className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">{totalAssets}</div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">Laptops & Desktops</div>
        </div>

        {/* 2. Total Laptops */}
        <div
          onClick={() => setCurrentView('assets')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-[#087BEF] hover:shadow-xs cursor-pointer transition-all group"
          title="Filter and view Laptop fleet"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#073DBB]">Total Laptops</span>
            <div className="p-1 rounded-md bg-blue-50 text-[#073DBB] group-hover:scale-110 transition-transform">
              <Laptop className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#073DBB] tabular-nums">{totalLaptops}</div>
          <div className="text-[11px] text-slate-500 mt-1 truncate font-medium">
            <span className="text-emerald-700 font-semibold">{laptopsAvailable}A</span> · <span className="text-[#073DBB] font-semibold">{laptopsRented}R</span>
          </div>
        </div>

        {/* 3. Total Desktops */}
        <div
          onClick={() => setCurrentView('assets')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-[#00D5E8] hover:shadow-xs cursor-pointer transition-all group"
          title="Filter and view Desktop fleet"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#087BEF]">Total Desktops</span>
            <div className="p-1 rounded-md bg-cyan-50 text-[#087BEF] group-hover:scale-110 transition-transform">
              <Monitor className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#087BEF] tabular-nums">{totalDesktops}</div>
          <div className="text-[11px] text-slate-500 mt-1 truncate font-medium">
            <span className="text-emerald-700 font-semibold">{desktopsAvailable}A</span> · <span className="text-[#087BEF] font-semibold">{desktopsRented}R</span>
          </div>
        </div>

        {/* 4. Available Assets */}
        <div
          onClick={() => setCurrentView('assets')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-xs cursor-pointer transition-all group"
          title="View available assets"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">Available</span>
            <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 tabular-nums">{availableAssets}</div>
          <div className="text-[11px] text-emerald-700 mt-1 truncate">Ready to deploy</div>
        </div>

        {/* 5. Currently Rented */}
        <div
          onClick={() => setCurrentView('rentals')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-[#087BEF] hover:shadow-xs cursor-pointer transition-all group"
          title="View active rentals"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#087BEF]">Rented</span>
            <div className="p-1 rounded-md bg-blue-50 text-[#087BEF] group-hover:scale-110 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#087BEF] tabular-nums">{rentedAssets}</div>
          <div className="text-[11px] text-blue-700 mt-1 truncate">{activeRentals.length} active leases</div>
        </div>

        {/* 6. Overdue Returns */}
        <div
          onClick={() => setCurrentView('rentals')}
          className={`p-3.5 rounded-xl border shadow-2xs hover:shadow-xs cursor-pointer transition-all group ${
            overdueRentals.length > 0
              ? 'bg-red-50/50 border-red-200 hover:border-red-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
          title="View overdue rentals"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-700">Overdue</span>
            <div className="p-1 rounded-md bg-red-100 text-red-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600 tabular-nums">
            {overdueRentals.length}
          </div>
          <div className="text-[11px] text-red-600 mt-1 truncate">Follow-up needed</div>
        </div>

        {/* 7. Under Service */}
        <div
          onClick={() => setCurrentView('service')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-xs cursor-pointer transition-all group"
          title="View devices in service"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">Service</span>
            <div className="p-1 rounded-md bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 tabular-nums">
            {underServiceAssets}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">Repairs & maint</div>
        </div>

        {/* 8. Inspection Desk */}
        <div
          onClick={() => setCurrentView('rentals')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-xs cursor-pointer transition-all group"
          title="View returns pending inspection"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Inspection</span>
            <div className="p-1 rounded-md bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 tabular-nums">
            {inspectionPendingAssets}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 truncate">Returned devices</div>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Rental Revenue Collected</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2 tabular-nums">
            {formatCurrency(rentalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Excludes security deposits</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Sales Revenue Realized</span>
            <DollarSign className="w-4 h-4 text-[#073DBB]" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2 tabular-nums">
            {formatCurrency(salesRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{soldAssets} devices sold outright</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Security Deposits Held</span>
            <CreditCard className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2 tabular-nums">
            {formatCurrency(securityDepositsHeld)}
          </div>
          <div className="text-[11px] text-cyan-700 mt-1">Refundable on return</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Outstanding Receivables</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-bold text-red-600 mt-2 tabular-nums">
            {formatCurrency(totalOutstandingBalance)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all open invoices</div>
        </div>
      </div>

      {/* Two Column Grid: Overdue Action Center & Fleet Inventory Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue & Upcoming Returns Action Center */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Rental Due Date Alerts</h3>
              <p className="text-[11px] text-slate-500">
                Actionable returns & upcoming contract expiries
              </p>
            </div>
            <button
              onClick={() => setCurrentView('rentals')}
              className="text-xs text-[#087BEF] hover:text-[#073DBB] font-semibold flex items-center gap-1"
            >
              <span>View All Rentals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {overdueRentals.length > 0 ? (
              overdueRentals.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-800">{r.customerName}</span>
                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold">
                        OVERDUE
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      Rental {r.rentalId} · Due on {r.expectedReturnDate} · {r.items.length} device(s)
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigateToCustomer360(r.customerId)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-red-200 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Customer 360
                    </button>
                    <button
                      onClick={() => setCurrentView('rentals')}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Return / Extend
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No rentals are currently overdue.
              </div>
            )}

            {/* Upcoming active returns */}
            {activeRentals
              .filter((r) => r.status === 'Active')
              .slice(0, 3)
              .map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{r.customerName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {r.rentalId} · Expected Return: {r.expectedReturnDate} · Rate: {formatCurrency(r.ratePerPeriod)}/mo
                    </div>
                  </div>
                  <button
                    onClick={() => navigateToCustomer360(r.customerId)}
                    className="text-xs font-semibold text-[#087BEF] hover:underline"
                  >
                    View
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Fleet Composition & Hardware Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inventory Status Distribution</h3>
              <p className="text-[11px] text-slate-500">Asset lifecycle state tracking</p>
            </div>
            <button
              onClick={() => setCurrentView('assets')}
              className="text-xs text-[#087BEF] hover:text-[#073DBB] font-semibold flex items-center gap-1"
            >
              <span>Asset Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {/* Laptops vs Desktops */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Fleet Category</span>
                <span>
                  {assets.filter((a) => a.category === 'Laptop').length} Laptops ·{' '}
                  {assets.filter((a) => a.category === 'Desktop').length} Desktops
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#073DBB] h-full"
                  style={{
                    width: `${(assets.filter((a) => a.category === 'Laptop').length / totalAssets) * 100}%`,
                  }}
                  title="Laptops"
                />
                <div
                  className="bg-[#00D5E8] h-full"
                  style={{
                    width: `${(assets.filter((a) => a.category === 'Desktop').length / totalAssets) * 100}%`,
                  }}
                  title="Desktops"
                />
              </div>
            </div>

            {/* Status Breakdown items */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg flex items-center justify-between">
                <span className="text-emerald-800 font-medium">Available</span>
                <span className="font-bold text-emerald-700 tabular-nums">{availableAssets}</span>
              </div>
              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg flex items-center justify-between">
                <span className="text-blue-800 font-medium">Rented</span>
                <span className="font-bold text-[#073DBB] tabular-nums">{rentedAssets}</span>
              </div>
              <div className="p-2.5 bg-amber-50/70 border border-amber-100 rounded-lg flex items-center justify-between">
                <span className="text-amber-800 font-medium">Returned - Inspection</span>
                <span className="font-bold text-amber-700 tabular-nums">
                  {inspectionPendingAssets}
                </span>
              </div>
              <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-center justify-between">
                <span className="text-indigo-800 font-medium">Under Service</span>
                <span className="font-bold text-indigo-700 tabular-nums">{underServiceAssets}</span>
              </div>
              <div className="p-2.5 bg-purple-50/70 border border-purple-100 rounded-lg flex items-center justify-between">
                <span className="text-purple-800 font-medium">Sold Outright</span>
                <span className="font-bold text-purple-700 tabular-nums">{soldAssets}</span>
              </div>
              <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-lg flex items-center justify-between">
                <span className="text-rose-800 font-medium">Damaged / Repair</span>
                <span className="font-bold text-rose-700 tabular-nums">{damagedAssets}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity: Recent Rentals & Recent Service Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Rentals */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Rental Agreements</h3>
            <button
              onClick={() => setCurrentView('rentals')}
              className="text-xs text-[#087BEF] font-semibold hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {rentals.slice(0, 4).map((r) => (
              <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <span>{r.customerName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({r.rentalId})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Start: {r.startDate} · {r.items.length} Asset(s) · {formatCurrency(r.totalRentalAmount)}
                  </div>
                </div>
                <button
                  onClick={() => navigateToCustomer360(r.customerId)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#073DBB] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  360° Profile
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Service Cases */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Active Service & Repair Cases</h3>
            <button
              onClick={() => setCurrentView('service')}
              className="text-xs text-[#087BEF] font-semibold hover:underline"
            >
              Open Service Center
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {serviceRequests.slice(0, 4).map((s) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <span>{s.deviceDetails}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                      {s.serviceType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Client: {s.customerName} · Status: <span className="font-semibold text-slate-700">{s.status}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-800 tabular-nums">
                  {formatCurrency(s.estimate)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
