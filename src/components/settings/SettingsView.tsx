import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle,
  Shield,
  Save,
  Users,
  Plus,
  Edit3,
  Trash2,
  X,
  Lock,
  UserCheck,
  UserX,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CloudTechLogo } from '../common/CloudTechLogo';
import { Pagination } from '../common/Pagination';
import { AuthUser, UserRole } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    auditLogs,
    resetAllData,
    users,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
  } = useApp();

  const isAdmin = currentUser?.role === 'Admin';

  const [formData, setFormData] = useState({
    companyName: settings.companyName,
    brandTagline: settings.brandTagline,
    supportDescriptor: settings.supportDescriptor,
    addressLine1: settings.addressLine1,
    addressLine2: settings.addressLine2,
    city: settings.city,
    state: settings.state,
    pinCode: settings.pinCode,
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
    gstNumber: settings.gstNumber,
    defaultRentalTerms: settings.defaultRentalTerms,
    defaultTaxRate: settings.defaultTaxRate,
    currencySymbol: settings.currencySymbol,
    invoicePrefix: settings.invoicePrefix,
    rentalPrefix: settings.rentalPrefix,
    assetPrefix: settings.assetPrefix,
    customerPrefix: settings.customerPrefix,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'company' | 'billing' | 'users' | 'audit_logs'>('company');

  // Pagination states (10, 20, 50)
  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(10);
  const [userSearch, setUserSearch] = useState('');

  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(10);

  // User Add/Edit modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [userForm, setUserForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department: string;
    phone: string;
    status: 'Active' | 'Inactive';
  }>({
    name: '',
    email: '',
    password: '',
    role: 'Operations Manager',
    department: 'Fleet Operations',
    phone: '',
    status: 'Active',
  });
  const [userError, setUserError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    updateSettings({
      ...formData,
      defaultTaxRate: Number(formData.defaultTaxRate),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (!isAdmin) return;
    if (
      window.confirm(
        'Are you sure you want to reset all data back to the clean initial demo state? All local modifications will be refreshed.'
      )
    ) {
      resetAllData();
      window.location.reload();
    }
  };

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserError(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'Operations Manager',
      department: 'Fleet Operations',
      phone: '+91 ',
      status: 'Active',
    });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u: AuthUser) => {
    setEditingUser(u);
    setUserError(null);
    setUserForm({
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      department: u.department,
      phone: u.phone || '',
      status: u.status,
    });
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);

    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password.trim()) {
      setUserError('Name, work email, and password are required.');
      return;
    }

    const emailExists = users.some(
      (u) => u.email.toLowerCase() === userForm.email.trim().toLowerCase() && u.id !== editingUser?.id
    );
    if (emailExists) {
      setUserError('Another portal account already uses this email address.');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        password: userForm.password,
        role: userForm.role,
        department: userForm.department.trim(),
        phone: userForm.phone.trim(),
        status: userForm.status,
      });
    } else {
      addUser({
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        password: userForm.password,
        role: userForm.role,
        department: userForm.department.trim(),
        phone: userForm.phone.trim(),
        status: userForm.status,
      });
    }
    setShowUserModal(false);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.userId.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (usersPage - 1) * usersPageSize,
    usersPage * usersPageSize
  );

  const paginatedAuditLogs = auditLogs.slice(
    (auditPage - 1) * auditPageSize,
    auditPage * auditPageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            System Configuration & Admin Control
          </h2>
          <p className="text-xs text-slate-500">
            Company profile, GST taxation, portal user roles, default rental terms, and audit logs
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleResetData}
            className="self-start sm:self-auto px-3.5 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Signed in as <strong>{currentUser?.role}</strong>. System configuration, user role provisioning, and demo reset require <strong>Admin</strong> privileges.
          </span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Company settings and billing terms saved successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs w-full sm:w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-3 py-1.5 font-semibold rounded-md transition-all whitespace-nowrap ${
            activeTab === 'company'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Company Profile & Brand
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-3 py-1.5 font-semibold rounded-md transition-all whitespace-nowrap ${
            activeTab === 'billing'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tax, Prefixes & Rental Terms
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#073DBB]" />
            <span>Admin & User Access ({users.length})</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-3 py-1.5 font-semibold rounded-md transition-all whitespace-nowrap ${
            activeTab === 'audit_logs'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Audit Trail Log ({auditLogs.length})
        </button>
      </div>

      {/* Form / Tab Content */}
      {activeTab === 'users' && isAdmin ? (
        <div className="space-y-4">
          {/* Admin Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Total Staff Accounts</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {users.length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">System Administrators</div>
              <div className="text-2xl font-bold text-[#073DBB] mt-1 tabular-nums">
                {users.filter((u) => u.role === 'Admin').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Active Accounts</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
                {users.filter((u) => u.status === 'Active').length}
              </div>
            </div>
          </div>

          {/* Search & Add User Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by User ID, name, email, or role..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUsersPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#087BEF] outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenAddUser}
              className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Portal User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Staff Member & Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                        No portal users match your search.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => {
                      const isSelf = u.id === currentUser?.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#073DBB] whitespace-nowrap">
                            {u.userId}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[10px] font-semibold text-[#073DBB] bg-blue-50 px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                u.role === 'Admin'
                                  ? 'bg-[#073DBB] text-white'
                                  : u.role === 'Operations Manager'
                                  ? 'bg-blue-50 text-[#073DBB]'
                                  : 'bg-cyan-50 text-cyan-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{u.department}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                u.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap tabular-nums">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-IN') : 'Never'}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(u)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              {!isSelf && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateUser(u.id, {
                                        status: u.status === 'Active' ? 'Inactive' : 'Active',
                                      })
                                    }
                                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer ${
                                      u.status === 'Active'
                                        ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                    }`}
                                    title={u.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                                  >
                                    {u.status === 'Active' ? (
                                      <>
                                        <UserX className="w-3 h-3" />
                                        <span>Disable</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="w-3 h-3" />
                                        <span>Enable</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteUser(u.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete User"
                                    aria-label={`Delete user ${u.name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
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
              currentPage={usersPage}
              totalItems={filteredUsers.length}
              pageSize={usersPageSize}
              onPageChange={setUsersPage}
              onPageSizeChange={setUsersPageSize}
            />
          </div>
        </div>
      ) : activeTab === 'audit_logs' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-700">
            System Action Audit Log (BRD Section 11: Rule 20)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Module</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Entity Ref</th>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap tabular-nums">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{log.module}</td>
                    <td className="py-3 px-4 font-bold text-[#073DBB]">{log.action}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{log.entityId}</td>
                    <td className="py-3 px-4 text-slate-600">{log.performedBy}</td>
                    <td className="py-3 px-4 text-slate-700">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={auditPage}
            totalItems={auditLogs.length}
            pageSize={auditPageSize}
            onPageChange={setAuditPage}
            onPageSizeChange={setAuditPageSize}
          />
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6 text-xs">
          {activeTab === 'company' && (
            <div className="space-y-6">
              {/* Brand Guidelines Visual Anchor Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Current Master Visual Identity
                  </div>
                  <div className="mt-2">
                    <CloudTechLogo variant="full" size="md" />
                  </div>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>
                    <strong>Primary Palette:</strong> Deep Royal Blue (#073DBB) & Bright Cyan (#00D5E8)
                  </div>
                  <div>
                    <strong>Accent:</strong> Electric Blue (#087BEF) · Dark Charcoal (#111827)
                  </div>
                  <div>
                    <strong>Typography:</strong> Montserrat ExtraBold & SemiBold
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Company Registered Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Tagline</label>
                  <input
                    type="text"
                    value={formData.brandTagline}
                    onChange={(e) => setFormData({ ...formData, brandTagline: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    GSTIN / Tax Identification *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.gstNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Office Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City & PIN Code</label>
                  <input
                    type="text"
                    value={`${formData.city} - ${formData.pinCode}`}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={formData.invoicePrefix}
                    onChange={(e) =>
                      setFormData({ ...formData, invoicePrefix: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rental Prefix
                  </label>
                  <input
                    type="text"
                    value={formData.rentalPrefix}
                    onChange={(e) =>
                      setFormData({ ...formData, rentalPrefix: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Asset Prefix
                  </label>
                  <input
                    type="text"
                    value={formData.assetPrefix}
                    onChange={(e) =>
                      setFormData({ ...formData, assetPrefix: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Default GST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.defaultTaxRate}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultTaxRate: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default Rental Agreement Terms & Conditions *
                </label>
                <textarea
                  rows={5}
                  value={formData.defaultRentalTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultRentalTerms: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-[#073DBB] to-[#087BEF] hover:from-[#052d8a] hover:to-[#0768ca] text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save System Settings</span>
              </button>
            </div>
          )}
        </form>
      )}

      {/* Add / Edit Portal User Modal */}
      {showUserModal && isAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingUser ? `Edit Portal User (${editingUser.userId})` : 'Add Portal User / Admin'}
                </h3>
                <p className="text-xs text-blue-100">
                  Assign credentials, role access, and account status
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              {userError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl">
                  {userError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="e.g. Meera Krishnan"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="staff@cloudtech.in"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Access Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                    disabled={editingUser?.id === currentUser?.id}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold outline-none disabled:opacity-60"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Operations Manager">Operations Manager</option>
                    <option value="Service Technician">Service Technician</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {editingUser ? 'Account Password *' : 'Temporary Password *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="Set login password"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    placeholder="e.g. Fleet Leases & Billing"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={userForm.status}
                    onChange={(e) =>
                      setUserForm({ ...userForm, status: e.target.value as 'Active' | 'Inactive' })
                    }
                    disabled={editingUser?.id === currentUser?.id}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none disabled:opacity-60"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#073DBB] to-[#087BEF] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingUser ? 'Save Changes' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
