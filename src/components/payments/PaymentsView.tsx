import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Receipt,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Payment } from '../../types';
import { Pagination } from '../common/Pagination';

export const PaymentsView: React.FC = () => {
  const {
    payments,
    invoices,
    customers,
    recordPayment,
    navigateToCustomer360,
    setCurrentView,
    settings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showRecordModal, setShowRecordModal] = useState(false);

  const [formData, setFormData] = useState({
    invoiceId: invoices[0]?.id || '',
    amount: 5000,
    mode: 'Bank Transfer' as any,
    transactionReference: `UTR/${Date.now().toString().slice(-7)}`,
    paymentType: 'Rental Fee' as any,
    notes: 'Payment collected and verified against bank statement.',
  });

  const formatCurrency = (val: number) => `${settings.currencySymbol}${val.toLocaleString('en-IN')}`;

  const openInvoicesWithBalance = invoices.filter((i) => i.balanceDue > 0);

  const handleOpenRecord = () => {
    const firstWithBalance = openInvoicesWithBalance[0] || invoices[0];
    setFormData({
      invoiceId: firstWithBalance?.id || '',
      amount: firstWithBalance?.balanceDue || 5000,
      mode: 'Bank Transfer',
      transactionReference: `UTR/${Date.now().toString().slice(-7)}`,
      paymentType: firstWithBalance?.type === 'Rental' ? 'Rental Fee' : 'Sale Payment',
      notes: `Settlement against invoice ${firstWithBalance?.invoiceNumber}`,
    });
    setShowRecordModal(true);
  };

  const handleConfirmRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceId || formData.amount <= 0) return;

    recordPayment({
      invoiceId: formData.invoiceId,
      amount: Number(formData.amount),
      mode: formData.mode,
      transactionReference: formData.transactionReference,
      paymentType: formData.paymentType,
      notes: formData.notes,
    });

    setShowRecordModal(false);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.paymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.transactionReference.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || p.paymentType === typeFilter;
    return matchesSearch && matchesType;
  });

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalCollections = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Payments & Collection Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Real-time tracking of rental fees, hardware sales settlements, and security deposits
          </p>
        </div>

        <button
          onClick={handleOpenRecord}
          className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Collected Payments</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
            {formatCurrency(totalCollections)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{payments.length} transactions recorded</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Pending Invoice Receivables</div>
          <div className="text-2xl font-bold text-red-600 mt-1 tabular-nums">
            {formatCurrency(invoices.reduce((sum, i) => sum + i.balanceDue, 0))}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {openInvoicesWithBalance.length} invoices with open balance
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Security Deposits in Escrow</div>
          <div className="text-2xl font-bold text-cyan-700 mt-1 tabular-nums">
            {formatCurrency(
              payments
                .filter((p) => p.paymentType === 'Security Deposit')
                .reduce((sum, p) => sum + p.amount, 0)
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Tracked separately from revenue</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Payment ID, Invoice No, Customer, or UTR..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#087BEF] outline-none"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto overflow-x-auto text-xs">
            {['all', 'Rental Fee', 'Sale Payment', 'Security Deposit', 'Deposit Refund'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 font-semibold rounded-md transition-all whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Invoice Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Mode & Reference</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4 text-right">Amount Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    No payment transactions found matching search.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#073DBB]">
                      {p.paymentId}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{p.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{p.customerId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{p.date}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{p.mode}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs">
                        {p.transactionReference}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.paymentType === 'Security Deposit'
                            ? 'bg-cyan-50 text-cyan-800'
                            : p.paymentType === 'Deposit Refund'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {p.paymentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 tabular-nums text-sm">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredPayments.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-[#073DBB] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Record Collection / Payment</h3>
                <p className="text-xs text-emerald-100">
                  Credit customer ledger and update invoice balance
                </p>
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRecord} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Invoice to Allocate Payment *
                </label>
                <select
                  required
                  value={formData.invoiceId}
                  onChange={(e) => {
                    const inv = invoices.find((i) => i.id === e.target.value);
                    setFormData({
                      ...formData,
                      invoiceId: e.target.value,
                      amount: inv ? inv.balanceDue : 5000,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold outline-none"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.customerName} ({inv.type}) · Due: {formatCurrency(inv.balanceDue)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Amount Received (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode *</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transaction / UTR Reference *
                </label>
                <input
                  type="text"
                  required
                  value={formData.transactionReference}
                  onChange={(e) =>
                    setFormData({ ...formData, transactionReference: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Classification *
                </label>
                <select
                  value={formData.paymentType}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentType: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none font-medium"
                >
                  <option value="Rental Fee">Rental Fee</option>
                  <option value="Sale Payment">Sale Payment</option>
                  <option value="Service Fee">Service Fee</option>
                  <option value="Security Deposit">Security Deposit (Escrow)</option>
                  <option value="Deposit Refund">Deposit Refund</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-[#073DBB] text-white font-bold rounded-xl shadow-xs"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
