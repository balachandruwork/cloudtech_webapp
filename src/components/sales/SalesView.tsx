import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle,
  Receipt,
  UserCheck,
  X,
  CreditCard,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import { Pagination } from '../common/Pagination';

export const SalesView: React.FC = () => {
  const {
    sales,
    assets,
    customers,
    createSale,
    navigateToCustomer360,
    setCurrentView,
    settings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerId: customers[0]?.customerId || '',
    selectedAssetId: '',
    saleDate: new Date().toISOString().split('T')[0],
    sellingPrice: 85000,
    discount: 0,
    taxRate: settings.defaultTaxRate,
    paymentMode: 'Bank Transfer' as 'Cash' | 'UPI' | 'Bank Transfer' | 'Card',
    paidAmount: 85000,
    remarks: 'Outright corporate hardware purchase with 1 year warranty.',
  });

  const formatCurrency = (val: number) => `${settings.currencySymbol}${val.toLocaleString('en-IN')}`;

  // Only eligible Available assets may be sold (BRD Section 11: Rule 11 & 12)
  const availableEligibleAssets = assets.filter((a) => a.status === 'Available');

  const handleOpenCreate = () => {
    const firstAvailable = availableEligibleAssets[0];
    setFormData({
      customerId: customers[0]?.customerId || '',
      selectedAssetId: firstAvailable ? firstAvailable.assetId : '',
      saleDate: new Date().toISOString().split('T')[0],
      sellingPrice: firstAvailable ? firstAvailable.purchasePrice * 1.15 : 75000,
      discount: 0,
      taxRate: settings.defaultTaxRate,
      paymentMode: 'Bank Transfer',
      paidAmount: firstAvailable ? firstAvailable.purchasePrice * 1.15 : 75000,
      remarks: 'Outright purchase with CloudTech certified certificate.',
    });
    setShowCreateModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.selectedAssetId) return;

    createSale({
      customerId: formData.customerId,
      assetIds: [formData.selectedAssetId],
      saleDate: formData.saleDate,
      sellingPrice: Number(formData.sellingPrice),
      discount: Number(formData.discount),
      taxRate: Number(formData.taxRate),
      paymentMode: formData.paymentMode,
      paidAmount: Number(formData.paidAmount),
      remarks: formData.remarks,
    });

    setShowCreateModal(false);
  };

  const filteredSales = sales.filter((s) => {
    return (
      s.saleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.items.some(
        (it) =>
          it.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          it.model.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sales Management</h2>
          <p className="text-xs text-slate-500">
            Outright sales of eligible available laptops & desktops with automated invoice generation
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={availableEligibleAssets.length === 0}
          className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Outright Sale</span>
        </button>
      </div>

      {/* KPI banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Sales Completed</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {sales.length} orders
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Gross Realized Sales</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
            {formatCurrency(totalSalesRevenue)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Eligible Devices for Sale</div>
          <div className="text-2xl font-bold text-[#087BEF] mt-1 tabular-nums">
            {availableEligibleAssets.length} available
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Sales ID, customer name, or asset model..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#087BEF] outline-none"
          />
        </div>
      </div>

      {/* Sales Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Sales ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Device Purchased</th>
                <th className="py-3 px-4">Sale Date</th>
                <th className="py-3 px-4">Amount & Tax</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No sales orders found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#073DBB]">
                      {sale.saleId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sale.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {sale.customerId} · 📞 {sale.customerMobile}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {sale.items.map((it) => (
                        <div key={it.assetId} className="space-y-0.5">
                          <div className="font-semibold text-slate-800">
                            {it.brand} {it.model}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {it.assetId} · S/N: {it.serialNumber}
                          </div>
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{sale.saleDate}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 tabular-nums">
                        {formatCurrency(sale.totalAmount)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Subtotal: {formatCurrency(sale.subtotal)} (+{sale.taxRate}% GST)
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          sale.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {sale.paymentStatus} ({sale.paymentMode})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setCurrentView('invoices')}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#073DBB] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Invoice</span>
                        </button>
                        <button
                          onClick={() => navigateToCustomer360(sale.customerId)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          360°
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredSales.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Create Sale Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Create Outright Asset Sale</h3>
                <p className="text-xs text-blue-100">
                  Select customer, choose available stock, and generate sales invoice
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl">
                <strong>BRD Business Rule 11 & 12:</strong> Only eligible devices in <em>Available</em> status may be sold. Rented, damaged, or devices under service are blocked from sale.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Master Account *
                </label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.customerId}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ''} · {c.customerId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Device from Available Stock *
                </label>
                <select
                  required
                  value={formData.selectedAssetId}
                  onChange={(e) => {
                    const ast = assets.find((a) => a.assetId === e.target.value);
                    const suggestedPrice = ast ? Math.round(ast.purchasePrice * 1.15) : 75000;
                    setFormData({
                      ...formData,
                      selectedAssetId: e.target.value,
                      sellingPrice: suggestedPrice,
                      paidAmount: suggestedPrice,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold outline-none"
                >
                  {availableEligibleAssets.map((a) => (
                    <option key={a.id} value={a.assetId}>
                      {a.brand} {a.model} ({a.assetId}) · S/N: {a.serialNumber} · {a.processor.split('(')[0]} · {a.condition}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sale Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.saleDate}
                    onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Selling Price (Subtotal) (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellingPrice: Number(e.target.value),
                        paidAmount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode *</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMode: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Amount Paid Today (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, paidAmount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Remarks / Warranty</label>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
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
                  Confirm Sale & Mark Asset Sold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
