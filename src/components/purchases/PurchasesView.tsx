import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Building,
  Calendar,
  Layers,
  DollarSign,
  X,
  Laptop,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Purchase, Supplier } from '../../types';
import { Pagination } from '../common/Pagination';

export const PurchasesView: React.FC = () => {
  const {
    purchases,
    suppliers,
    assets,
    addPurchase,
    addSupplier,
    setCurrentView,
    settings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'purchases' | 'suppliers'>('purchases');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // Supplier Form
  const [supplierFormData, setSupplierFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: 'Chennai',
    taxDetails: '',
    notes: '',
  });

  // Purchase Form
  const [purchaseFormData, setPurchaseFormData] = useState({
    supplierId: suppliers[0]?.supplierId || '',
    purchaseDate: new Date().toISOString().split('T')[0],
    supplierInvoiceNumber: `INV-SUP-${Math.floor(Math.random() * 9000 + 1000)}`,
    taxRate: settings.defaultTaxRate,
    discount: 0,
    notes: 'Procurement for rental expansion.',
    items: [
      {
        category: 'Laptop' as 'Laptop' | 'Desktop',
        brand: 'Dell',
        model: 'Latitude 5440 Enterprise',
        serialNumber: `DELL-${Math.floor(Math.random() * 90000 + 10000)}`,
        processor: 'Intel Core i5-1345U (10 Cores)',
        generation: '13th Gen',
        ram: '16GB DDR5',
        storage: '512GB NVMe SSD',
        unitCost: 65000,
      },
    ],
  });

  const formatCurrency = (val: number) => `${settings.currencySymbol}${val.toLocaleString('en-IN')}`;

  const handleAddItemToPurchase = () => {
    setPurchaseFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          category: 'Laptop',
          brand: 'Lenovo',
          model: 'ThinkPad T14 Gen 4',
          serialNumber: `LNV-${Math.floor(Math.random() * 90000 + 10000)}`,
          processor: 'Intel Core i7-1355U',
          generation: '13th Gen',
          ram: '16GB DDR5',
          storage: '512GB SSD',
          unitCost: 72000,
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setPurchaseFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleConfirmPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseFormData.supplierId || purchaseFormData.items.length === 0) return;

    addPurchase({
      supplierId: purchaseFormData.supplierId,
      purchaseDate: purchaseFormData.purchaseDate,
      supplierInvoiceNumber: purchaseFormData.supplierInvoiceNumber,
      taxRate: Number(purchaseFormData.taxRate),
      discount: Number(purchaseFormData.discount),
      notes: purchaseFormData.notes,
      items: purchaseFormData.items,
    });

    setShowPurchaseModal(false);
  };

  const handleConfirmSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierFormData.name || !supplierFormData.phone) return;

    const nextNum = suppliers.length + 101;
    const supplierId = `SUP-${nextNum}`;

    addSupplier({
      supplierId,
      name: supplierFormData.name,
      contactPerson: supplierFormData.contactPerson,
      phone: supplierFormData.phone,
      email: supplierFormData.email,
      address: supplierFormData.address,
      city: supplierFormData.city,
      taxDetails: supplierFormData.taxDetails,
      notes: supplierFormData.notes,
    });

    setShowSupplierModal(false);
  };

  const filteredPurchases = purchases.filter(
    (p) =>
      p.purchaseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierInvoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.items.some(
        (it) =>
          it.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          it.model.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.supplierId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedPurchases = filteredPurchases.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalProcuredCost = purchases.reduce((sum, p) => sum + p.totalCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Procurement & Supplier Directory
          </h2>
          <p className="text-xs text-slate-500">
            Hardware acquisition, supplier invoicing, and multi-device inventory intake
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-all"
          >
            + New Supplier
          </button>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Purchase & Intake</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search purchases or suppliers..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#087BEF] outline-none"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => {
                setActiveTab('purchases');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 font-semibold rounded-md transition-all ${
                activeTab === 'purchases'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Purchases ({filteredPurchases.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('suppliers');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 font-semibold rounded-md transition-all ${
                activeTab === 'suppliers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Suppliers Master ({filteredSuppliers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'purchases' ? (
        <div className="space-y-4">
          {paginatedPurchases.length === 0 ? (
            <div className="p-10 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              No purchase orders match your search.
            </div>
          ) : (
            paginatedPurchases.map((pur) => (
            <div
              key={pur.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 hover:border-[#087BEF] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="font-mono font-bold text-sm text-[#073DBB]">{pur.purchaseId}</div>
                  <span className="text-slate-400">·</span>
                  <div className="font-bold text-slate-900 text-sm">{pur.supplierName}</div>
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    Inv #{pur.supplierInvoiceNumber}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Purchased on: <strong className="text-slate-700">{pur.purchaseDate}</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>
                    Total Cost:{' '}
                    <strong className="text-slate-900 font-bold text-sm tabular-nums">
                      {formatCurrency(pur.totalCost)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Physical Devices Intaken under this purchase (BRD 6.4: Each physical device captured with Asset ID) */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Physical Devices Registered into Inventory ({pur.items.length}):
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {pur.items.map((it) => (
                    <div
                      key={it.assetId}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-800">
                          {it.brand} {it.model}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {it.assetId} · S/N: {it.serialNumber}
                        </div>
                      </div>
                      <span className="font-semibold text-slate-700 tabular-nums">
                        {formatCurrency(it.unitCost)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {pur.notes && (
                <div className="text-xs text-slate-500 italic pt-1 border-t border-slate-100">
                  <strong>Notes:</strong> {pur.notes}
                </div>
              )}
            </div>
            ))
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredPurchases.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              className="border-t-0"
            />
          </div>
        </div>
      ) : (
        /* Suppliers Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Supplier ID</th>
                  <th className="py-3 px-4">Supplier Company</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Phone & Email</th>
                  <th className="py-3 px-4">Tax / GST Details</th>
                  <th className="py-3 px-4">Total Purchases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                      No suppliers match your search.
                    </td>
                  </tr>
                ) : (
                  paginatedSuppliers.map((sup) => {
                  const supPurchases = purchases.filter((p) => p.supplierId === sup.supplierId);
                  const supSpend = supPurchases.reduce((sum, p) => sum + p.totalCost, 0);

                  return (
                    <tr key={sup.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#073DBB]">
                        {sup.supplierId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sup.name}</div>
                        <div className="text-[11px] text-slate-500">{sup.address}, {sup.city}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">{sup.contactPerson}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>📞 {sup.phone}</div>
                        <div className="text-[11px] text-slate-500">✉️ {sup.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{sup.taxDetails}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 tabular-nums">
                          {formatCurrency(supSpend)}
                        </div>
                        <div className="text-[10px] text-slate-400">{supPurchases.length} orders</div>
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
            totalItems={filteredSuppliers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Modal 1: Record Purchase & Batch Physical Device Intake (BRD 6.4) */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Record Purchase & Batch Intake</h3>
                <p className="text-xs text-blue-100">
                  Automatically registers each physical device with unique Asset ID
                </p>
              </div>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPurchase} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Supplier *
                  </label>
                  <select
                    required
                    value={purchaseFormData.supplierId}
                    onChange={(e) =>
                      setPurchaseFormData({ ...purchaseFormData, supplierId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.supplierId}>
                        {s.name} ({s.supplierId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Supplier Invoice Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={purchaseFormData.supplierInvoiceNumber}
                    onChange={(e) =>
                      setPurchaseFormData({
                        ...purchaseFormData,
                        supplierInvoiceNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseFormData.purchaseDate}
                    onChange={(e) =>
                      setPurchaseFormData({
                        ...purchaseFormData,
                        purchaseDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Tax Rate (%)</label>
                  <input
                    type="number"
                    value={purchaseFormData.taxRate}
                    onChange={(e) =>
                      setPurchaseFormData({
                        ...purchaseFormData,
                        taxRate: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Physical Devices Line Items Intake */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Physical Devices to Intake ({purchaseFormData.items.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemToPurchase}
                    className="text-[#087BEF] font-bold text-xs hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Device</span>
                  </button>
                </div>

                <div className="space-y-3 mt-3">
                  {purchaseFormData.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative"
                    >
                      {purchaseFormData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="absolute right-2 top-2 text-slate-400 hover:text-red-600 text-xs p-1"
                        >
                          ✕ Remove
                        </button>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold">Category</label>
                          <select
                            value={item.category}
                            onChange={(e) => {
                              const updated = [...purchaseFormData.items];
                              updated[idx].category = e.target.value as any;
                              setPurchaseFormData({ ...purchaseFormData, items: updated });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          >
                            <option value="Laptop">Laptop</option>
                            <option value="Desktop">Desktop</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold">Brand</label>
                          <input
                            type="text"
                            value={item.brand}
                            onChange={(e) => {
                              const updated = [...purchaseFormData.items];
                              updated[idx].brand = e.target.value;
                              setPurchaseFormData({ ...purchaseFormData, items: updated });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold">Model</label>
                          <input
                            type="text"
                            value={item.model}
                            onChange={(e) => {
                              const updated = [...purchaseFormData.items];
                              updated[idx].model = e.target.value;
                              setPurchaseFormData({ ...purchaseFormData, items: updated });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold">Serial No</label>
                          <input
                            type="text"
                            value={item.serialNumber}
                            onChange={(e) => {
                              const updated = [...purchaseFormData.items];
                              updated[idx].serialNumber = e.target.value;
                              setPurchaseFormData({ ...purchaseFormData, items: updated });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold">Processor</label>
                          <input
                            type="text"
                            value={item.processor}
                            onChange={(e) => {
                              const updated = [...purchaseFormData.items];
                              updated[idx].processor = e.target.value;
                              setPurchaseFormData({ ...purchaseFormData, items: updated });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold">RAM</label>
                          <input
                            type="text"
                            value={item.ram}
                            onChange={(e) => {
                              const updated = [...purchaseFormData.items];
                              updated[idx].ram = e.target.value;
                              setPurchaseFormData({ ...purchaseFormData, items: updated });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold">Storage</label>
                          <input
                            type="text"
                            value={item.storage}
                            onChange={(e) => {
                              const updated = [...purchaseFormData.items];
                              updated[idx].storage = e.target.value;
                              setPurchaseFormData({ ...purchaseFormData, items: updated });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold">Unit Cost (₹)</label>
                          <input
                            type="number"
                            value={item.unitCost}
                            onChange={(e) => {
                              const updated = [...purchaseFormData.items];
                              updated[idx].unitCost = Number(e.target.value);
                              setPurchaseFormData({ ...purchaseFormData, items: updated });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white font-bold rounded-xl shadow-xs"
                >
                  Intake {purchaseFormData.items.length} Devices & Create Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: New Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-[#073DBB] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Add Hardware Supplier</h3>
                <p className="text-xs text-blue-100">Maintain supplier profiles and tax GSTIN</p>
              </div>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSupplier} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supplier Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Hardware Importers"
                  value={supplierFormData.name}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={supplierFormData.contactPerson}
                    onChange={(e) =>
                      setSupplierFormData({ ...supplierFormData, contactPerson: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={supplierFormData.phone}
                    onChange={(e) =>
                      setSupplierFormData({ ...supplierFormData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={supplierFormData.email}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">GSTIN / Tax ID</label>
                <input
                  type="text"
                  placeholder="e.g. 33AABCM3021P1ZP"
                  value={supplierFormData.taxDetails}
                  onChange={(e) =>
                    setSupplierFormData({
                      ...supplierFormData,
                      taxDetails: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#073DBB] text-white font-bold rounded-xl shadow-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
