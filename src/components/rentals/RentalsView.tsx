import React, { useState } from 'react';
import {
  CalendarRange,
  Plus,
  Search,
  Clock,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Layers,
  X,
  CreditCard,
  FileText,
  User,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Rental, RentalItem, AssetCondition } from '../../types';
import { Pagination } from '../common/Pagination';

export const RentalsView: React.FC = () => {
  const {
    rentals,
    assets,
    customers,
    createRental,
    extendRental,
    returnRentalAssets,
    inspectAsset,
    navigateToCustomer360,
    settings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'active' | 'overdue' | 'inspection_desk' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state (Requirement 3: rows 10, 20, 50)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);

  // Selected rental for action
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [selectedAssetForInspection, setSelectedAssetForInspection] = useState<(typeof assets)[0] | null>(null);

  // Create Rental Form State
  const [newRentalForm, setNewRentalForm] = useState({
    customerId: '',
    selectedAssetIds: [] as string[],
    startDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rentalFrequency: 'Monthly' as 'Daily' | 'Weekly' | 'Monthly',
    duration: 1,
    durationUnit: 'Months' as 'Days' | 'Weeks' | 'Months',
    ratePerPeriod: 5000,
    securityDeposit: 15000,
    advancePaid: 15000,
    discount: 0,
    taxRate: settings.defaultTaxRate,
    terms: settings.defaultRentalTerms,
    remarks: '',
  });

  // Rental Extension Form State
  const [extensionForm, setExtensionForm] = useState({
    revisedDueDate: '',
    additionalDays: 30,
    additionalCharges: 5000,
    notes: 'Client requested monthly contract renewal.',
  });

  // Rental Return Form State (supports Partial Returns!)
  const [returnForm, setReturnForm] = useState({
    actualReturnDate: new Date().toISOString().split('T')[0],
    selectedAssetIdsToReturn: [] as string[],
    returnedCondition: 'Good' as AssetCondition,
    accessoriesReturned: ['65W AC Adapter', 'Sleeve'],
    missingAccessoriesText: '',
    damageNotes: '',
    lateFees: 0,
    repairCharges: 0,
    depositAdjustment: 0,
    refundAmount: 0,
    remarks: 'Devices checked in at front desk; dispatched to technical inspection bay.',
  });

  // Inspection Form State
  const [inspectionState, setInspectionState] = useState<{
    nextStatus: 'Available' | 'Under Service' | 'Damaged';
    notes: string;
  }>({
    nextStatus: 'Available',
    notes: 'Diagnostic pass. Battery test and display integrity approved.',
  });

  const formatCurrency = (val: number) => `${settings.currencySymbol}${val.toLocaleString('en-IN')}`;

  // Only eligible Available assets can be rented (BRD Section 11: Rule 11)
  const availableEligibleAssets = assets.filter((a) => a.status === 'Available');

  // Inspection Pending assets
  const inspectionPendingAssets = assets.filter((a) => a.status === 'Returned - Inspection Pending');

  // Handlers
  const handleOpenCreate = () => {
    setNewRentalForm({
      customerId: customers[0]?.customerId || '',
      selectedAssetIds: [],
      startDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rentalFrequency: 'Monthly',
      duration: 1,
      durationUnit: 'Months',
      ratePerPeriod: 5000,
      securityDeposit: 15000,
      advancePaid: 15000,
      discount: 0,
      taxRate: settings.defaultTaxRate,
      terms: settings.defaultRentalTerms,
      remarks: '',
    });
    setShowCreateModal(true);
  };

  const handleToggleAssetSelect = (assetId: string) => {
    setNewRentalForm((prev) => {
      const exists = prev.selectedAssetIds.includes(assetId);
      const updated = exists
        ? prev.selectedAssetIds.filter((id) => id !== assetId)
        : [...prev.selectedAssetIds, assetId];

      return {
        ...prev,
        selectedAssetIds: updated,
        securityDeposit: updated.length * 15000,
        advancePaid: updated.length * 15000,
      };
    });
  };

  const handleConfirmCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRentalForm.customerId || newRentalForm.selectedAssetIds.length === 0) {
      return;
    }

    createRental({
      customerId: newRentalForm.customerId,
      assetIds: newRentalForm.selectedAssetIds,
      startDate: newRentalForm.startDate,
      expectedReturnDate: newRentalForm.expectedReturnDate,
      rentalFrequency: newRentalForm.rentalFrequency,
      duration: Number(newRentalForm.duration),
      durationUnit: newRentalForm.durationUnit,
      ratePerPeriod: Number(newRentalForm.ratePerPeriod),
      securityDeposit: Number(newRentalForm.securityDeposit),
      advancePaid: Number(newRentalForm.advancePaid),
      discount: Number(newRentalForm.discount),
      taxRate: Number(newRentalForm.taxRate),
      terms: newRentalForm.terms,
      remarks: newRentalForm.remarks,
    });

    setShowCreateModal(false);
  };

  const handleOpenExtend = (rental: Rental) => {
    setSelectedRental(rental);
    const currDue = new Date(rental.expectedReturnDate);
    const newDue = new Date(currDue.setDate(currDue.getDate() + 30)).toISOString().split('T')[0];

    setExtensionForm({
      revisedDueDate: newDue,
      additionalDays: 30,
      additionalCharges: rental.ratePerPeriod,
      notes: 'Customer approved rental contract renewal.',
    });
    setShowExtendModal(true);
  };

  const handleConfirmExtend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRental) return;

    extendRental(
      selectedRental.rentalId,
      extensionForm.revisedDueDate,
      Number(extensionForm.additionalDays),
      Number(extensionForm.additionalCharges),
      extensionForm.notes
    );

    setShowExtendModal(false);
  };

  const handleOpenReturn = (rental: Rental) => {
    setSelectedRental(rental);
    // Active assets in this rental
    const activeAssets = rental.items.filter((i) => i.status === 'Active').map((i) => i.assetId);

    setReturnForm({
      actualReturnDate: new Date().toISOString().split('T')[0],
      selectedAssetIdsToReturn: activeAssets, // default to all active items
      returnedCondition: 'Good',
      accessoriesReturned: ['65W AC Adapter', 'Sleeve'],
      missingAccessoriesText: '',
      damageNotes: '',
      lateFees: 0,
      repairCharges: 0,
      depositAdjustment: 0,
      refundAmount: rental.securityDeposit,
      remarks: 'Returned in good operational condition.',
    });
    setShowReturnModal(true);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRental || returnForm.selectedAssetIdsToReturn.length === 0) return;

    returnRentalAssets(selectedRental.rentalId, returnForm.selectedAssetIdsToReturn, {
      actualReturnDate: returnForm.actualReturnDate,
      returnedCondition: returnForm.returnedCondition,
      accessoriesReturned: returnForm.accessoriesReturned,
      missingAccessories: returnForm.missingAccessoriesText
        ? returnForm.missingAccessoriesText.split(',').map((s) => s.trim())
        : [],
      damageNotes: returnForm.damageNotes,
      lateFees: Number(returnForm.lateFees),
      repairCharges: Number(returnForm.repairCharges),
      depositAdjustment: Number(returnForm.depositAdjustment),
      refundAmount: Number(returnForm.refundAmount),
      remarks: returnForm.remarks,
    });

    setShowReturnModal(false);
  };

  const handleOpenInspection = (asset: (typeof assets)[0]) => {
    setSelectedAssetForInspection(asset);
    setInspectionState({
      nextStatus: 'Available',
      notes: 'Hardware diagnostic passed. Re-imaged and moved to active stock.',
    });
    setShowInspectionModal(true);
  };

  const handleConfirmInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForInspection) return;
    inspectAsset(
      selectedAssetForInspection.assetId,
      inspectionState.nextStatus,
      inspectionState.notes
    );
    setShowInspectionModal(false);
  };

  const filteredRentals = rentals.filter((r) => {
    const matchesSearch =
      r.rentalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.items.some((i) => i.assetId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === 'overdue') return matchesSearch && r.status === 'Overdue';
    if (activeTab === 'active')
      return matchesSearch && (r.status === 'Active' || r.status === 'Partially Returned');
    return matchesSearch;
  });

  // Paginated rentals for table view (Requirement 3: rows 10, 20, 50)
  const paginatedRentals = filteredRentals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Rental Contracts & Asset Returns
          </h2>
          <p className="text-xs text-slate-500">
            End-to-end customer leases, extension history, partial returns, and inspection desk
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Rental Agreement</span>
        </button>
      </div>

      {/* Tabs and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Rental ID, customer name, or Asset ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#087BEF] outline-none"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('active');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'active'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Leases (
              {rentals.filter((r) => r.status === 'Active' || r.status === 'Partially Returned').length}
              )
            </button>

            <button
              onClick={() => {
                setActiveTab('overdue');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'overdue'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-red-700 hover:bg-red-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Overdue ({rentals.filter((r) => r.status === 'Overdue').length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('inspection_desk');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'inspection_desk'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Inspection Desk ({inspectionPendingAssets.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({rentals.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab View Area */}
      {activeTab === 'inspection_desk' ? (
        /* Inspection Desk Tab (BRD 6.7: Devices returned from rental waiting inspection before being available) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Returned Assets - Pending Technical Inspection
              </h3>
              <p className="text-xs text-slate-500">
                Returned devices must be verified by Admin and reassigned as Available, Under Service, or Damaged.
              </p>
            </div>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">
              {inspectionPendingAssets.length} awaiting inspection
            </span>
          </div>

          {inspectionPendingAssets.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>All returned devices have been inspected and restocked!</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inspectionPendingAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 bg-amber-50/40 border border-amber-200 rounded-xl space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {asset.brand} {asset.model}
                        </span>
                        <span className="text-[10px] bg-white border border-amber-200 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                          {asset.assetId}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        S/N: {asset.serialNumber} · {asset.category}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Pending Inspection
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-amber-100 space-y-1">
                    <div>
                      <strong>Returned Condition:</strong> {asset.condition}
                    </div>
                    {asset.notes && (
                      <div>
                        <strong>Return Notes:</strong> {asset.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleOpenInspection(asset)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-[#073DBB] text-white font-bold text-xs rounded-lg shadow-2xs hover:opacity-95 transition-all"
                    >
                      Perform Inspection
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Rental Contracts Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Rental ID</th>
                  <th className="py-3 px-4">Customer Entity</th>
                  <th className="py-3 px-4">Period & Due Date</th>
                  <th className="py-3 px-4">Assets Rented</th>
                  <th className="py-3 px-4">Rate & Deposit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRentals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                      No rental contracts match current tab and search query.
                    </td>
                  </tr>
                ) : (
                  paginatedRentals.map((r) => {
                    const activeAssetsCount = r.items.filter((i) => i.status === 'Active').length;

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#073DBB]">
                          {r.rentalId}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{r.customerName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {r.customerId} · 📞 {r.customerMobile}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <div>
                            {r.startDate} →{' '}
                            <strong
                              className={r.status === 'Overdue' ? 'text-red-600 font-bold' : 'text-slate-900'}
                            >
                              {r.expectedReturnDate}
                            </strong>
                          </div>
                          {r.extensions.length > 0 && (
                            <div className="text-[10px] text-blue-700 font-medium">
                              Extended ({r.extensions.length}x)
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {r.items.map((i) => (
                              <div key={i.assetId} className="flex items-center gap-1.5 text-slate-800">
                                <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.2 rounded font-semibold text-slate-600">
                                  {i.assetId}
                                </span>
                                <span className="truncate max-w-[150px]">{i.brand} {i.model}</span>
                                <span
                                  className={`text-[9px] px-1 py-0.2 rounded ${
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
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 tabular-nums">
                            {formatCurrency(r.ratePerPeriod)}/{r.rentalFrequency}
                          </div>
                          <div className="text-[11px] text-cyan-800">
                            Deposit: {formatCurrency(r.securityDeposit)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
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
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.status !== 'Completed' && (
                              <>
                                <button
                                  onClick={() => handleOpenExtend(r)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                  Extend
                                </button>
                                <button
                                  onClick={() => handleOpenReturn(r)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] rounded-lg transition-all"
                                >
                                  Return ({activeAssetsCount})
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => navigateToCustomer360(r.customerId)}
                              className="px-2 py-1 text-[11px] font-semibold text-[#073DBB] hover:underline"
                            >
                              360°
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredRentals.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Modal 1: Create Rental Agreement Wizard */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Generate Rental Contract</h3>
                <p className="text-xs text-blue-100">
                  Select customer, pick eligible available assets, and set billing terms
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Customer Account *
                  </label>
                  <select
                    required
                    value={newRentalForm.customerId}
                    onChange={(e) =>
                      setNewRentalForm({ ...newRentalForm, customerId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none text-xs font-semibold"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.customerId}>
                        {c.name} {c.companyName ? `· ${c.companyName}` : ''} ({c.customerId}) - 📞 {c.mobile}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Available Assets Picker (Supports Multi-Select as per BRD 6.6) */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      Select Available Laptops & Desktops * ({newRentalForm.selectedAssetIds.length} selected)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {availableEligibleAssets.length} currently eligible in stock
                    </span>
                  </div>

                  {availableEligibleAssets.length === 0 ? (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">
                      No assets are currently in Available status. Complete inspection or register new stock first.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {availableEligibleAssets.map((asset) => {
                        const isSelected = newRentalForm.selectedAssetIds.includes(asset.assetId);
                        return (
                          <div
                            key={asset.id}
                            onClick={() => handleToggleAssetSelect(asset.assetId)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-blue-50 border-[#087BEF] ring-1 ring-[#087BEF]'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-slate-900">
                                {asset.brand} {asset.model}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {asset.assetId} · {asset.processor.split('(')[0]} · {asset.ram}
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              readOnly
                              checked={isSelected}
                              className="rounded text-[#073DBB] pointer-events-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newRentalForm.startDate}
                    onChange={(e) =>
                      setNewRentalForm({ ...newRentalForm, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Expected Return Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newRentalForm.expectedReturnDate}
                    onChange={(e) =>
                      setNewRentalForm({ ...newRentalForm, expectedReturnDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Frequency</label>
                  <select
                    value={newRentalForm.rentalFrequency}
                    onChange={(e) =>
                      setNewRentalForm({
                        ...newRentalForm,
                        rentalFrequency: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rate Per Asset / Period (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newRentalForm.ratePerPeriod}
                    onChange={(e) =>
                      setNewRentalForm({
                        ...newRentalForm,
                        ratePerPeriod: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Security Deposit (Refundable) (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newRentalForm.securityDeposit}
                    onChange={(e) =>
                      setNewRentalForm({
                        ...newRentalForm,
                        securityDeposit: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Advance Payment Collected (₹)
                  </label>
                  <input
                    type="number"
                    value={newRentalForm.advancePaid}
                    onChange={(e) =>
                      setNewRentalForm({
                        ...newRentalForm,
                        advancePaid: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contract Terms & Conditions
                  </label>
                  <textarea
                    rows={2}
                    value={newRentalForm.terms}
                    onChange={(e) =>
                      setNewRentalForm({ ...newRentalForm, terms: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newRentalForm.selectedAssetIds.length === 0}
                  className="px-5 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  Confirm Rental & Issue Assets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Rental Extension Modal (BRD 6.6) */}
      {showExtendModal && selectedRental && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Extend Rental Agreement</h3>
                <p className="text-xs text-blue-100">
                  {selectedRental.rentalId} · {selectedRental.customerName}
                </p>
              </div>
              <button
                onClick={() => setShowExtendModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmExtend} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div>
                  Current Due Date: <strong className="text-slate-800">{selectedRental.expectedReturnDate}</strong>
                </div>
                <div>
                  Active Devices: <strong className="text-slate-800">{selectedRental.items.length} units</strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Revised Expected Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={extensionForm.revisedDueDate}
                  onChange={(e) =>
                    setExtensionForm({ ...extensionForm, revisedDueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Additional Charges for Extended Period (₹)
                </label>
                <input
                  type="number"
                  value={extensionForm.additionalCharges}
                  onChange={(e) =>
                    setExtensionForm({
                      ...extensionForm,
                      additionalCharges: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Extension Reason / Notes *
                </label>
                <textarea
                  rows={2}
                  required
                  value={extensionForm.notes}
                  onChange={(e) =>
                    setExtensionForm({ ...extensionForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExtendModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#073DBB] text-white font-bold rounded-xl shadow-xs hover:bg-[#052d8a]"
                >
                  Save Extension & Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Rental Return Management (Supports Partial Returns!) (BRD 6.7) */}
      {showReturnModal && selectedRental && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-[#073DBB] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Process Asset Return (Partial or Full)</h3>
                <p className="text-xs text-amber-100">
                  Rental #{selectedRental.rentalId} · Customer: {selectedRental.customerName}
                </p>
              </div>
              <button
                onClick={() => setShowReturnModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl">
                <strong>BRD Business Rule 13 & 14:</strong> Partial returns close only the selected asset lines; remaining assets stay active. Returned assets move to <em>"Returned - Inspection Pending"</em> until technician sign-off.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Devices Being Returned Today * (Uncheck any device remaining with customer)
                </label>
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {selectedRental.items
                    .filter((i) => i.status === 'Active')
                    .map((item) => {
                      const isChecked = returnForm.selectedAssetIdsToReturn.includes(item.assetId);
                      return (
                        <label
                          key={item.assetId}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...returnForm.selectedAssetIdsToReturn, item.assetId]
                                  : returnForm.selectedAssetIdsToReturn.filter((id) => id !== item.assetId);
                                setReturnForm({
                                  ...returnForm,
                                  selectedAssetIdsToReturn: updated,
                                });
                              }}
                              className="rounded text-[#073DBB]"
                            />
                            <div>
                              <span className="font-bold text-slate-800">
                                {item.brand} {item.model}
                              </span>
                              <span className="text-slate-500 font-mono text-[11px]">
                                {' '}· {item.assetId} ({item.serialNumber})
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-blue-50 text-[#073DBB] px-2 py-0.5 rounded font-semibold">
                            Active
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Actual Return Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={returnForm.actualReturnDate}
                    onChange={(e) =>
                      setReturnForm({ ...returnForm, actualReturnDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Physical Condition on Return *
                  </label>
                  <select
                    value={returnForm.returnedCondition}
                    onChange={(e) =>
                      setReturnForm({
                        ...returnForm,
                        returnedCondition: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="New">Pristine / Like New</option>
                    <option value="Good">Good (Minor wear)</option>
                    <option value="Fair">Fair (Scratch / signs of use)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Late Fees / Penalty (₹)
                  </label>
                  <input
                    type="number"
                    value={returnForm.lateFees}
                    onChange={(e) =>
                      setReturnForm({ ...returnForm, lateFees: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Security Deposit Refund Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={returnForm.refundAmount}
                    onChange={(e) =>
                      setReturnForm({ ...returnForm, refundAmount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Damage / Accessory Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Charger returned. Minor scuffs on rubber bezel."
                    value={returnForm.damageNotes}
                    onChange={(e) =>
                      setReturnForm({ ...returnForm, damageNotes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnForm.selectedAssetIdsToReturn.length === 0}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-[#073DBB] text-white font-bold rounded-xl shadow-xs hover:opacity-95 disabled:opacity-50"
                >
                  Process Return & Send to Inspection Desk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Technical Inspection Form from Inspection Desk */}
      {showInspectionModal && selectedAssetForInspection && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-[#073DBB] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Complete Inspection</h3>
                <p className="text-xs text-amber-100">
                  {selectedAssetForInspection.brand} {selectedAssetForInspection.model} ({selectedAssetForInspection.assetId})
                </p>
              </div>
              <button
                onClick={() => setShowInspectionModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmInspection} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assign Next Asset Status *
                </label>
                <select
                  value={inspectionState.nextStatus}
                  onChange={(e) =>
                    setInspectionState({
                      ...inspectionState,
                      nextStatus: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold outline-none"
                >
                  <option value="Available">Available (Ready for next client rental / sale)</option>
                  <option value="Under Service">Under Service (Send to repair bench)</option>
                  <option value="Damaged">Damaged (Liquid ingress / chassis break)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Inspection Notes & Sign-off *
                </label>
                <textarea
                  rows={3}
                  required
                  value={inspectionState.notes}
                  onChange={(e) =>
                    setInspectionState({ ...inspectionState, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-[#073DBB] text-white font-bold rounded-xl shadow-xs"
                >
                  Approve Inspection & Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
