import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building,
  UserCheck,
  Edit2,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { Pagination } from '../common/Pagination';

export const CustomersView: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    navigateToCustomer360,
    settings,
    rentals,
    invoices,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Individual' | 'Business'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Pagination state (Requirement 3: rows 10, 20, 50)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'Business' as 'Individual' | 'Business',
    companyName: '',
    mobile: '',
    altMobile: '',
    email: '',
    billingAddress: '',
    deliveryAddress: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '',
    gstNumber: '',
    notes: '',
  });

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Business',
      companyName: '',
      mobile: '',
      altMobile: '',
      email: '',
      billingAddress: '',
      deliveryAddress: '',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pinCode: '',
      gstNumber: '',
      notes: '',
    });
    setDuplicateWarning(null);
    setEditingCustomer(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      type: customer.type,
      companyName: customer.companyName || '',
      mobile: customer.mobile,
      altMobile: customer.altMobile || '',
      email: customer.email,
      billingAddress: customer.billingAddress,
      deliveryAddress: customer.deliveryAddress,
      city: customer.city,
      state: customer.state,
      pinCode: customer.pinCode,
      gstNumber: customer.gstNumber || '',
      notes: customer.notes || '',
    });
    setShowAddModal(true);
  };

  // Check duplicate mobile or email (BRD 6.2: "Prevent accidental duplicate customer creation using configurable duplicate checks")
  const checkDuplicate = (mobile: string, email: string) => {
    if (!mobile && !email) {
      setDuplicateWarning(null);
      return;
    }
    const dup = customers.find(
      (c) =>
        (!editingCustomer || c.id !== editingCustomer.id) &&
        ((mobile && c.mobile === mobile) || (email && c.email.toLowerCase() === email.toLowerCase()))
    );

    if (dup) {
      setDuplicateWarning(
        `Duplicate detected: Customer "${dup.name}" already registered with this mobile/email (${dup.customerId}).`
      );
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.mobile) {
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: formData.name,
        type: formData.type,
        companyName: formData.companyName,
        mobile: formData.mobile,
        altMobile: formData.altMobile,
        email: formData.email,
        billingAddress: formData.billingAddress,
        deliveryAddress: formData.deliveryAddress || formData.billingAddress,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
        gstNumber: formData.gstNumber,
        notes: formData.notes,
      });
    } else {
      const nextNum = customers.length + 1001;
      const customerId = `${settings.customerPrefix}-${nextNum}`;

      addCustomer({
        customerId,
        name: formData.name,
        type: formData.type,
        companyName: formData.companyName,
        mobile: formData.mobile,
        altMobile: formData.altMobile,
        email: formData.email,
        billingAddress: formData.billingAddress,
        deliveryAddress: formData.deliveryAddress || formData.billingAddress,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
        gstNumber: formData.gstNumber,
        notes: formData.notes,
      });
    }

    setShowAddModal(false);
    resetForm();
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Paginated customers for Customer Master (Requirement 3: rows 10, 20, 50)
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Master</h2>
          <p className="text-xs text-slate-500">
            Maintain customer profiles, corporate accounts, addresses, and tax identifiers
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, name, company, or mobile..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#087BEF] outline-none transition-all"
          />
        </div>

        {/* Segmented Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto">
          {(['all', 'Business', 'Individual'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setTypeFilter(type);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                typeFilter === type
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type === 'all' ? 'All Customers' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Customer Name & Entity</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Active Leases</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No customers match the current search filters.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust) => {
                  const activeCustRentals = rentals.filter(
                    (r) =>
                      r.customerId === cust.customerId &&
                      (r.status === 'Active' || r.status === 'Partially Returned' || r.status === 'Overdue')
                  );

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#073DBB]">
                        {cust.customerId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{cust.name}</div>
                        {cust.companyName && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{cust.companyName}</span>
                          </div>
                        )}
                        {cust.gstNumber && (
                          <div className="text-[10px] text-blue-700 font-mono mt-0.5">
                            GST: {cust.gstNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{cust.mobile}</span>
                        </div>
                        {cust.email && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{cust.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{cust.city}, {cust.state}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {cust.billingAddress}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            cust.type === 'Business'
                              ? 'bg-blue-50 text-[#073DBB]'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {cust.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {activeCustRentals.length > 0 ? (
                          <span className="text-[11px] font-bold text-[#087BEF] bg-blue-50 px-2 py-0.5 rounded">
                            {activeCustRentals.length} active contract(s)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigateToCustomer360(cust.customerId)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] rounded-lg transition-all flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>360°</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(cust)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit customer details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
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

        {/* Bottom Pagination for Customers (Requirement 3: rows 10, 20, 50) */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredCustomers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Customer Create / Edit Modal with Duplicate Validation */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingCustomer ? `Edit Customer (${editingCustomer.customerId})` : 'Register New Customer'}
                </h3>
                <p className="text-xs text-blue-100">
                  Fill in primary contact details, address, and billing information
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {duplicateWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{duplicateWarning}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as 'Individual' | 'Business' })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                  >
                    <option value="Business">Business / Corporate</option>
                    <option value="Individual">Individual / Freelancer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer / Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sundaram"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                  />
                </div>

                {formData.type === 'Business' && (
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Company / Organization Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex InfoTech Solutions Ltd"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Primary Mobile * (Duplicate Checked)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9840212345"
                    value={formData.mobile}
                    onChange={(e) => {
                      setFormData({ ...formData, mobile: e.target.value });
                      checkDuplicate(e.target.value, formData.email);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alternate Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9840212346"
                    value={formData.altMobile}
                    onChange={(e) => setFormData({ ...formData, altMobile: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@apexinfotech.io"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      checkDuplicate(formData.mobile, e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    GSTIN / Tax ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 33AABCA4589K1ZM"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Billing Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Module 4B, 5th Floor, Tidel Park, Taramani"
                    value={formData.billingAddress}
                    onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Delivery / Site Address (Leave blank if same as billing)
                  </label>
                  <input
                    type="text"
                    placeholder="Site delivery address"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 600113"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Special Notes</label>
                  <input
                    type="text"
                    placeholder="Account preferences, credit terms, etc."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#087BEF] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] text-white font-bold rounded-xl shadow-xs transition-all"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
