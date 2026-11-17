import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  CreditCard,
  Laptop,
  CheckCircle,
  Clock,
  RotateCcw,
  ShoppingBag,
  Wrench,
  Receipt,
  FileText,
  AlertCircle,
  ExternalLink,
  Plus,
  Eye,
  Filter,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Pagination } from '../common/Pagination';

export const Customer360View: React.FC = () => {
  const {
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    assets,
    rentals,
    returns,
    sales,
    serviceRequests,
    invoices,
    payments,
    settings,
    setCurrentView,
    navigateToAssetDetail,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Business' | 'Individual'>('all');
  const [assignedFilter, setAssignedFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [activeTab, setActiveTab] = useState<'active_devices' | 'rental_history' | 'sales' | 'services' | 'invoices_payments'>('active_devices');

  // Customer 360 View Modal State (Requirement 2)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalCustomerId, setModalCustomerId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'active_devices' | 'rental_history' | 'sales' | 'services' | 'invoices_payments'>('active_devices');

  // Pagination State for Directory (Requirement 3)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Default first index (Requirement 3: default first index and first selected show list)
  const currentCustomerId = selectedCustomerId || (customers[0] ? customers[0].customerId : null);

  // Find selected customer
  const currentCustomer = customers.find(
    (c) => c.customerId === currentCustomerId || c.id === currentCustomerId
  ) || customers[0];

  // Customer for Modal View
  const targetModalCustomer = customers.find(
    (c) => c.customerId === modalCustomerId || c.id === modalCustomerId
  ) || currentCustomer;

  const formatCurrency = (val: number) => `${settings.currencySymbol}${val.toLocaleString('en-IN')}`;

  // Transactions linked to current selected customer
  const customerRentals = rentals.filter(
    (r) => r.customerId === currentCustomer?.customerId
  );

  const customerReturns = returns.filter(
    (ret) => ret.customerId === currentCustomer?.customerId
  );

  const customerSales = sales.filter(
    (s) => s.customerId === currentCustomer?.customerId
  );

  const customerServices = serviceRequests.filter(
    (srv) => srv.customerId === currentCustomer?.customerId
  );

  const customerInvoices = invoices.filter(
    (inv) => inv.customerId === currentCustomer?.customerId
  );

  const customerPayments = payments.filter(
    (pay) => pay.customerId === currentCustomer?.customerId
  );

  // Active rented devices for currently selected customer
  const activeRentalItems: Array<{
    rentalId: string;
    startDate: string;
    expectedReturnDate: string;
    rate: number;
    securityDeposit: number;
    asset: (typeof assets)[0];
  }> = [];

  customerRentals
    .filter((r) => r.status === 'Active' || r.status === 'Partially Returned' || r.status === 'Overdue')
    .forEach((rental) => {
      rental.items
        .filter((item) => item.status === 'Active')
        .forEach((item) => {
          const matchedAsset = assets.find((a) => a.assetId === item.assetId);
          if (matchedAsset) {
            activeRentalItems.push({
              rentalId: rental.rentalId,
              startDate: rental.startDate,
              expectedReturnDate: rental.expectedReturnDate,
              rate: item.rate,
              securityDeposit: rental.securityDeposit / (rental.items.length || 1),
              asset: matchedAsset,
            });
          }
        });
    });

  // Calculate totals without double counting for selected customer
  const allRentedAssetIds = new Set<string>();
  customerRentals.forEach((r) => {
    r.items.forEach((item) => allRentedAssetIds.add(item.assetId));
  });

  const currentlyRentedCount = activeRentalItems.length;
  const previouslyRentedAndReturnedCount = Math.max(0, allRentedAssetIds.size - currentlyRentedCount);
  const totalDevicesEverRented = allRentedAssetIds.size;
  const purchasedDevicesCount = customerSales.reduce((sum, s) => sum + s.items.length, 0);

  const totalInvoiced = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = customerInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstandingBalance = customerInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalDepositsHeld = customerInvoices.reduce((sum, inv) => sum + (inv.securityDeposit || 0), 0);

  // Filter Customer List based on Search, Business/Individual Type, and Assigned status (Requirement 3)
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || c.type === typeFilter;

    // Check if customer has active assigned devices
    const custActiveRentals = rentals.filter(
      (r) =>
        r.customerId === c.customerId &&
        (r.status === 'Active' || r.status === 'Partially Returned' || r.status === 'Overdue')
    );
    const hasAssigned = custActiveRentals.some((r) =>
      r.items.some((i) => i.status === 'Active')
    );

    let matchesAssigned = true;
    if (assignedFilter === 'assigned') {
      matchesAssigned = hasAssigned;
    } else if (assignedFilter === 'unassigned') {
      matchesAssigned = !hasAssigned;
    }

    return matchesSearch && matchesType && matchesAssigned;
  });

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  // Paginated customers for Directory list (Requirement 3: rows 10, 20, 50)
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenViewModal = (customer: (typeof customers)[0]) => {
    handleSelectCustomer(customer.customerId);
    setModalCustomerId(customer.customerId);
    setModalTab('active_devices');
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Requirement 3 Header: Customer & Contract 360 Directory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Customer & Contract 360° Directory
          </h2>
          <p className="text-xs text-slate-500">
            Select any customer from the directory list below to inspect their full 360° device lifecycle and financials
          </p>
        </div>

        <button
          onClick={() => setCurrentView('customers')}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs"
        >
          Manage All Customers
        </button>
      </div>

      {/* Filter and Search Bar for Customers List (Requirement 3: filtered by assigned and Business or Individual) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Customer ID, Name, HexaByte, Mobile..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#087BEF] outline-none transition-all"
            />
          </div>

          {/* Dropdown Filters (Requirement 3: Business/Individual & Assigned dropdowns) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Entity Type Dropdown: Business or Individual */}
            <div className="flex items-center gap-2">
              <label htmlFor="customer-type-filter" className="text-xs font-bold text-slate-600 whitespace-nowrap">
                Type:
              </label>
              <select
                id="customer-type-filter"
                aria-label="Filter customers by type"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-[#087BEF] outline-none transition-all"
              >
                <option value="all">All Types ({customers.length})</option>
                <option value="Business">
                  Business ({customers.filter((c) => c.type === 'Business').length})
                </option>
                <option value="Individual">
                  Individual ({customers.filter((c) => c.type === 'Individual').length})
                </option>
              </select>
            </div>

            {/* Assigned Status Dropdown: Assigned Devices or Unassigned */}
            <div className="flex items-center gap-2">
              <label htmlFor="device-assignment-filter" className="text-xs font-bold text-slate-600 whitespace-nowrap">
                Device Assignment:
              </label>
              <select
                id="device-assignment-filter"
                aria-label="Filter customers by device assignment status"
                value={assignedFilter}
                onChange={(e) => {
                  setAssignedFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-[#087BEF] outline-none transition-all"
              >
                <option value="all">All Customers</option>
                <option value="assigned">Has Active Assigned Devices</option>
                <option value="unassigned">No Active Devices</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Directory Table (Requirement 3: show list have All customer details, default first index selected, view icon column) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">
            Customers & Active Accounts Directory ({filteredCustomers.length})
          </span>
          <span className="text-slate-500 text-[11px]">
            Selected: <strong className="text-[#073DBB]">{currentCustomer?.name} ({currentCustomer?.customerId})</strong>
          </span>
        </div>

        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-slate-100 text-slate-600 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200 z-10">
              <tr>
                <th className="py-2.5 px-4">Customer ID</th>
                <th className="py-2.5 px-4">Customer Name & Entity</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Mobile & Email</th>
                <th className="py-2.5 px-4">City</th>
                <th className="py-2.5 px-4">Active Assigned</th>
                <th className="py-2.5 px-4">Balance Due</th>
                {/* View Icon Column (Requirement 2 & 3: click view opens modal with 360 details) */}
                <th className="py-2.5 px-4 text-center">View 360°</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No customers match the current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => {
                  const isSelected = currentCustomer?.customerId === c.customerId;

                  // Active assigned devices count for this customer row
                  const custRentals = rentals.filter(
                    (r) =>
                      r.customerId === c.customerId &&
                      (r.status === 'Active' || r.status === 'Partially Returned' || r.status === 'Overdue')
                  );
                  const activeCount = custRentals.reduce(
                    (sum, r) => sum + r.items.filter((i) => i.status === 'Active').length,
                    0
                  );

                  // Outstanding balance for this customer
                  const custInvoices = invoices.filter((i) => i.customerId === c.customerId);
                  const balanceDue = custInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleSelectCustomer(c.customerId)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/90 font-medium text-slate-900 border-l-4 border-l-[#073DBB]'
                          : 'hover:bg-slate-50/70 text-slate-700'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono font-bold text-[#073DBB]">
                        {c.customerId}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        {c.companyName && (
                          <div className="text-[11px] text-slate-500">{c.companyName}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            c.type === 'Business'
                              ? 'bg-blue-100 text-[#073DBB]'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px]">
                        <div>{c.mobile}</div>
                        <div className="text-slate-400 text-[10px] font-sans truncate max-w-[140px]">{c.email}</div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{c.city}</td>
                      <td className="py-2.5 px-4">
                        {activeCount > 0 ? (
                          <span className="font-bold text-[#087BEF] bg-blue-100/70 px-2 py-0.5 rounded text-[11px] tabular-nums">
                            {activeCount} device(s)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">0 active</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        {balanceDue > 0 ? (
                          <span className="font-bold text-red-600 tabular-nums">
                            {formatCurrency(balanceDue)}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-[11px]">Nil</span>
                        )}
                      </td>
                      {/* View icon column (Requirement 2 & 3: click view opens modal with 360 details) */}
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenViewModal(c);
                          }}
                          className={`p-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 shadow-2xs ${
                            isSelected
                              ? 'bg-[#073DBB] text-white shadow-xs'
                              : 'bg-blue-50 text-[#073DBB] hover:bg-[#073DBB] hover:text-white'
                          }`}
                          title={`View full 360° modal details for ${c.name}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold">View 360°</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Directory Bottom Pagination (Requirement 3: rows 10, 20, 50) */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredCustomers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {currentCustomer ? (
        <>
          {/* Customer Profile Banner & 360 Header for Selected Customer */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-[#073DBB] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 text-white flex items-center justify-center font-bold text-xl shadow-inner">
                  {currentCustomer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                      {currentCustomer.name}
                    </h2>
                    <span className="text-xs bg-white/20 text-cyan-200 px-2 py-0.5 rounded font-mono font-medium">
                      {currentCustomer.customerId}
                    </span>
                    <span className="text-xs bg-[#00D5E8]/30 text-white px-2 py-0.5 rounded font-semibold">
                      {currentCustomer.type}
                    </span>
                  </div>

                  {currentCustomer.companyName && (
                    <div className="flex items-center gap-1.5 text-blue-200 text-xs mt-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>{currentCustomer.companyName}</span>
                      {currentCustomer.gstNumber && (
                        <span>· GSTIN: <strong className="font-mono text-white">{currentCustomer.gstNumber}</strong></span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-cyan-300" />
                      <span>{currentCustomer.mobile}</span>
                      {currentCustomer.altMobile && <span>/ {currentCustomer.altMobile}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-cyan-300" />
                      <span>{currentCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-300" />
                      <span>{currentCustomer.city}, {currentCustomer.state}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCurrentView('rentals')}
                  className="px-3.5 py-2 text-xs font-bold text-[#073DBB] bg-white hover:bg-blue-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Issue Rental</span>
                </button>
                <button
                  onClick={() => setCurrentView('invoices')}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Billing Ledger</span>
                </button>
              </div>
            </div>

            {/* Address & Operational Notes Details Bar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <strong className="text-slate-800">Billing & Delivery:</strong>{' '}
                {currentCustomer.billingAddress}, {currentCustomer.city} - {currentCustomer.pinCode}
              </div>
              {currentCustomer.notes && (
                <div className="text-slate-500 italic max-w-md truncate">
                  <strong className="text-slate-700 not-italic">Notes:</strong> {currentCustomer.notes}
                </div>
              )}
            </div>

            {/* 360-Degree Metrics Strip (Reconciled from underlying records) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-slate-100 border-b border-slate-200 bg-white">
              <div className="p-4 text-center">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Active Rented
                </div>
                <div className="text-xl font-extrabold text-[#087BEF] mt-1 tabular-nums">
                  {currentlyRentedCount}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Currently deployed</div>
              </div>

              <div className="p-4 text-center">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Ever Rented
                </div>
                <div className="text-xl font-extrabold text-slate-800 mt-1 tabular-nums">
                  {totalDevicesEverRented}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {previouslyRentedAndReturnedCount} returned
                </div>
              </div>

              <div className="p-4 text-center">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Purchased
                </div>
                <div className="text-xl font-extrabold text-emerald-700 mt-1 tabular-nums">
                  {purchasedDevicesCount}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Outright sales</div>
              </div>

              <div className="p-4 text-center">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Services
                </div>
                <div className="text-xl font-extrabold text-indigo-700 mt-1 tabular-nums">
                  {customerServices.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Repair cases</div>
              </div>

              <div className="p-4 text-center">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Invoiced
                </div>
                <div className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {formatCurrency(totalInvoiced)}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  Paid: {formatCurrency(totalPaid)}
                </div>
              </div>

              <div className="p-4 text-center bg-red-50/40">
                <div className="text-[11px] font-semibold text-red-700 uppercase tracking-wider">
                  Balance Due
                </div>
                <div className="text-xl font-extrabold text-red-600 mt-1 tabular-nums">
                  {formatCurrency(totalOutstandingBalance)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Deposit Held: {formatCurrency(totalDepositsHeld)}
                </div>
              </div>
            </div>
          </div>

          {/* Customer 360 Transaction Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Segmented Tab Navigation */}
            <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('active_devices')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-2 ${
                  activeTab === 'active_devices'
                    ? 'bg-white text-[#073DBB] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-4 h-4 text-[#087BEF]" />
                <span>Currently Active Devices ({currentlyRentedCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('rental_history')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-2 ${
                  activeTab === 'rental_history'
                    ? 'bg-white text-[#073DBB] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Rental & Return History ({customerRentals.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('sales')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-2 ${
                  activeTab === 'sales'
                    ? 'bg-white text-[#073DBB] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Purchased Assets ({purchasedDevicesCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('services')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-2 ${
                  activeTab === 'services'
                    ? 'bg-white text-[#073DBB] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-4 h-4 text-indigo-600" />
                <span>Service Requests ({customerServices.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('invoices_payments')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-2 ${
                  activeTab === 'invoices_payments'
                    ? 'bg-white text-[#073DBB] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-4 h-4 text-slate-600" />
                <span>Invoices & Payments ({customerInvoices.length})</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6">
              {/* Tab 1: Currently Active Devices */}
              {activeTab === 'active_devices' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Active Devices in Customer Possession
                      </h4>
                      <p className="text-xs text-slate-500">
                        Physical laptops and desktops currently deployed under active contracts
                      </p>
                    </div>
                  </div>

                  {activeRentalItems.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No devices currently assigned to this customer.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeRentalItems.map((item) => (
                        <div
                          key={item.asset.id}
                          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-[#087BEF] shadow-xs transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">
                                  {item.asset.brand} {item.asset.model}
                                </span>
                                <span className="text-[10px] bg-blue-50 text-[#073DBB] px-2 py-0.5 rounded font-mono font-bold">
                                  {item.asset.assetId}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                S/N: {item.asset.serialNumber} · {item.asset.category}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#087BEF]">
                              Contract {item.rentalId}
                            </span>
                          </div>

                          {/* Technical specs pill list */}
                          <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700">
                            <div>
                              <strong className="text-slate-900">Specs:</strong> {item.asset.processor} · {item.asset.ram} · {item.asset.storage}
                            </div>
                            <div>
                              <strong className="text-slate-900">Graphics & OS:</strong> {item.asset.graphics} · {item.asset.os}
                            </div>
                            <div>
                              <strong className="text-slate-900">Screen:</strong> {item.asset.screenSize}
                            </div>
                          </div>

                          {/* Rental commercial terms */}
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                            <div>
                              <div className="text-slate-500 text-[11px]">Lease Period</div>
                              <div className="font-semibold text-slate-800">
                                {item.startDate} → <span className="text-[#073DBB]">{item.expectedReturnDate}</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500 text-[11px]">Monthly Rate</div>
                              <div className="font-bold text-slate-900 tabular-nums">
                                {formatCurrency(item.rate)}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500 text-[11px]">Deposit Held</div>
                              <div className="font-bold text-cyan-700 tabular-nums">
                                {formatCurrency(item.securityDeposit)}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                              onClick={() => navigateToAssetDetail(item.asset.assetId)}
                              className="px-3 py-1.5 text-xs text-slate-700 hover:text-[#073DBB] bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                            >
                              Asset Lifecycle
                            </button>
                            <button
                              onClick={() => setCurrentView('rentals')}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#073DBB] hover:bg-[#052d8a] rounded-lg transition-colors"
                            >
                              Return / Extend
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Rental & Return History */}
              {activeTab === 'rental_history' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">
                    Chronological Rental Agreements & Historical Returns
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Agreement ID</th>
                          <th className="py-2.5 px-3">Start Date</th>
                          <th className="py-2.5 px-3">Expected Due Date</th>
                          <th className="py-2.5 px-3">Devices</th>
                          <th className="py-2.5 px-3">Rate/Period</th>
                          <th className="py-2.5 px-3">Deposit</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customerRentals.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-3 font-mono font-bold text-[#073DBB]">
                              {r.rentalId}
                            </td>
                            <td className="py-3 px-3 text-slate-700">{r.startDate}</td>
                            <td className="py-3 px-3 text-slate-700 font-medium">
                              {r.expectedReturnDate}
                            </td>
                            <td className="py-3 px-3">
                              <div className="space-y-1">
                                {r.items.map((i) => (
                                  <div key={i.assetId} className="flex items-center gap-1.5 text-slate-800">
                                    <span className="font-mono text-[11px] text-slate-500 font-semibold">
                                      {i.assetId}
                                    </span>
                                    <span>{i.brand} {i.model}</span>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded ${
                                        i.status === 'Active'
                                          ? 'bg-blue-50 text-[#073DBB]'
                                          : 'bg-emerald-50 text-emerald-700'
                                      }`}
                                    >
                                      {i.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-900 tabular-nums">
                              {formatCurrency(r.ratePerPeriod)}/{r.rentalFrequency}
                            </td>
                            <td className="py-3 px-3 font-semibold text-cyan-800 tabular-nums">
                              {formatCurrency(r.securityDeposit)}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  r.status === 'Active'
                                    ? 'bg-blue-50 text-[#073DBB]'
                                    : r.status === 'Overdue'
                                    ? 'bg-red-50 text-red-700 font-bold'
                                    : r.status === 'Partially Returned'
                                    ? 'bg-amber-50 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => setCurrentView('rentals')}
                                className="text-[#087BEF] font-semibold hover:underline"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Returns Log Sub-section */}
                  {customerReturns.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <h5 className="text-xs font-bold text-slate-800 mb-2">
                        Return & Inspection Records
                      </h5>
                      <div className="space-y-2">
                        {customerReturns.map((ret) => (
                          <div
                            key={ret.id}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">
                                Return #{ret.returnId} · Returned on {ret.actualReturnDate}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Assets: {ret.returnedAssetIds.join(', ')} · Condition: {ret.returnedCondition} · {ret.remarks}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                                {ret.inspectionStatus}
                              </span>
                              {ret.refundAmount > 0 && (
                                <div className="text-[11px] font-bold text-emerald-600 mt-1">
                                  Refunded: {formatCurrency(ret.refundAmount)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Sales History */}
              {activeTab === 'sales' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">Purchased Hardware Assets</h4>
                  {customerSales.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No outright hardware sales recorded for this customer yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerSales.map((sale) => (
                        <div
                          key={sale.id}
                          className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 font-mono text-sm">
                                {sale.saleId}
                              </span>
                              <span className="text-slate-500">· Date: {sale.saleDate}</span>
                            </div>
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                              {sale.paymentStatus}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-lg">
                            {sale.items.map((it) => (
                              <div key={it.assetId} className="flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-semibold text-slate-900">
                                    {it.brand} {it.model}
                                  </span>
                                  <span className="text-slate-500 font-mono text-[11px]">
                                    {' '}· ({it.assetId} / S/N: {it.serialNumber})
                                  </span>
                                </div>
                                <span className="font-bold text-slate-900 tabular-nums">
                                  {formatCurrency(it.sellingPrice)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between text-xs pt-1 border-t border-slate-100 text-slate-600">
                            <div>Payment Mode: <strong className="text-slate-800">{sale.paymentMode}</strong></div>
                            <div>
                              Total Amount:{' '}
                              <strong className="text-slate-900 tabular-nums text-sm">
                                {formatCurrency(sale.totalAmount)}
                              </strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Service Requests */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">
                      Hardware Service & Repair Tickets
                    </h4>
                    <button
                      onClick={() => setCurrentView('service')}
                      className="text-xs font-semibold text-[#087BEF] hover:underline"
                    >
                      + Log New Service Ticket
                    </button>
                  </div>

                  {customerServices.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No service or repair cases registered for this customer.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerServices.map((srv) => (
                        <div
                          key={srv.id}
                          className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 font-mono">{srv.serviceId}</span>
                              <span className="text-slate-700 font-semibold">{srv.deviceDetails}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                              {srv.status}
                            </span>
                          </div>

                          <div className="text-slate-600 text-xs">
                            <strong className="text-slate-800">Problem Reported:</strong> {srv.reportedProblem}
                          </div>
                          {srv.diagnosis && (
                            <div className="text-slate-600 text-xs">
                              <strong className="text-slate-800">Diagnosis:</strong> {srv.diagnosis}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                            <div>Technician: <strong className="text-slate-800">{srv.technician}</strong></div>
                            <div>
                              Estimate: <strong className="text-slate-900 tabular-nums">{formatCurrency(srv.estimate)}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Invoices & Payments */}
              {activeTab === 'invoices_payments' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-3">
                      Customer Invoices & Billing Statements
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Invoice No</th>
                            <th className="py-2.5 px-3">Type</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Due Date</th>
                            <th className="py-2.5 px-3">Total</th>
                            <th className="py-2.5 px-3">Paid</th>
                            <th className="py-2.5 px-3">Balance Due</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {customerInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50/70">
                              <td className="py-3 px-3 font-mono font-bold text-[#073DBB]">
                                {inv.invoiceNumber}
                              </td>
                              <td className="py-3 px-3 text-slate-700 font-medium">{inv.type}</td>
                              <td className="py-3 px-3 text-slate-600">{inv.date}</td>
                              <td className="py-3 px-3 text-slate-600">{inv.dueDate}</td>
                              <td className="py-3 px-3 font-bold text-slate-900 tabular-nums">
                                {formatCurrency(inv.total)}
                              </td>
                              <td className="py-3 px-3 font-semibold text-emerald-700 tabular-nums">
                                {formatCurrency(inv.paidAmount)}
                              </td>
                              <td className="py-3 px-3 font-bold text-red-600 tabular-nums">
                                {formatCurrency(inv.balanceDue)}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    inv.paymentStatus === 'Paid'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : inv.paymentStatus === 'Overdue'
                                      ? 'bg-red-50 text-red-700'
                                      : 'bg-amber-50 text-amber-700'
                                  }`}
                                >
                                  {inv.paymentStatus}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => setCurrentView('invoices')}
                                  className="text-[#087BEF] font-semibold hover:underline"
                                >
                                  View / Print
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment Transactions Log */}
                  <div className="pt-4 border-t border-slate-200">
                    <h5 className="text-xs font-bold text-slate-800 mb-3">
                      Payment Receipts & Recorded Collections
                    </h5>

                    {customerPayments.length === 0 ? (
                      <div className="text-xs text-slate-400">No payment receipts logged yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {customerPayments.map((p) => (
                          <div
                            key={p.id}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-semibold text-slate-800">
                                Receipt #{p.paymentId} · Invoice {p.invoiceNumber}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Date: {p.date} · Mode: {p.mode} · Ref: {p.transactionReference} · {p.notes}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-emerald-700 text-sm tabular-nums">
                                {formatCurrency(p.amount)}
                              </span>
                              <div className="text-[10px] text-slate-400">{p.paymentType}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
          No customer found matching your search. Try adjusting filters.
        </div>
      )}

      {/* Customer & Contract 360° Dedicated Modal Dialog (Requirement 2: once user click view action click then modal show view details based on selected row) */}
      {isViewModalOpen && targetModalCustomer && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsViewModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-[#073DBB] to-[#087BEF] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-bold text-lg text-white">
                  {targetModalCustomer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{targetModalCustomer.name}</h3>
                    <span className="text-[11px] font-mono bg-white/20 text-cyan-200 px-2 py-0.5 rounded font-medium">
                      {targetModalCustomer.customerId}
                    </span>
                    <span className="text-[11px] bg-[#00D5E8]/30 text-white font-semibold px-2 py-0.5 rounded">
                      {targetModalCustomer.type}
                    </span>
                  </div>
                  <div className="text-xs text-blue-100 mt-0.5 flex items-center gap-2">
                    {targetModalCustomer.companyName && <span>{targetModalCustomer.companyName} ·</span>}
                    <span>{targetModalCustomer.mobile}</span>
                    <span>· {targetModalCustomer.city}</span>
                    {targetModalCustomer.gstNumber && <span>· GSTIN: {targetModalCustomer.gstNumber}</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Address & Quick Info Banner */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                <div>
                  <strong className="text-slate-800">Billing & Delivery:</strong>{' '}
                  {targetModalCustomer.billingAddress}, {targetModalCustomer.city} - {targetModalCustomer.pinCode}
                </div>
                {targetModalCustomer.notes && (
                  <div className="text-slate-500 italic max-w-sm truncate">
                    <strong className="text-slate-700 not-italic">Notes:</strong> {targetModalCustomer.notes}
                  </div>
                )}
              </div>

              {/* 360-Degree Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-center">
                  <div className="text-[10px] font-semibold text-[#073DBB] uppercase">Active Rented</div>
                  <div className="text-lg font-extrabold text-[#087BEF] mt-0.5 tabular-nums">
                    {currentlyRentedCount}
                  </div>
                  <div className="text-[10px] text-slate-400">Current fleet</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] font-semibold text-slate-600 uppercase">Ever Rented</div>
                  <div className="text-lg font-extrabold text-slate-800 mt-0.5 tabular-nums">
                    {totalDevicesEverRented}
                  </div>
                  <div className="text-[10px] text-slate-400">Total contracts</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] font-semibold text-slate-600 uppercase">Purchased</div>
                  <div className="text-lg font-extrabold text-slate-800 mt-0.5 tabular-nums">
                    {purchasedDevicesCount}
                  </div>
                  <div className="text-[10px] text-slate-400">Outright units</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] font-semibold text-slate-600 uppercase">Total Invoiced</div>
                  <div className="text-lg font-extrabold text-slate-800 mt-0.5 tabular-nums">
                    {formatCurrency(totalInvoiced)}
                  </div>
                  <div className="text-[10px] text-slate-400">{customerInvoices.length} invoices</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] font-semibold text-slate-600 uppercase">Deposits Held</div>
                  <div className="text-lg font-extrabold text-cyan-700 mt-0.5 tabular-nums">
                    {formatCurrency(totalDepositsHeld)}
                  </div>
                  <div className="text-[10px] text-cyan-600">Refundable</div>
                </div>

                <div className={`p-3 rounded-xl border text-center ${
                  totalOutstandingBalance > 0
                    ? 'bg-red-50/60 border-red-200'
                    : 'bg-emerald-50/60 border-emerald-200'
                }`}>
                  <div className="text-[10px] font-semibold uppercase text-slate-600">Balance Due</div>
                  <div className={`text-lg font-extrabold mt-0.5 tabular-nums ${
                    totalOutstandingBalance > 0 ? 'text-red-600' : 'text-emerald-700'
                  }`}>
                    {totalOutstandingBalance > 0 ? formatCurrency(totalOutstandingBalance) : 'Settled'}
                  </div>
                  <div className="text-[10px] text-slate-400">Receivable</div>
                </div>
              </div>

              {/* Modal Navigation Tabs */}
              <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-semibold">
                {[
                  { id: 'active_devices', label: `Active Devices (${activeRentalItems.length})`, icon: Laptop },
                  { id: 'rental_history', label: `Rental History (${customerRentals.length})`, icon: Clock },
                  { id: 'sales', label: `Sales (${customerSales.length})`, icon: ShoppingBag },
                  { id: 'services', label: `Services (${customerServices.length})`, icon: Wrench },
                  { id: 'invoices_payments', label: `Invoices & Payments (${customerInvoices.length})`, icon: Receipt },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = modalTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setModalTab(tab.id as any)}
                      className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'border-[#073DBB] text-[#073DBB] bg-blue-50/50'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Active Devices */}
              {modalTab === 'active_devices' && (
                <div className="space-y-3">
                  {activeRentalItems.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                      No active rented devices for this customer.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Asset ID / Serial</th>
                            <th className="py-2.5 px-3">Device & Specs</th>
                            <th className="py-2.5 px-3">Lease Start</th>
                            <th className="py-2.5 px-3">Return Due</th>
                            <th className="py-2.5 px-3">Rate</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeRentalItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3">
                                <span className="font-mono font-bold text-[#073DBB]">{item.asset.assetId}</span>
                                <div className="text-[10px] text-slate-400 font-mono">S/N: {item.asset.serialNumber}</div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900">{item.asset.brand} {item.asset.model}</div>
                                <div className="text-[10px] text-slate-500">{item.asset.processor} · {item.asset.ram} · {item.asset.storage}</div>
                              </td>
                              <td className="py-2.5 px-3 font-mono">{item.startDate}</td>
                              <td className="py-2.5 px-3 font-mono font-semibold text-amber-700">{item.expectedReturnDate}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900 tabular-nums">{formatCurrency(item.rate)}/mo</td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => {
                                    setIsViewModalOpen(false);
                                    setCurrentView('rentals');
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-[#073DBB] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  Manage Return
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Rental History */}
              {modalTab === 'rental_history' && (
                <div className="space-y-3">
                  {customerRentals.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                      No rental history recorded for this customer.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Rental ID</th>
                            <th className="py-2.5 px-3">Period</th>
                            <th className="py-2.5 px-3">Items Count</th>
                            <th className="py-2.5 px-3">Period Rate</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {customerRentals.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-[#073DBB]">{r.rentalId}</td>
                              <td className="py-2.5 px-3 font-mono text-[11px]">{r.startDate} to {r.expectedReturnDate}</td>
                              <td className="py-2.5 px-3 font-semibold">{r.items.length} unit(s)</td>
                              <td className="py-2.5 px-3 font-bold tabular-nums">
                                {formatCurrency(r.ratePerPeriod)}/{r.rentalFrequency}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  r.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                                  r.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                                  r.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Sales */}
              {modalTab === 'sales' && (
                <div className="space-y-3">
                  {customerSales.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                      No outright hardware purchases recorded for this customer.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Sale ID</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Units Sold</th>
                            <th className="py-2.5 px-3">Sale Value</th>
                            <th className="py-2.5 px-3">Payment Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {customerSales.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-[#073DBB]">{s.saleId}</td>
                              <td className="py-2.5 px-3 font-mono">{s.saleDate}</td>
                              <td className="py-2.5 px-3 font-semibold">{s.items.length} unit(s)</td>
                              <td className="py-2.5 px-3 font-bold tabular-nums text-emerald-700">{formatCurrency(s.totalAmount)}</td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {s.paymentStatus} ({s.paymentMode})
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Services */}
              {modalTab === 'services' && (
                <div className="space-y-3">
                  {customerServices.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                      No service or repair tickets logged for this customer.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Ticket ID</th>
                            <th className="py-2.5 px-3">Asset / Device</th>
                            <th className="py-2.5 px-3">Issue Reported</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Repair Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {customerServices.map((srv) => (
                            <tr key={srv.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-[#073DBB]">{srv.serviceId}</td>
                              <td className="py-2.5 px-3 font-mono">{srv.assetId || srv.deviceDetails}</td>
                              <td className="py-2.5 px-3 font-medium text-slate-800">{srv.reportedProblem}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  srv.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                  srv.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {srv.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-bold tabular-nums">{formatCurrency(srv.actualCost || srv.estimate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Invoices & Payments */}
              {modalTab === 'invoices_payments' && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-2">Issued Invoices</h5>
                    {customerInvoices.length === 0 ? (
                      <div className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl">No invoices generated yet.</div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">Invoice #</th>
                              <th className="py-2 px-3">Date</th>
                              <th className="py-2 px-3">Total Amount</th>
                              <th className="py-2 px-3">Paid Amount</th>
                              <th className="py-2 px-3">Balance Due</th>
                              <th className="py-2 px-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {customerInvoices.map((inv) => (
                              <tr key={inv.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-mono font-bold text-[#073DBB]">{inv.invoiceNumber}</td>
                                <td className="py-2 px-3 font-mono">{inv.date}</td>
                                <td className="py-2 px-3 font-bold tabular-nums">{formatCurrency(inv.total)}</td>
                                <td className="py-2 px-3 text-emerald-700 font-semibold tabular-nums">{formatCurrency(inv.paidAmount)}</td>
                                <td className="py-2 px-3 font-bold text-red-600 tabular-nums">{formatCurrency(inv.balanceDue)}</td>
                                <td className="py-2 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                                    inv.paymentStatus === 'Partially Paid' ? 'bg-blue-100 text-blue-800' :
                                    inv.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {inv.paymentStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-2">Payment Receipts & Collections</h5>
                    {customerPayments.length === 0 ? (
                      <div className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl">No payments logged yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {customerPayments.map((p) => (
                          <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-semibold text-slate-800">Receipt #{p.paymentId} · Invoice {p.invoiceNumber}</div>
                              <div className="text-[11px] text-slate-500">Date: {p.date} · Mode: {p.mode} · Ref: {p.transactionReference}</div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-emerald-700 text-sm tabular-nums">{formatCurrency(p.amount)}</span>
                              <div className="text-[10px] text-slate-400">{p.paymentType}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Customer 360° Profile · <strong className="text-slate-800">{targetModalCustomer.name}</strong> ({targetModalCustomer.customerId})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setCurrentView('rentals');
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#073DBB] to-[#087BEF] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  + Issue Rental
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
