import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  Search,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Pagination } from '../common/Pagination';

export const ReportsView: React.FC = () => {
  const {
    customers,
    assets,
    purchases,
    rentals,
    returns,
    sales,
    serviceRequests,
    invoices,
    payments,
    lifecycleEvents,
    settings,
  } = useApp();

  const [selectedReport, setSelectedReport] = useState<string>('customer_report');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const formatCurrency = (val: number) => `${settings.currencySymbol}${val.toLocaleString('en-IN')}`;

  const reportDefinitions = [
    { id: 'customer_report', title: '1. Customer Report', desc: 'Customer details, counts of rented/sold devices and outstanding balance' },
    { id: 'asset_register', title: '2. Complete Asset Register', desc: 'Asset ID, specifications, serial number, condition, purchase data and current status' },
    { id: 'purchase_report', title: '3. Purchase Report', desc: 'Supplier, purchase date, items, quantities, unit cost and totals' },
    { id: 'inventory_report', title: '4. Inventory Report', desc: 'Available, rented, reserved, service, damaged, sold and retired assets' },
    { id: 'rental_report', title: '5. Rental Report', desc: 'Rental ID, customer, assets, start/due dates, charges and status' },
    { id: 'overdue_rental_report', title: '6. Overdue Rental Report', desc: 'Customer, asset, due date, days overdue and applicable charges' },
    { id: 'return_report', title: '7. Return Report', desc: 'Return date, condition, damage, fees and inspection outcome' },
    { id: 'sales_report', title: '8. Sales Report', desc: 'Sales ID, customer, asset, sale date, price and payment status' },
    { id: 'service_report', title: '9. Service Report', desc: 'Service ID, device, issue, status, cost and completion date' },
    { id: 'invoice_report', title: '10. Invoice Report', desc: 'Invoice number/type, customer, total, paid and balance' },
    { id: 'payment_report', title: '11. Payment Report', desc: 'Payment ID, customer, invoice, date, mode and amount' },
    { id: 'outstanding_report', title: '12. Outstanding Report', desc: 'Customer and invoice-wise unpaid balance' },
    { id: 'lifecycle_report', title: '13. Asset Lifecycle Report', desc: 'Chronological history of all physical assets' },
    { id: 'revenue_report', title: '14. Revenue Report', desc: 'Rental, sales and service revenue by category' },
  ];

  // Helper function to export CSV
  const handleExportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Render current report table & export data
  const renderCurrentReport = () => {
    switch (selectedReport) {
      case 'customer_report': {
        const headers = ['Customer ID', 'Name', 'Entity Type', 'Mobile', 'Active Devices', 'Total Ever Rented', 'Purchased', 'Invoiced', 'Balance Due'];
        const rows = customers.map((c) => {
          const custRentals = rentals.filter((r) => r.customerId === c.customerId);
          const activeItemsCount = custRentals
            .filter((r) => r.status === 'Active' || r.status === 'Partially Returned' || r.status === 'Overdue')
            .reduce((sum, r) => sum + r.items.filter((i) => i.status === 'Active').length, 0);

          const everRentedCount = new Set(custRentals.flatMap((r) => r.items.map((i) => i.assetId))).size;
          const purchasedCount = sales.filter((s) => s.customerId === c.customerId).reduce((sum, s) => sum + s.items.length, 0);
          const custInvoices = invoices.filter((i) => i.customerId === c.customerId);
          const totalInv = custInvoices.reduce((sum, i) => sum + i.total, 0);
          const balDue = custInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

          return [c.customerId, c.name, c.type, c.mobile, activeItemsCount, everRentedCount, purchasedCount, totalInv, balDue];
        });

        return {
          title: 'Customer Master & Transaction Reconciliation Report',
          headers,
          data: rows,
          onExport: () => handleExportCSV('CloudTech_Customer_Report', headers, rows),
        };
      }

      case 'asset_register': {
        const headers = ['Asset ID', 'Serial Number', 'Category', 'Brand', 'Model', 'Processor', 'RAM', 'Storage', 'Condition', 'Purchase Cost', 'Status'];
        const rows = assets.map((a) => [
          a.assetId,
          a.serialNumber,
          a.category,
          a.brand,
          a.model,
          a.processor,
          a.ram,
          a.storage,
          a.condition,
          a.purchasePrice,
          a.status,
        ]);
        return {
          title: 'Complete Fleet Asset Register',
          headers,
          data: rows,
          onExport: () => handleExportCSV('CloudTech_Asset_Register', headers, rows),
        };
      }

      case 'overdue_rental_report': {
        const headers = ['Rental ID', 'Customer Name', 'Mobile', 'Expected Return Date', 'Active Assets', 'Monthly Rate', 'Security Deposit'];
        const rows = rentals
          .filter((r) => r.status === 'Overdue')
          .map((r) => [
            r.rentalId,
            r.customerName,
            r.customerMobile,
            r.expectedReturnDate,
            r.items.filter((i) => i.status === 'Active').map((i) => i.assetId).join(', '),
            r.ratePerPeriod,
            r.securityDeposit,
          ]);
        return {
          title: 'Overdue Rental Leases Action Report',
          headers,
          data: rows,
          onExport: () => handleExportCSV('CloudTech_Overdue_Rentals', headers, rows),
        };
      }

      case 'rental_report': {
        const headers = ['Rental ID', 'Customer Name', 'Start Date', 'Expected Return Date', 'Devices', 'Frequency', 'Rate', 'Total Billed', 'Status'];
        const rows = rentals.map((r) => [
          r.rentalId,
          r.customerName,
          r.startDate,
          r.expectedReturnDate,
          r.items.map((i) => i.assetId).join(', '),
          r.rentalFrequency,
          r.ratePerPeriod,
          r.totalRentalAmount,
          r.status,
        ]);
        return {
          title: 'Comprehensive Rental Contracts Report',
          headers,
          data: rows,
          onExport: () => handleExportCSV('CloudTech_Rentals_Report', headers, rows),
        };
      }

      case 'sales_report': {
        const headers = ['Sales ID', 'Customer Name', 'Sale Date', 'Asset ID & Model', 'Subtotal', 'Tax (GST)', 'Total Amount', 'Payment Mode', 'Status'];
        const rows = sales.map((s) => [
          s.saleId,
          s.customerName,
          s.saleDate,
          s.items.map((i) => `${i.assetId} (${i.brand} ${i.model})`).join(', '),
          s.subtotal,
          s.taxAmount,
          s.totalAmount,
          s.paymentMode,
          s.paymentStatus,
        ]);
        return {
          title: 'Outright Sales & Disposals Report',
          headers,
          data: rows,
          onExport: () => handleExportCSV('CloudTech_Sales_Report', headers, rows),
        };
      }

      case 'service_report': {
        const headers = ['Service ID', 'Ownership', 'Customer / Asset', 'Device', 'Problem', 'Technician', 'Status', 'Cost'];
        const rows = serviceRequests.map((s) => [
          s.serviceId,
          s.ownershipType === 'company_owned' ? 'Company Fleet' : 'Customer Device',
          s.customerName,
          s.deviceDetails,
          s.reportedProblem,
          s.technician,
          s.status,
          s.actualCost || s.estimate,
        ]);
        return {
          title: 'Hardware Service & Repair Center Report',
          headers,
          data: rows,
          onExport: () => handleExportCSV('CloudTech_Service_Report', headers, rows),
        };
      }

      case 'invoice_report': {
        const headers = ['Invoice Number', 'Type', 'Customer Name', 'Date', 'Due Date', 'Total', 'Paid', 'Balance Due', 'Status'];
        const rows = invoices.map((i) => [
          i.invoiceNumber,
          i.type,
          i.customerName,
          i.date,
          i.dueDate,
          i.total,
          i.paidAmount,
          i.balanceDue,
          i.paymentStatus,
        ]);
        return {
          title: 'Billing & Tax Invoice Register Report',
          headers,
          data: rows,
          onExport: () => handleExportCSV('CloudTech_Invoice_Report', headers, rows),
        };
      }

      case 'payment_report': {
        const headers = ['Payment ID', 'Invoice No', 'Customer Name', 'Date', 'Mode', 'Transaction Ref', 'Type', 'Amount'];
        const rows = payments.map((p) => [
          p.paymentId,
          p.invoiceNumber,
          p.customerName,
          p.date,
          p.mode,
          p.transactionReference,
          p.paymentType,
          p.amount,
        ]);
        return {
          title: 'Collections & Remittances Report',
          headers,
          data: rows,
          onExport: () => handleExportCSV('CloudTech_Payment_Report', headers, rows),
        };
      }

      case 'outstanding_report': {
        const headers = ['Customer ID', 'Customer Name', 'Mobile', 'Invoices with Balance', 'Total Invoiced', 'Total Outstanding'];
        const rows = customers
          .map((c) => {
            const custInvoices = invoices.filter((i) => i.customerId === c.customerId && i.balanceDue > 0);
            const totalOut = custInvoices.reduce((sum, i) => sum + i.balanceDue, 0);
            const totalInv = invoices.filter((i) => i.customerId === c.customerId).reduce((sum, i) => sum + i.total, 0);
            return [c.customerId, c.name, c.mobile, custInvoices.map((i) => i.invoiceNumber).join(', '), totalInv, totalOut];
          })
          .filter((row) => (row[5] as number) > 0);

        return {
          title: 'Aging & Outstanding Receivables Report',
          headers,
          data: rows,
          onExport: () => handleExportCSV('CloudTech_Outstanding_Report', headers, rows),
        };
      }

      case 'inventory_report': {
        const headers = ['Category', 'Brand', 'Model', 'Total Count', 'Available', 'Rented', 'Inspection', 'Service', 'Sold'];
        // Group by brand + model
        const models = Array.from(new Set(assets.map((a) => `${a.brand} ${a.model}`)));
        const rows = models.map((m) => {
          const matching = assets.filter((a) => `${a.brand} ${a.model}` === m);
          const cat = matching[0]?.category || 'Laptop';
          const brand = matching[0]?.brand || '';
          const modelName = matching[0]?.model || '';
          const avail = matching.filter((a) => a.status === 'Available').length;
          const rnt = matching.filter((a) => a.status === 'Rented').length;
          const insp = matching.filter((a) => a.status === 'Returned - Inspection Pending').length;
          const srv = matching.filter((a) => a.status === 'Under Service').length;
          const sold = matching.filter((a) => a.status === 'Sold').length;

          return [cat, brand, modelName, matching.length, avail, rnt, insp, srv, sold];
        });

        return {
          title: 'Fleet Inventory & Utilization Report',
          headers,
          data: rows,
          onExport: () => handleExportCSV('CloudTech_Inventory_Report', headers, rows),
        };
      }

      case 'lifecycle_report': {
        const headers = ['Asset ID', 'Timestamp', 'Event Type', 'Details', 'Performed By', 'Ref ID'];
        const rows = lifecycleEvents.map((ev) => [
          ev.assetId,
          ev.timestamp,
          ev.eventType,
          ev.details,
          ev.performedBy,
          ev.referenceId || '—',
        ]);
        return {
          title: 'Asset Lifecycle Audit History Report',
          headers,
          data: rows,
          onExport: () => handleExportCSV('CloudTech_Lifecycle_Report', headers, rows),
        };
      }

      case 'revenue_report': {
        const rentalRev = payments.filter((p) => p.paymentType === 'Rental Fee').reduce((s, p) => s + p.amount, 0);
        const saleRev = payments.filter((p) => p.paymentType === 'Sale Payment').reduce((s, p) => s + p.amount, 0);
        const srvRev = payments.filter((p) => p.paymentType === 'Service Fee').reduce((s, p) => s + p.amount, 0);
        const depositCollected = payments.filter((p) => p.paymentType === 'Security Deposit').reduce((s, p) => s + p.amount, 0);

        const headers = ['Revenue Stream', 'Category', 'Total Realized Collections (₹)', 'Percentage of Total'];
        const grandTotal = rentalRev + saleRev + srvRev;
        const rows = [
          ['Equipment Rentals', 'Operational Revenue', rentalRev, `${((rentalRev / grandTotal) * 100).toFixed(1)}%`],
          ['Outright Asset Sales', 'Sales Realization', saleRev, `${((saleRev / grandTotal) * 100).toFixed(1)}%`],
          ['Service & Maintenance Fees', 'Service Charges', srvRev, `${((srvRev / grandTotal) * 100).toFixed(1)}%`],
          ['Refundable Security Deposits (Escrow)', 'Held Liability (Non-Revenue)', depositCollected, 'Escrowed'],
        ];

        return {
          title: 'Financial Revenue & Segment Breakdown Report',
          headers,
          data: rows,
          onExport: () => handleExportCSV('CloudTech_Revenue_Report', headers, rows),
        };
      }

      default: {
        const headers = ['ID', 'Date', 'Type', 'Status'];
        const rows = rentals.map((r) => [r.rentalId, r.startDate, r.rentalFrequency, r.status]);
        return {
          title: 'Standard Operational Report',
          headers,
          data: rows,
          onExport: () => handleExportCSV('CloudTech_Standard_Report', headers, rows),
        };
      }
    }
  };

  const currentReportData = renderCurrentReport();
  const paginatedRows = currentReportData.data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Business Intelligence & Reports
          </h2>
          <p className="text-xs text-slate-500">
            Generate and export all 14 statutory, operational, and financial reports specified in BRD Section 10
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={currentReportData.onExport}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV / Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#073DBB] hover:bg-[#052d8a] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report View</span>
          </button>
        </div>
      </div>

      {/* Report Selector Grid */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Select Report from BRD Register:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {reportDefinitions.map((rep) => (
            <button
              key={rep.id}
              onClick={() => {
                setSelectedReport(rep.id);
                setCurrentPage(1);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedReport === rep.id
                  ? 'bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white border-transparent shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold text-xs truncate">{rep.title}</div>
              <div
                className={`text-[10px] mt-0.5 line-clamp-1 ${
                  selectedReport === rep.id ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {rep.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Report Output Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{currentReportData.title}</h3>
            <p className="text-xs text-slate-500">
              Showing {currentReportData.data.length} records · CloudTech Laptops & Desktops
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Generated on {new Date().toLocaleString('en-IN')}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200 font-bold">
              <tr>
                {currentReportData.headers.map((h, i) => (
                  <th key={i} className="py-3 px-4 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={currentReportData.headers.length}
                    className="py-12 text-center text-slate-400 text-xs"
                  >
                    No records found for this report criteria.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/70 transition-colors">
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className={`py-3.5 px-4 whitespace-nowrap ${
                          typeof cell === 'number'
                            ? 'font-bold text-slate-900 tabular-nums'
                            : 'text-slate-700'
                        }`}
                      >
                        {typeof cell === 'number' &&
                        (currentReportData.headers[cellIdx].toLowerCase().includes('cost') ||
                          currentReportData.headers[cellIdx].toLowerCase().includes('total') ||
                          currentReportData.headers[cellIdx].toLowerCase().includes('amount') ||
                          currentReportData.headers[cellIdx].toLowerCase().includes('due') ||
                          currentReportData.headers[cellIdx].toLowerCase().includes('rate') ||
                          currentReportData.headers[cellIdx].toLowerCase().includes('invoiced') ||
                          currentReportData.headers[cellIdx].toLowerCase().includes('deposit'))
                          ? formatCurrency(cell)
                          : cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={currentReportData.data.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
};
