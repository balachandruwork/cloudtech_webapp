import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Laptop,
  X,
  FileText,
  DollarSign,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceRequest, ServiceStatus } from '../../types';
import { Pagination } from '../common/Pagination';

export const ServiceView: React.FC = () => {
  const {
    serviceRequests,
    assets,
    customers,
    createServiceRequest,
    updateServiceStatus,
    navigateToCustomer360,
    settings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    ownershipType: 'company_owned' as 'company_owned' | 'customer_owned',
    customerId: customers[0]?.customerId || '',
    customerName: 'CloudTech Fleet Maintenance',
    customerPhone: '+91 98401 23456',
    assetId: '',
    deviceDetails: '',
    serialNumber: '',
    requestDate: new Date().toISOString().split('T')[0],
    reportedProblem: '',
    serviceType: 'Hardware Repair' as any,
    technician: 'Arun V. (Hardware Lead)',
    estimate: 3500,
    serviceNotes: '',
  });

  // Update status form state
  const [updateForm, setUpdateForm] = useState<{
    status: ServiceStatus;
    actualCost: number;
    completionDate: string;
    partsReplaced: string;
    serviceNotes: string;
    nextAssetStatus: 'Available' | 'Under Service' | 'Damaged';
  }>({
    status: 'In Progress',
    actualCost: 3500,
    completionDate: new Date().toISOString().split('T')[0],
    partsReplaced: '',
    serviceNotes: '',
    nextAssetStatus: 'Available',
  });

  const formatCurrency = (val: number) => `${settings.currencySymbol}${val.toLocaleString('en-IN')}`;

  const availableCompanyAssets = assets.filter(
    (a) => a.status === 'Available' || a.status === 'Returned - Inspection Pending' || a.status === 'Damaged'
  );

  const handleOpenCreate = () => {
    const firstAsset = availableCompanyAssets[0];
    setCreateForm({
      ownershipType: 'company_owned',
      customerId: '',
      customerName: 'CloudTech Inventory Maintenance',
      customerPhone: '+91 98401 23456',
      assetId: firstAsset ? firstAsset.assetId : '',
      deviceDetails: firstAsset ? `${firstAsset.brand} ${firstAsset.model}` : '',
      serialNumber: firstAsset ? firstAsset.serialNumber : '',
      requestDate: new Date().toISOString().split('T')[0],
      reportedProblem: 'Cooling fan rattling and intermittent thermal throttling.',
      serviceType: 'Hardware Repair',
      technician: 'Arun V. (Hardware Lead)',
      estimate: 2500,
      serviceNotes: 'Internal company asset maintenance ticket.',
    });
    setShowCreateModal(true);
  };

  const handleConfirmCreate = (e: React.FormEvent) => {
    e.preventDefault();

    createServiceRequest({
      ownershipType: createForm.ownershipType,
      customerId: createForm.ownershipType === 'customer_owned' ? createForm.customerId : undefined,
      customerName: createForm.customerName,
      customerPhone: createForm.customerPhone,
      assetId: createForm.ownershipType === 'company_owned' ? createForm.assetId : undefined,
      deviceDetails: createForm.deviceDetails,
      serialNumber: createForm.serialNumber,
      requestDate: createForm.requestDate,
      reportedProblem: createForm.reportedProblem,
      serviceType: createForm.serviceType,
      technician: createForm.technician,
      estimate: Number(createForm.estimate),
      serviceNotes: createForm.serviceNotes,
    });

    setShowCreateModal(false);
  };

  const handleOpenUpdate = (srv: ServiceRequest) => {
    setSelectedService(srv);
    setUpdateForm({
      status: srv.status,
      actualCost: srv.actualCost || srv.estimate,
      completionDate: srv.completionDate || new Date().toISOString().split('T')[0],
      partsReplaced: srv.partsReplaced || '',
      serviceNotes: srv.serviceNotes || '',
      nextAssetStatus: 'Available',
    });
    setShowUpdateModal(true);
  };

  const handleConfirmUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    updateServiceStatus(
      selectedService.serviceId,
      updateForm.status,
      Number(updateForm.actualCost),
      updateForm.completionDate,
      updateForm.partsReplaced,
      updateForm.serviceNotes,
      updateForm.nextAssetStatus
    );

    setShowUpdateModal(false);
  };

  const filteredServices = serviceRequests.filter((s) => {
    const matchesSearch =
      s.serviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.deviceDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.assetId && s.assetId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'Received':
        return 'bg-blue-50 text-blue-700';
      case 'Diagnosis Pending':
        return 'bg-amber-50 text-amber-700';
      case 'Estimate Prepared':
        return 'bg-purple-50 text-purple-700';
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-700 font-bold animate-pulse';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 font-bold';
      case 'Delivered':
        return 'bg-slate-100 text-slate-800 font-bold';
      case 'Cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Service & Repair Management
          </h2>
          <p className="text-xs text-slate-500">
            Hardware diagnostic pipeline for company-owned fleet and customer-owned computers
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Service Ticket</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Service ID, customer, device, or Asset ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#087BEF] outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Status:
            </span>
            {['all', 'Received', 'In Progress', 'Estimate Prepared', 'Completed', 'Delivered'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-[#073DBB] text-white font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st === 'all' ? 'All Tickets' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Service Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedServices.length === 0 ? (
          <div className="col-span-2 p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No service cases found matching selected status and search query.
          </div>
        ) : (
          paginatedServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-[#087BEF] p-5 space-y-3 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#073DBB]">
                      {srv.serviceId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        srv.ownershipType === 'company_owned'
                          ? 'bg-blue-50 text-[#073DBB]'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {srv.ownershipType === 'company_owned' ? 'Company Fleet' : 'Customer Device'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{srv.deviceDetails}</h4>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {srv.assetId ? `Asset: ${srv.assetId}` : ''}{' '}
                    {srv.serialNumber ? `· S/N: ${srv.serialNumber}` : ''}
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${getStatusBadge(
                    srv.status
                  )}`}
                >
                  {srv.status}
                </span>
              </div>

              {/* Problem & Diagnosis */}
              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 text-slate-700">
                <div>
                  <strong className="text-slate-900">Reported Problem:</strong> {srv.reportedProblem}
                </div>
                {srv.diagnosis && (
                  <div>
                    <strong className="text-slate-900">Diagnosis:</strong> {srv.diagnosis}
                  </div>
                )}
                {srv.partsReplaced && (
                  <div>
                    <strong className="text-slate-900">Parts Replaced:</strong> {srv.partsReplaced}
                  </div>
                )}
              </div>

              {/* Technician & Financial Details */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-600">
                <div>
                  <div className="text-[10px] text-slate-400">Customer</div>
                  <div className="font-semibold text-slate-800">{srv.customerName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Assigned Tech</div>
                  <div className="font-medium text-slate-700">{srv.technician}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Estimate / Cost</div>
                  <div className="font-bold text-slate-900 tabular-nums">
                    {formatCurrency(srv.actualCost || srv.estimate)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                {srv.customerId && (
                  <button
                    onClick={() => navigateToCustomer360(srv.customerId!)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Customer 360°
                  </button>
                )}
                <button
                  onClick={() => handleOpenUpdate(srv)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] rounded-lg shadow-2xs transition-all"
                >
                  Update Ticket / Status
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredServices.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          className="border-t-0"
        />
      </div>

      {/* Modal 1: Create Service Ticket */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Open Hardware Service Ticket</h3>
                <p className="text-xs text-blue-100">
                  Register internal fleet maintenance or external customer repair
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
                    Device Ownership Type *
                  </label>
                  <select
                    value={createForm.ownershipType}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        ownershipType: e.target.value as any,
                        customerName:
                          e.target.value === 'company_owned'
                            ? 'CloudTech Inventory Maintenance'
                            : customers[0]?.name || '',
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold outline-none"
                  >
                    <option value="company_owned">Company-Owned Fleet Device (Blocks device from rental/sale)</option>
                    <option value="customer_owned">Customer-Owned Outside Device</option>
                  </select>
                </div>

                {createForm.ownershipType === 'company_owned' ? (
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Select Company Asset to Service *
                    </label>
                    <select
                      required
                      value={createForm.assetId}
                      onChange={(e) => {
                        const matched = assets.find((a) => a.assetId === e.target.value);
                        setCreateForm({
                          ...createForm,
                          assetId: e.target.value,
                          deviceDetails: matched ? `${matched.brand} ${matched.model}` : '',
                          serialNumber: matched ? matched.serialNumber : '',
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold outline-none"
                    >
                      {availableCompanyAssets.map((a) => (
                        <option key={a.id} value={a.assetId}>
                          {a.brand} {a.model} ({a.assetId}) · Current: {a.status}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Select Customer *
                      </label>
                      <select
                        value={createForm.customerId}
                        onChange={(e) => {
                          const cust = customers.find((c) => c.customerId === e.target.value);
                          setCreateForm({
                            ...createForm,
                            customerId: e.target.value,
                            customerName: cust ? cust.name : '',
                            customerPhone: cust ? cust.mobile : '',
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.customerId}>
                            {c.name} ({c.customerId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Device Model / Description *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HP Pavilion 15-eg2009TU"
                        value={createForm.deviceDetails}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, deviceDetails: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Type *</label>
                  <select
                    value={createForm.serviceType}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, serviceType: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="Hardware Repair">Hardware Repair</option>
                    <option value="Screen Replacement">Screen Replacement</option>
                    <option value="Motherboard Service">Motherboard Service</option>
                    <option value="RAM/SSD Upgrade">RAM / SSD Upgrade</option>
                    <option value="OS & Software">OS & Software Re-imaging</option>
                    <option value="General Service & Cleaning">General Cleaning & Thermals</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assigned Technician *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.technician}
                    onChange={(e) => setCreateForm({ ...createForm, technician: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cost Estimate (₹)
                  </label>
                  <input
                    type="number"
                    value={createForm.estimate}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, estimate: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Request Date</label>
                  <input
                    type="date"
                    value={createForm.requestDate}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, requestDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Reported Hardware Fault / Problem *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe symptoms, noise, blue screens, display glitches, etc."
                    value={createForm.reportedProblem}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, reportedProblem: e.target.value })
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
                  className="px-5 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white font-bold rounded-xl shadow-xs hover:opacity-95"
                >
                  Create Ticket & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Update Service Ticket Status */}
      {showUpdateModal && selectedService && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-[#073DBB] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Update Service Ticket {selectedService.serviceId}</h3>
                <p className="text-xs text-indigo-100">{selectedService.deviceDetails}</p>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmUpdate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lifecycle Status *
                </label>
                <select
                  value={updateForm.status}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, status: e.target.value as ServiceStatus })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold outline-none"
                >
                  <option value="Received">Received</option>
                  <option value="Diagnosis Pending">Diagnosis Pending</option>
                  <option value="Estimate Prepared">Estimate Prepared</option>
                  <option value="Customer Approval Pending">Customer Approval Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {selectedService.ownershipType === 'company_owned' &&
                (updateForm.status === 'Completed' || updateForm.status === 'Delivered') && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                    <label className="block font-bold text-blue-900 mb-1">
                      Device Post-Service Disposition:
                    </label>
                    <select
                      value={updateForm.nextAssetStatus}
                      onChange={(e) =>
                        setUpdateForm({ ...updateForm, nextAssetStatus: e.target.value as any })
                      }
                      className="w-full px-3 py-1.5 border border-blue-200 rounded-lg bg-white font-semibold text-slate-800"
                    >
                      <option value="Available">Available (Return to rental/sale inventory)</option>
                      <option value="Damaged">Damaged / Scrap</option>
                    </select>
                  </div>
                )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Actual Repair Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={updateForm.actualCost}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, actualCost: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={updateForm.completionDate}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, completionDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Parts Replaced / Upgraded
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15.6 IPS FHD display panel, 512GB NVMe SSD"
                  value={updateForm.partsReplaced}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, partsReplaced: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Technician Work Notes
                </label>
                <textarea
                  rows={2}
                  value={updateForm.serviceNotes}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, serviceNotes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-700 to-[#073DBB] text-white font-bold rounded-xl shadow-xs"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
