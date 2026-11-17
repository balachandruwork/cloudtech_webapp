import React, { useState } from 'react';
import {
  Laptop,
  Search,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  RotateCcw,
  Wrench,
  AlertTriangle,
  History,
  X,
  ExternalLink,
  Tag,
  Shield,
  Layers,
  ShoppingBag,
  Download,
  User,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Asset, AssetStatus, AssetCategory, AssetCondition } from '../../types';
import { Pagination } from '../common/Pagination';

export const AssetsView: React.FC = () => {
  const {
    assets,
    lifecycleEvents,
    addAsset,
    updateAsset,
    inspectAsset,
    selectedAssetId,
    setSelectedAssetId,
    navigateToCustomer360,
    setCurrentView,
    settings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLifecycleModal, setShowLifecycleModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Pagination state (Requirement 3: rows 10, 20, 50)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected asset for detailed lifecycle viewing
  const activeAsset = assets.find((a) => a.assetId === selectedAssetId) || assets[0];

  // Unique list of assigned customer names
  const assignedCustomerOptions = Array.from(
    new Set(assets.map((a) => a.currentCustomerName).filter(Boolean))
  ) as string[];

  // Inspection form state
  const [inspectionData, setInspectionData] = useState<{
    nextStatus: 'Available' | 'Under Service' | 'Damaged';
    notes: string;
  }>({
    nextStatus: 'Available',
    notes: 'Technical inspection passed. Keyboard, screen, ports and battery verified.',
  });

  // Add Asset form state
  const [newAssetData, setNewAssetData] = useState({
    category: 'Laptop' as AssetCategory,
    brand: 'Dell',
    model: '',
    serialNumber: '',
    processor: 'Intel Core i7 13th Gen',
    generation: '13th Gen',
    ram: '16GB',
    storage: '512GB SSD',
    graphics: 'Integrated Intel Iris Xe',
    screenSize: '14.0" FHD',
    os: 'Windows 11 Pro',
    condition: 'New' as AssetCondition,
    accessories: '65W Charger, Laptop Sleeve',
    warranty: '1 Year Manufacturer',
    purchasePrice: 65000,
    supplierName: 'Metro Tech Wholesale Corp',
    notes: '',
  });

  const handleOpenAdd = () => {
    setNewAssetData({
      category: 'Laptop',
      brand: 'Dell',
      model: '',
      serialNumber: '',
      processor: 'Intel Core i7 13th Gen',
      generation: '13th Gen',
      ram: '16GB',
      storage: '512GB SSD',
      graphics: 'Integrated Intel Iris Xe',
      screenSize: '14.0" FHD',
      os: 'Windows 11 Pro',
      condition: 'New',
      accessories: '65W Charger, Laptop Sleeve',
      warranty: '1 Year Manufacturer',
      purchasePrice: 65000,
      supplierName: 'Metro Tech Wholesale Corp',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetData.model || !newAssetData.serialNumber) return;

    const nextNum = assets.length + 1001;
    const assetId = `${settings.assetPrefix}-${nextNum}`;

    addAsset({
      assetId,
      serialNumber: newAssetData.serialNumber,
      category: newAssetData.category,
      brand: newAssetData.brand,
      model: newAssetData.model,
      processor: newAssetData.processor,
      generation: newAssetData.generation,
      ram: newAssetData.ram,
      storage: newAssetData.storage,
      graphics: newAssetData.graphics,
      screenSize: newAssetData.screenSize,
      os: newAssetData.os,
      condition: newAssetData.condition,
      accessories: newAssetData.accessories.split(',').map((s) => s.trim()),
      warranty: newAssetData.warranty,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: Number(newAssetData.purchasePrice),
      supplierName: newAssetData.supplierName,
      status: 'Available',
      notes: newAssetData.notes,
    });

    setShowAddModal(false);
  };

  const handleOpenLifecycle = (assetId: string) => {
    setSelectedAssetId(assetId);
    setShowLifecycleModal(true);
  };

  const handleOpenInspect = (asset: Asset) => {
    setSelectedAssetId(asset.assetId);
    setInspectionData({
      nextStatus: 'Available',
      notes: 'Diagnostic checklist verified. Display, keyboard, battery and charger functional.',
    });
    setShowInspectModal(true);
  };

  const handleConfirmInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsset) return;
    inspectAsset(activeAsset.assetId, inspectionData.nextStatus, inspectionData.notes);
    setShowInspectModal(false);
  };

  // Filtered Assets based on search, status, category, and assigned filter
  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.processor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.currentCustomerName && a.currentCustomerName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;

    // Assigned filter logic
    let matchesAssigned = true;
    if (assignedFilter === 'all') {
      matchesAssigned = true;
    } else if (assignedFilter === 'assigned') {
      matchesAssigned = Boolean(a.currentCustomerName);
    } else if (assignedFilter === 'unassigned') {
      matchesAssigned = !a.currentCustomerName;
    } else {
      matchesAssigned = a.currentCustomerName === assignedFilter;
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesAssigned;
  });

  // Paginated Assets for table display (Requirement 3: rows 10, 20, 50)
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rented':
        return 'bg-blue-50 text-[#073DBB] border-blue-200';
      case 'Returned - Inspection Pending':
        return 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse';
      case 'Under Service':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Damaged':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Sold':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Retired':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const assetTimeline = lifecycleEvents.filter(
    (ev) => ev.assetId === activeAsset?.assetId
  );

  // CSV Export utility
  const exportAssetList = (assetList: Asset[], filename: string) => {
    const headers = [
      'Asset ID',
      'Serial Number',
      'Category',
      'Brand',
      'Model',
      'Processor',
      'RAM',
      'Storage',
      'Graphics',
      'Screen Size',
      'OS',
      'Condition',
      'Status',
      'Assigned Customer',
      'Rental/Sale Ref',
      'Purchase Date',
      'Purchase Price (INR)',
      'Supplier',
    ];

    const rows = assetList.map((a) => [
      a.assetId,
      a.serialNumber,
      a.category,
      a.brand,
      a.model,
      a.processor,
      a.ram,
      a.storage,
      a.graphics,
      a.screenSize,
      a.os,
      a.condition,
      a.status,
      a.currentCustomerName || 'Unassigned',
      a.currentRentalId || a.currentSaleId || 'None',
      a.purchaseDate,
      a.purchasePrice,
      a.supplierName || 'Vendor',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Physical Asset Register & Inventory
          </h2>
          <p className="text-xs text-slate-500">
            Lifecycle registry for {assets.length} laptops and desktops with hardware specifications
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Export Dropdown (Requirement 1: User can export both of list overall list or filtered need) */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Asset List</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-1.5 text-xs">
                  <button
                    onClick={() => exportAssetList(filteredAssets, 'CloudTech_Filtered_Assets')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 transition-colors flex items-center justify-between font-medium"
                  >
                    <span>Export Filtered List</span>
                    <span className="font-bold text-slate-400 text-[11px] tabular-nums">
                      ({filteredAssets.length})
                    </span>
                  </button>
                  <button
                    onClick={() => exportAssetList(assets, 'CloudTech_All_Fleet_Assets')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-slate-800 hover:text-[#073DBB] transition-colors flex items-center justify-between font-medium"
                  >
                    <span>Export Overall Fleet</span>
                    <span className="font-bold text-slate-400 text-[11px] tabular-nums">
                      ({assets.length})
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Device</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar with Top-Right Assigned Dropdown */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Asset ID, Serial No, Brand, Model, or Assigned..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#087BEF] outline-none transition-all"
            />
          </div>

          {/* Right Controls: Category Filter + Assigned List Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Segmented control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['all', 'Laptop', 'Desktop'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    categoryFilter === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'All Types' : `${cat}s`}
                </button>
              ))}
            </div>

            {/* Top Right Assigned List Dropdown (Requirement 1: top right end need dropdown for Assigned list show while user select filtered list show) */}
            <div className="flex items-center gap-2">
              <label htmlFor="assigned-filter-select" className="text-xs font-bold text-slate-600 whitespace-nowrap">
                Assigned:
              </label>
              <select
                id="assigned-filter-select"
                aria-label="Filter assets by assigned customer"
                value={assignedFilter}
                onChange={(e) => {
                  setAssignedFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-[#087BEF] outline-none transition-all"
              >
                <option value="all">All Assignments ({assets.length})</option>
                <option value="assigned">
                  All Assigned ({assets.filter((a) => Boolean(a.currentCustomerName)).length})
                </option>
                <option value="unassigned">
                  Unassigned / Stock ({assets.filter((a) => !a.currentCustomerName).length})
                </option>
                {assignedCustomerOptions.map((custName) => {
                  const count = assets.filter((a) => a.currentCustomerName === custName).length;
                  return (
                    <option key={custName} value={custName}>
                      {custName} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-2.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Status:
          </span>
          {[
            { id: 'all', label: 'All Fleet' },
            { id: 'Available', label: 'Available' },
            { id: 'Rented', label: 'Currently Rented' },
            { id: 'Returned - Inspection Pending', label: 'Inspection Desk' },
            { id: 'Under Service', label: 'Under Service' },
            { id: 'Damaged', label: 'Damaged' },
            { id: 'Sold', label: 'Sold Outright' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setStatusFilter(st.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                statusFilter === st.id
                  ? 'bg-[#073DBB] text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.label} (
              {st.id === 'all' ? assets.length : assets.filter((a) => a.status === st.id).length}
              )
            </button>
          ))}
        </div>
      </div>

      {/* Asset Table with Separate Status and Separate Assigned Columns (Requirement 1: Split column in the list Status Separate and Assigned Separate) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Asset ID</th>
                <th className="py-3 px-4">Device & Model</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Technical Specs</th>
                <th className="py-3 px-4">Condition</th>
                {/* Separate Status Column */}
                <th className="py-3 px-4">Status</th>
                {/* Separate Assigned Column */}
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                    No hardware assets found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#073DBB] text-xs">
                        {asset.assetId}
                      </div>
                      <div className="text-[10px] text-slate-400">{asset.category}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {asset.brand} {asset.model}
                      </div>
                      <div className="text-[11px] text-slate-500">{asset.screenSize}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 text-[11px]">
                      {asset.serialNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      <div>
                        <strong className="text-slate-800">{asset.processor}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {asset.ram} RAM · {asset.storage} · {asset.os}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] text-slate-700 font-medium">
                        {asset.condition}
                      </span>
                    </td>

                    {/* Column 6: Status Separate */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md border ${getStatusBadge(
                          asset.status
                        )}`}
                      >
                        {asset.status}
                      </span>
                    </td>

                    {/* Column 7: Assigned Separate */}
                    <td className="py-3.5 px-4">
                      {asset.currentCustomerName ? (
                        <div className="space-y-0.5">
                          <button
                            onClick={() => asset.currentCustomerId && navigateToCustomer360(asset.currentCustomerId)}
                            className="text-left font-semibold text-[#073DBB] hover:text-[#052d8a] hover:underline flex items-center gap-1 group"
                            title="Click to view Customer 360 profile"
                          >
                            <User className="w-3 h-3 text-[#087BEF] shrink-0" />
                            <span className="truncate max-w-[150px]">{asset.currentCustomerName}</span>
                          </button>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {asset.currentRentalId || asset.currentSaleId || asset.currentCustomerId}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">
                          Unassigned (In Stock)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {asset.status === 'Returned - Inspection Pending' && (
                          <button
                            onClick={() => handleOpenInspect(asset)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition-colors"
                          >
                            Inspect
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenLifecycle(asset.assetId)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-[#073DBB] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <History className="w-3 h-3 text-slate-500" />
                          <span>Lifecycle</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination for Assets (Requirement 3: rows 10, 20, 50) */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredAssets.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Asset Lifecycle Chronological Drawer / Modal (BRD Section 8) */}
      {showLifecycleModal && activeAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-[#073DBB] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base">
                    Asset Lifecycle Timeline: {activeAsset.assetId}
                  </h3>
                  <span className="text-xs bg-white/20 text-cyan-200 px-2 py-0.5 rounded font-mono font-medium">
                    S/N: {activeAsset.serialNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {activeAsset.brand} {activeAsset.model} · {activeAsset.category}
                </p>
              </div>
              <button
                onClick={() => setShowLifecycleModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Asset Technical Specifications Summary Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Processor</span>
                  <span className="font-semibold text-slate-800">{activeAsset.processor}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Memory & Storage</span>
                  <span className="font-semibold text-slate-800">{activeAsset.ram} · {activeAsset.storage}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Graphics & OS</span>
                  <span className="font-semibold text-slate-800">{activeAsset.graphics} · {activeAsset.os}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Status</span>
                  <span className="font-bold text-[#073DBB]">{activeAsset.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Assignment</span>
                  <span className="font-semibold text-slate-800">
                    {activeAsset.currentCustomerName || 'Unassigned (In Stock)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Accessories Included</span>
                  <span className="text-slate-800">{activeAsset.accessories.join(', ') || 'Standard'}</span>
                </div>
              </div>

              {/* Append-Only Lifecycle Events Log (BRD Section 8) */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#087BEF]" />
                  <span>Chronological Lifecycle History (Append-Only)</span>
                </h4>

                {assetTimeline.length === 0 ? (
                  <div className="text-xs text-slate-400 p-4 bg-slate-50 rounded-lg text-center">
                    No historical events logged yet for this device.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {assetTimeline.map((ev) => (
                      <div key={ev.id} className="relative text-xs">
                        {/* Bullet */}
                        <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#087BEF] border-2 border-white ring-2 ring-blue-100" />
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 bg-blue-50 text-[#073DBB] px-2 py-0.5 rounded text-[11px]">
                            {ev.eventType}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(ev.timestamp).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                          <span className="text-slate-500 text-[10px]">by {ev.performedBy}</span>
                        </div>
                        <p className="text-slate-700 mt-1.5 leading-relaxed">{ev.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Current State: <strong className="text-slate-800">{activeAsset.status}</strong>
              </span>
              <button
                onClick={() => setShowLifecycleModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-semibold text-slate-800 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Technical Inspection Modal */}
      {showInspectModal && activeAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-[#087BEF] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Perform Technical Inspection</h3>
                <p className="text-xs text-amber-100">
                  {activeAsset.brand} {activeAsset.model} ({activeAsset.assetId})
                </p>
              </div>
              <button
                onClick={() => setShowInspectModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmInspection} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Technical Checklist Verified:
                </label>
                <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Display panel free of dead pixels and liquid bleed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Keyboard keys, trackpad, and USB/HDMI ports functional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Original AC power adapter and accessories returned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>SSD wiped / CloudTech corporate baseline image installed</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assign Next Asset Status *
                </label>
                <select
                  value={inspectionData.nextStatus}
                  onChange={(e) =>
                    setInspectionData({
                      ...inspectionData,
                      nextStatus: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none font-semibold text-slate-800"
                >
                  <option value="Available">Available (Ready for immediate rental / sale)</option>
                  <option value="Under Service">Under Service (Requires technician maintenance)</option>
                  <option value="Damaged">Damaged (Liquid ingress / broken shell)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Inspection Notes & Findings *
                </label>
                <textarea
                  rows={3}
                  value={inspectionData.notes}
                  onChange={(e) =>
                    setInspectionData({ ...inspectionData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInspectModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-[#073DBB] text-white font-bold rounded-xl shadow-xs hover:opacity-95"
                >
                  Confirm Inspection & Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register New Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Register New Laptop / Desktop</h3>
                <p className="text-xs text-blue-100">
                  Assign serial number and hardware specifications to fleet inventory
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Device Category *
                  </label>
                  <select
                    value={newAssetData.category}
                    onChange={(e) =>
                      setNewAssetData({
                        ...newAssetData,
                        category: e.target.value as AssetCategory,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                  >
                    <option value="Laptop">Laptop / Notebook</option>
                    <option value="Desktop">Desktop / Workstation Tower</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand *</label>
                  <select
                    value={newAssetData.brand}
                    onChange={(e) =>
                      setNewAssetData({ ...newAssetData, brand: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                  >
                    <option value="Dell">Dell</option>
                    <option value="Lenovo">Lenovo</option>
                    <option value="HP">HP</option>
                    <option value="Apple">Apple</option>
                    <option value="Asus">Asus</option>
                    <option value="Acer">Acer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Latitude 5440 or ThinkPad X1"
                    value={newAssetData.model}
                    onChange={(e) =>
                      setNewAssetData({ ...newAssetData, model: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Serial Number (Unique) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DELL-LAT-5440-991"
                    value={newAssetData.serialNumber}
                    onChange={(e) =>
                      setNewAssetData({ ...newAssetData, serialNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Processor & Generation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Intel Core i7-1365U 13th Gen"
                    value={newAssetData.processor}
                    onChange={(e) =>
                      setNewAssetData({ ...newAssetData, processor: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">RAM</label>
                  <select
                    value={newAssetData.ram}
                    onChange={(e) =>
                      setNewAssetData({ ...newAssetData, ram: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="8GB DDR4">8GB</option>
                    <option value="16GB DDR5">16GB</option>
                    <option value="32GB DDR5">32GB</option>
                    <option value="64GB DDR5">64GB</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Storage Capacity & Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 512GB NVMe SSD"
                    value={newAssetData.storage}
                    onChange={(e) =>
                      setNewAssetData({ ...newAssetData, storage: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Graphics / GPU
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Intel Iris Xe or NVIDIA RTX 4060"
                    value={newAssetData.graphics}
                    onChange={(e) =>
                      setNewAssetData({ ...newAssetData, graphics: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Condition *
                  </label>
                  <select
                    value={newAssetData.condition}
                    onChange={(e) =>
                      setNewAssetData({
                        ...newAssetData,
                        condition: e.target.value as AssetCondition,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 75000"
                    value={newAssetData.purchasePrice}
                    onChange={(e) =>
                      setNewAssetData({
                        ...newAssetData,
                        purchasePrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Accessories Included
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 65W AC Adapter, Laptop Sleeve, Wireless Mouse"
                    value={newAssetData.accessories}
                    onChange={(e) =>
                      setNewAssetData({ ...newAssetData, accessories: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white font-bold rounded-xl shadow-xs hover:opacity-95"
                >
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
