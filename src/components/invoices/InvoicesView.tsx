import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Printer,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  CreditCard,
  Building,
  User,
  FileText,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { CloudTechLogo } from '../common/CloudTechLogo';
import { Pagination } from '../common/Pagination';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    customers,
    assets,
    createInvoice,
    recordPayment,
    navigateToCustomer360,
    settings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // Quick Pay Modal State
  const [payFormData, setPayFormData] = useState({
    amount: 0,
    mode: 'Bank Transfer' as any,
    transactionReference: 'NEFT/HDFC/2026/091',
    paymentType: 'Rental Fee' as any,
    notes: 'Online bank settlement',
  });

  // Create Invoice Modal State
  const [newInvoiceData, setNewInvoiceData] = useState({
    type: 'Rental' as 'Rental' | 'Sale' | 'Service' | 'Deposit Receipt',
    customerId: customers[0]?.customerId || '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: [
      {
        description: 'Laptop Rental Monthly Fee',
        quantity: 1,
        unitRate: 4500,
        amount: 4500,
      },
    ],
    securityDeposit: 0,
    taxRate: settings.defaultTaxRate,
    discount: 0,
    notes: 'Payment due within 5 business days from date of invoice.',
  });

  const formatCurrency = (val: number) => `${settings.currencySymbol}${val.toLocaleString('en-IN')}`;

  const handleOpenPreview = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowPreviewModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenPay = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPayFormData({
      amount: inv.balanceDue,
      mode: 'Bank Transfer',
      transactionReference: `TXN/${Date.now().toString().slice(-6)}`,
      paymentType: inv.type === 'Rental' ? 'Rental Fee' : inv.type === 'Sale' ? 'Sale Payment' : 'Service Fee',
      notes: `Settlement for ${inv.invoiceNumber}`,
    });
    setShowPayModal(true);
  };

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    recordPayment({
      invoiceId: selectedInvoice.id,
      amount: Number(payFormData.amount),
      mode: payFormData.mode,
      transactionReference: payFormData.transactionReference,
      paymentType: payFormData.paymentType,
      notes: payFormData.notes,
    });

    setShowPayModal(false);
  };

  const handleConfirmCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoice({
      type: newInvoiceData.type,
      customerId: newInvoiceData.customerId,
      date: newInvoiceData.date,
      dueDate: newInvoiceData.dueDate,
      lineItems: newInvoiceData.lineItems,
      taxRate: Number(newInvoiceData.taxRate),
      discount: Number(newInvoiceData.discount),
      securityDeposit: Number(newInvoiceData.securityDeposit),
      notes: newInvoiceData.notes,
    });
    setShowCreateModal(false);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || inv.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Invoices & Billing Center
          </h2>
          <p className="text-xs text-slate-500">
            GST compliant tax invoices for equipment rentals, outright hardware sales, and service charges
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Tax Invoice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Invoice No, customer name, or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#087BEF] outline-none"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto overflow-x-auto text-xs">
            {['all', 'Rental', 'Sale', 'Service'].map((t) => (
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
                {t === 'all' ? 'All Invoices' : `${t} Invoices`}
              </button>
            ))}
          </div>
        </div>

        {/* Status filter bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-2.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Payment Status:
          </span>
          {['all', 'Paid', 'Partially Paid', 'Pending', 'Overdue'].map((st) => (
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
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Invoice Type</th>
                <th className="py-3 px-4">Billed To</th>
                <th className="py-3 px-4">Date / Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid / Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                    No invoices found matching search filters.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#073DBB]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{inv.type}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {inv.customerId} · 📞 {inv.customerMobile}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>Issued: {inv.date}</div>
                      <div className="text-[11px] text-slate-400">Due: {inv.dueDate}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                      {formatCurrency(inv.total)}
                      {inv.securityDeposit > 0 && (
                        <div className="text-[10px] font-normal text-cyan-700">
                          Incl. {formatCurrency(inv.securityDeposit)} deposit
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-emerald-700 tabular-nums">
                        Paid: {formatCurrency(inv.paidAmount)}
                      </div>
                      <div className="font-bold text-red-600 tabular-nums">
                        Due: {formatCurrency(inv.balanceDue)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          inv.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : inv.paymentStatus === 'Overdue'
                            ? 'bg-red-50 text-red-700 font-bold'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => handleOpenPay(inv)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenPreview(inv)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#073DBB] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Preview / Print</span>
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
          totalItems={filteredInvoices.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Printable & Downloadable Invoice Modal (BRD Section 6.10 & 9) */}
      {showPreviewModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6">
            {/* Modal Controls Bar (hidden during print) */}
            <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-300">
                Official Tax Invoice Document · {selectedInvoice.invoiceNumber}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-[#087BEF] hover:bg-[#0768ca] text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Branded Invoice Layout (Adheres directly to Brand Guidelines & BRD Requirements) */}
            <div id="invoice-printable" className="p-8 sm:p-10 space-y-6 bg-white text-slate-900">
              {/* Header: CloudTech Official Brand Lockup & Document Details */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
                <div>
                  <CloudTechLogo variant="full" size="md" />
                  <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                    <div>{settings.addressLine1}</div>
                    <div>{settings.addressLine2}, {settings.city} - {settings.pinCode}</div>
                    <div>📞 {settings.phone} · ✉️ {settings.email}</div>
                    <div className="font-bold text-slate-800 pt-1">
                      GSTIN: <span className="font-mono">{settings.gstNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="inline-block px-3 py-1 bg-[#073DBB] text-white font-black text-sm uppercase tracking-wider rounded-lg">
                    TAX INVOICE
                  </div>
                  <div className="mt-2 text-xs space-y-1">
                    <div>
                      <span className="text-slate-500">Invoice No:</span>{' '}
                      <strong className="font-mono text-slate-900 text-sm">
                        {selectedInvoice.invoiceNumber}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Invoice Date:</span>{' '}
                      <strong className="text-slate-900">{selectedInvoice.date}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Payment Due:</span>{' '}
                      <strong className="text-slate-900">{selectedInvoice.dueDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Transaction Ref:</span>{' '}
                      <span className="font-mono text-slate-700">
                        {selectedInvoice.relatedTransactionId || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billed To Customer Info Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1">
                    Billed To Client:
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {selectedInvoice.customerName}
                  </div>
                  <div className="text-slate-700 mt-1">{selectedInvoice.billingAddress}</div>
                  <div className="text-slate-600 mt-1">
                    📞 {selectedInvoice.customerMobile} · ✉️ {selectedInvoice.customerEmail}
                  </div>
                  {selectedInvoice.customerGst && (
                    <div className="text-blue-800 font-bold font-mono mt-1">
                      Customer GSTIN: {selectedInvoice.customerGst}
                    </div>
                  )}
                </div>

                <div className="sm:text-right space-y-1">
                  <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1">
                    Invoice Status:
                  </div>
                  <div>
                    <span
                      className={`inline-block font-black text-xs px-2.5 py-1 rounded ${
                        selectedInvoice.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedInvoice.paymentStatus === 'Overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedInvoice.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 pt-1">
                    Balance Payable:{' '}
                    <strong className="text-red-600 font-bold tabular-nums text-sm">
                      {formatCurrency(selectedInvoice.balanceDue)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-bold">
                    <tr>
                      <th className="py-2.5 px-4">Item & Description</th>
                      <th className="py-2.5 px-4">Hardware Serial No</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Unit Rate</th>
                      <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.lineItems.map((li) => (
                      <tr key={li.id}>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{li.description}</div>
                          {li.duration && (
                            <div className="text-[11px] text-slate-500">Period: {li.duration}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {li.serialNo || li.assetId || '—'}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-800 tabular-nums">
                          {li.quantity}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-800 tabular-nums">
                          {formatCurrency(li.unitRate)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                          {formatCurrency(li.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation & Escrow Deposit Breakdown */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
                <div className="text-xs text-slate-600 space-y-2 max-w-sm">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                    Banking Remittance Details:
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-0.5 font-mono text-slate-700">
                    <div>Bank: HDFC Bank Ltd, Cyber Hub Branch</div>
                    <div>Account Name: CloudTech Rental Solutions</div>
                    <div>A/C Number: 50200088219401</div>
                    <div>IFSC Code: HDFC0001824</div>
                    <div>UPI ID: cloudtech.rentals@hdfcbank</div>
                  </div>
                  {selectedInvoice.notes && (
                    <div className="text-slate-500 italic text-[11px]">
                      <strong>Terms:</strong> {selectedInvoice.notes}
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-72 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="tabular-nums font-semibold">{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>

                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount Applied:</span>
                      <span className="tabular-nums">- {formatCurrency(selectedInvoice.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Output CGST (9%):</span>
                    <span className="tabular-nums font-semibold">{formatCurrency(selectedInvoice.taxAmount / 2)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Output SGST (9%):</span>
                    <span className="tabular-nums font-semibold">{formatCurrency(selectedInvoice.taxAmount / 2)}</span>
                  </div>

                  {selectedInvoice.securityDeposit > 0 && (
                    <div className="flex justify-between text-cyan-800 font-semibold pt-1 border-t border-slate-100">
                      <span>Refundable Security Deposit:</span>
                      <span className="tabular-nums">{formatCurrency(selectedInvoice.securityDeposit)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t-2 border-slate-900">
                    <span>Grand Total:</span>
                    <span className="tabular-nums text-base">{formatCurrency(selectedInvoice.total)}</span>
                  </div>

                  <div className="flex justify-between text-emerald-700 font-bold pt-1">
                    <span>Amount Received:</span>
                    <span className="tabular-nums">{formatCurrency(selectedInvoice.paidAmount)}</span>
                  </div>

                  <div className="flex justify-between text-red-600 font-black text-sm pt-1 border-t border-slate-200">
                    <span>Balance Due:</span>
                    <span className="tabular-nums">{formatCurrency(selectedInvoice.balanceDue)}</span>
                  </div>
                </div>
              </div>

              {/* Authorized Signatory */}
              <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                <div>
                  <div>Thank you for choosing CloudTech.</div>
                  <div className="text-[10px]">Computers · Laptops · Workstations · Enterprise Leases</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-800 pb-8">For CloudTech</div>
                  <div className="border-t border-slate-300 pt-1 text-[11px] font-medium">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-[#073DBB] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Record Payment Receipt</h3>
                <p className="text-xs text-emerald-100">{selectedInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPay} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Invoice Total:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(selectedInvoice.total)}</span>
                </div>
                <div className="flex justify-between text-slate-600 mt-1">
                  <span>Balance Due:</span>
                  <span className="font-bold text-red-600">{formatCurrency(selectedInvoice.balanceDue)}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Amount Received (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={payFormData.amount}
                  onChange={(e) =>
                    setPayFormData({ ...payFormData, amount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Mode *</label>
                <select
                  value={payFormData.mode}
                  onChange={(e) =>
                    setPayFormData({ ...payFormData, mode: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="UPI">UPI (PhonePe / GPay / PayTM)</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transaction / UTR Reference No *
                </label>
                <input
                  type="text"
                  required
                  value={payFormData.transactionReference}
                  onChange={(e) =>
                    setPayFormData({ ...payFormData, transactionReference: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={payFormData.notes}
                  onChange={(e) => setPayFormData({ ...payFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-[#073DBB] text-white font-bold rounded-xl shadow-xs"
                >
                  Record Payment & Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Custom Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Generate Invoice / Bill</h3>
                <p className="text-xs text-blue-100">Create custom rental, sales or service invoice</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreateInvoice} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invoice Type *</label>
                  <select
                    value={newInvoiceData.type}
                    onChange={(e) =>
                      setNewInvoiceData({
                        ...newInvoiceData,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="Rental">Rental Invoice</option>
                    <option value="Sale">Sales Invoice</option>
                    <option value="Service">Service / Repair Invoice</option>
                    <option value="Deposit Receipt">Deposit Receipt</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer Account *
                  </label>
                  <select
                    value={newInvoiceData.customerId}
                    onChange={(e) =>
                      setNewInvoiceData({ ...newInvoiceData, customerId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none font-semibold"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.customerId}>
                        {c.name} {c.companyName ? `(${c.companyName})` : ''} ({c.customerId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={newInvoiceData.date}
                    onChange={(e) =>
                      setNewInvoiceData({ ...newInvoiceData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newInvoiceData.dueDate}
                    onChange={(e) =>
                      setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Line Item Description
                  </label>
                  <input
                    type="text"
                    value={newInvoiceData.lineItems[0].description}
                    onChange={(e) => {
                      const updated = [...newInvoiceData.lineItems];
                      updated[0].description = e.target.value;
                      setNewInvoiceData({ ...newInvoiceData, lineItems: updated });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    value={newInvoiceData.lineItems[0].amount}
                    onChange={(e) => {
                      const updated = [...newInvoiceData.lineItems];
                      const val = Number(e.target.value);
                      updated[0].amount = val;
                      updated[0].unitRate = val;
                      setNewInvoiceData({ ...newInvoiceData, lineItems: updated });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={newInvoiceData.securityDeposit}
                    onChange={(e) =>
                      setNewInvoiceData({
                        ...newInvoiceData,
                        securityDeposit: Number(e.target.value),
                      })
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
                  className="px-5 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white font-bold rounded-xl shadow-xs"
                >
                  Generate Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
