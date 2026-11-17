import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Asset,
  AssetLifecycleEvent,
  CompanySettings,
  Customer,
  Invoice,
  InvoiceLineItem,
  Payment,
  Purchase,
  Rental,
  RentalReturn,
  Sale,
  ServiceRequest,
  Supplier,
  AuditLog,
  ServiceStatus,
  AssetStatus,
  AuthUser,
  UserRole,
} from '../types';
import {
  initialAssets,
  initialCompanySettings,
  initialCustomers,
  initialInvoices,
  initialLifecycleEvents,
  initialPayments,
  initialPurchases,
  initialRentals,
  initialReturns,
  initialSales,
  initialServiceRequests,
  initialSuppliers,
  initialAuditLogs,
  initialUsers,
} from '../data/initialData';

export type ActiveView =
  | 'dashboard'
  | 'customers'
  | 'customer360'
  | 'assets'
  | 'rentals'
  | 'sales'
  | 'service'
  | 'invoices'
  | 'payments'
  | 'purchases'
  | 'reports'
  | 'settings';

interface AppContextType {
  // State
  assets: Asset[];
  customers: Customer[];
  suppliers: Supplier[];
  purchases: Purchase[];
  rentals: Rental[];
  returns: RentalReturn[];
  sales: Sale[];
  serviceRequests: ServiceRequest[];
  invoices: Invoice[];
  payments: Payment[];
  lifecycleEvents: AssetLifecycleEvent[];
  settings: CompanySettings;
  auditLogs: AuditLog[];
  users: AuthUser[];
  currentUser: AuthUser | null;
  isAuthenticated: boolean;

  // Navigation & selection
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // Actions
  navigateToCustomer360: (customerId: string) => void;
  navigateToAssetDetail: (assetId: string) => void;

  addCustomer: (customerData: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;

  addAsset: (assetData: Omit<Asset, 'id' | 'createdAt'>) => Asset;
  updateAsset: (id: string, updates: Partial<Asset>) => void;

  createRental: (data: {
    customerId: string;
    assetIds: string[];
    startDate: string;
    expectedReturnDate: string;
    rentalFrequency: 'Daily' | 'Weekly' | 'Monthly';
    duration: number;
    durationUnit: 'Days' | 'Weeks' | 'Months';
    ratePerPeriod: number;
    securityDeposit: number;
    advancePaid: number;
    discount: number;
    taxRate: number;
    terms: string;
    remarks?: string;
  }) => Rental;

  extendRental: (
    rentalId: string,
    revisedDueDate: string,
    additionalDays: number,
    additionalCharges: number,
    notes: string
  ) => void;

  returnRentalAssets: (
    rentalId: string,
    returnedAssetIds: string[],
    returnData: {
      actualReturnDate: string;
      returnedCondition: any;
      accessoriesReturned: string[];
      missingAccessories?: string[];
      damageNotes?: string;
      lateFees: number;
      repairCharges: number;
      depositAdjustment: number;
      refundAmount: number;
      remarks?: string;
    }
  ) => RentalReturn;

  inspectAsset: (
    assetId: string,
    nextStatus: 'Available' | 'Under Service' | 'Damaged',
    inspectionNotes: string
  ) => void;

  createSale: (data: {
    customerId: string;
    assetIds: string[];
    saleDate: string;
    sellingPrice: number;
    discount: number;
    taxRate: number;
    paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card';
    paidAmount: number;
    remarks?: string;
  }) => Sale;

  createServiceRequest: (data: {
    ownershipType: 'company_owned' | 'customer_owned';
    customerId?: string;
    customerName: string;
    customerPhone: string;
    assetId?: string;
    deviceDetails: string;
    serialNumber?: string;
    requestDate: string;
    reportedProblem: string;
    serviceType: any;
    technician: string;
    estimate: number;
    serviceNotes?: string;
  }) => ServiceRequest;

  updateServiceStatus: (
    serviceId: string,
    status: ServiceStatus,
    actualCost?: number,
    completionDate?: string,
    partsReplaced?: string,
    serviceNotes?: string,
    nextAssetStatus?: 'Available' | 'Under Service' | 'Damaged'
  ) => void;

  createInvoice: (data: {
    type: 'Rental' | 'Sale' | 'Service' | 'Deposit Receipt';
    customerId: string;
    date: string;
    dueDate: string;
    relatedTransactionId?: string;
    lineItems: Array<{
      description: string;
      assetId?: string;
      serialNo?: string;
      quantity: number;
      unitRate: number;
      duration?: string;
      amount: number;
    }>;
    taxRate: number;
    discount: number;
    securityDeposit?: number;
    notes?: string;
  }) => Invoice;

  recordPayment: (data: {
    invoiceId: string;
    amount: number;
    mode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque';
    transactionReference: string;
    paymentType: 'Rental Fee' | 'Sale Payment' | 'Service Fee' | 'Security Deposit' | 'Deposit Refund';
    notes?: string;
  }) => Payment;

  addPurchase: (data: {
    supplierId: string;
    purchaseDate: string;
    supplierInvoiceNumber: string;
    taxRate: number;
    discount: number;
    notes?: string;
    items: Array<{
      category: 'Laptop' | 'Desktop';
      brand: string;
      model: string;
      serialNumber: string;
      processor: string;
      generation?: string;
      ram: string;
      storage: string;
      graphics?: string;
      screenSize?: string;
      os?: string;
      condition?: any;
      accessories?: string[];
      warranty?: string;
      unitCost: number;
    }>;
  }) => Purchase;

  addSupplier: (data: Omit<Supplier, 'id' | 'createdAt'>) => Supplier;
  updateSettings: (newSettings: Partial<CompanySettings>) => void;
  resetAllData: () => void;

  // Auth & Admin User Management
  login: (email: string, password: string, remember?: boolean) => { success: boolean; message?: string; user?: AuthUser };
  logout: () => void;
  addUser: (userData: Omit<AuthUser, 'id' | 'userId' | 'createdAt'>) => AuthUser;
  updateUser: (id: string, updates: Partial<AuthUser>) => void;
  deleteUser: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or fall back to mock data
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('cloudtech_assets');
    return saved ? JSON.parse(saved) : initialAssets;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('cloudtech_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('cloudtech_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('cloudtech_purchases');
    return saved ? JSON.parse(saved) : initialPurchases;
  });

  const [rentals, setRentals] = useState<Rental[]>(() => {
    const saved = localStorage.getItem('cloudtech_rentals');
    return saved ? JSON.parse(saved) : initialRentals;
  });

  const [returns, setReturns] = useState<RentalReturn[]>(() => {
    const saved = localStorage.getItem('cloudtech_returns');
    return saved ? JSON.parse(saved) : initialReturns;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('cloudtech_sales');
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem('cloudtech_service');
    return saved ? JSON.parse(saved) : initialServiceRequests;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('cloudtech_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('cloudtech_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [lifecycleEvents, setLifecycleEvents] = useState<AssetLifecycleEvent[]>(() => {
    const saved = localStorage.getItem('cloudtech_lifecycle');
    return saved ? JSON.parse(saved) : initialLifecycleEvents;
  });

  const [settings, setSettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('cloudtech_settings');
    return saved ? JSON.parse(saved) : initialCompanySettings;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('cloudtech_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [users, setUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem('cloudtech_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved =
      localStorage.getItem('cloudtech_auth_user') || sessionStorage.getItem('cloudtech_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = Boolean(currentUser);

  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>('CUST-1001');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>('AST-1001');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('cloudtech_assets', JSON.stringify(assets));
  }, [assets]);
  useEffect(() => {
    localStorage.setItem('cloudtech_customers', JSON.stringify(customers));
  }, [customers]);
  useEffect(() => {
    localStorage.setItem('cloudtech_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);
  useEffect(() => {
    localStorage.setItem('cloudtech_purchases', JSON.stringify(purchases));
  }, [purchases]);
  useEffect(() => {
    localStorage.setItem('cloudtech_rentals', JSON.stringify(rentals));
  }, [rentals]);
  useEffect(() => {
    localStorage.setItem('cloudtech_returns', JSON.stringify(returns));
  }, [returns]);
  useEffect(() => {
    localStorage.setItem('cloudtech_sales', JSON.stringify(sales));
  }, [sales]);
  useEffect(() => {
    localStorage.setItem('cloudtech_service', JSON.stringify(serviceRequests));
  }, [serviceRequests]);
  useEffect(() => {
    localStorage.setItem('cloudtech_invoices', JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem('cloudtech_payments', JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem('cloudtech_lifecycle', JSON.stringify(lifecycleEvents));
  }, [lifecycleEvents]);
  useEffect(() => {
    localStorage.setItem('cloudtech_settings', JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem('cloudtech_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem('cloudtech_users', JSON.stringify(users));
  }, [users]);

  const getActorLabel = (userOverride?: AuthUser | null) => {
    const actor = userOverride ?? currentUser;
    return actor ? `${actor.name} (${actor.role})` : 'Admin';
  };

  // Helper log action
  const logAudit = (
    module: AuditLog['module'],
    action: string,
    entityId: string,
    details: string,
    userOverride?: AuthUser | null
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      module,
      entityId,
      performedBy: getActorLabel(userOverride),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addLifecycle = (
    assetId: string,
    eventType: AssetLifecycleEvent['eventType'],
    details: string,
    referenceId?: string
  ) => {
    const newEvent: AssetLifecycleEvent = {
      id: `life-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      assetId,
      timestamp: new Date().toISOString(),
      eventType,
      details,
      performedBy: getActorLabel(),
      referenceId,
    };
    setLifecycleEvents((prev) => [newEvent, ...prev]);
  };

  const navigateToCustomer360 = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCurrentView('customer360');
  };

  const navigateToAssetDetail = (assetId: string) => {
    setSelectedAssetId(assetId);
    setCurrentView('assets');
  };

  // Customers
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newId = `c-${Date.now()}`;
    const newCust: Customer = {
      ...customerData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    logAudit('Customers', 'Customer Created', newCust.customerId, `Customer ${newCust.name} created.`);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id || c.customerId === id ? { ...c, ...updates } : c))
    );
    logAudit('Customers', 'Customer Updated', id, `Updated customer profile information.`);
  };

  // Assets
  const addAsset = (assetData: Omit<Asset, 'id' | 'createdAt'>): Asset => {
    const newId = `ast-${Date.now()}`;
    const newAsset: Asset = {
      ...assetData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setAssets((prev) => [newAsset, ...prev]);
    addLifecycle(newAsset.assetId, 'Registered', `Asset ${newAsset.brand} ${newAsset.model} registered.`);
    if (newAsset.status === 'Available') {
      addLifecycle(newAsset.assetId, 'Made Available', `Device completed intake and marked available for rental/sale.`);
    }
    logAudit('Assets', 'Asset Added', newAsset.assetId, `Registered asset ${newAsset.assetId}`);
    return newAsset;
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === id || a.assetId === id) {
          if (updates.status && updates.status !== a.status) {
            addLifecycle(a.assetId, 'Inspected', `Status updated from ${a.status} to ${updates.status}`);
          }
          return { ...a, ...updates };
        }
        return a;
      })
    );
    logAudit('Assets', 'Asset Updated', id, `Updated asset details`);
  };

  // Rentals
  const createRental = (data: {
    customerId: string;
    assetIds: string[];
    startDate: string;
    expectedReturnDate: string;
    rentalFrequency: 'Daily' | 'Weekly' | 'Monthly';
    duration: number;
    durationUnit: 'Days' | 'Weeks' | 'Months';
    ratePerPeriod: number;
    securityDeposit: number;
    advancePaid: number;
    discount: number;
    taxRate: number;
    terms: string;
    remarks?: string;
  }): Rental => {
    const customer = customers.find((c) => c.customerId === data.customerId || c.id === data.customerId);
    const assignedAssets = assets.filter((a) => data.assetIds.includes(a.assetId));

    const nextNum = rentals.length + 1001;
    const rentalId = `${settings.rentalPrefix}-${nextNum}`;
    const invoiceNumber = `${settings.invoicePrefix}-${String(invoices.length + 1).padStart(3, '0')}`;

    const rentalSubtotal = data.ratePerPeriod * data.duration * data.assetIds.length;
    const taxableSubtotal = Math.max(0, rentalSubtotal - data.discount);
    const taxAmount = (taxableSubtotal * data.taxRate) / 100;
    const totalRentalAmount = taxableSubtotal + taxAmount;

    const rentalItems = assignedAssets.map((asset) => ({
      assetId: asset.assetId,
      serialNumber: asset.serialNumber,
      category: asset.category,
      brand: asset.brand,
      model: asset.model,
      rate: data.ratePerPeriod,
      status: 'Active' as const,
    }));

    const newRental: Rental = {
      id: `rnt-${Date.now()}`,
      rentalId,
      customerId: customer?.customerId || data.customerId,
      customerName: customer ? (customer.type === 'Business' && customer.companyName ? customer.companyName : customer.name) : 'Valued Client',
      customerMobile: customer?.mobile || '',
      customerEmail: customer?.email || '',
      rentalDate: new Date().toISOString().split('T')[0],
      startDate: data.startDate,
      expectedReturnDate: data.expectedReturnDate,
      rentalFrequency: data.rentalFrequency,
      duration: data.duration,
      durationUnit: data.durationUnit,
      ratePerPeriod: data.ratePerPeriod,
      securityDeposit: data.securityDeposit,
      advancePaid: data.advancePaid,
      discount: data.discount,
      taxRate: data.taxRate,
      taxAmount,
      totalRentalAmount,
      terms: data.terms,
      remarks: data.remarks,
      status: 'Active',
      items: rentalItems,
      extensions: [],
      invoiceId: invoiceNumber,
      createdAt: new Date().toISOString(),
    };

    // Update assets to Rented
    setAssets((prev) =>
      prev.map((a) => {
        if (data.assetIds.includes(a.assetId)) {
          return {
            ...a,
            status: 'Rented' as AssetStatus,
            currentCustomerId: newRental.customerId,
            currentCustomerName: newRental.customerName,
            currentRentalId: newRental.rentalId,
          };
        }
        return a;
      })
    );

    // Lifecycle events for all assigned devices
    data.assetIds.forEach((astId) => {
      addLifecycle(
        astId,
        'Rented',
        `Rented to ${newRental.customerName} until ${data.expectedReturnDate} under Rental Agreement ${rentalId}.`,
        rentalId
      );
    });

    // Auto-generate Rental Invoice
    const invoiceLineItems: InvoiceLineItem[] = assignedAssets.map((a) => ({
      id: `li-${Date.now()}-${a.assetId}`,
      description: `${data.rentalFrequency} Rental: ${a.brand} ${a.model} (${a.assetId})`,
      assetId: a.assetId,
      serialNo: a.serialNumber,
      quantity: 1,
      unitRate: data.ratePerPeriod * data.duration,
      duration: `${data.duration} ${data.durationUnit}`,
      amount: data.ratePerPeriod * data.duration,
    }));

    if (data.securityDeposit > 0) {
      invoiceLineItems.push({
        id: `li-dep-${Date.now()}`,
        description: 'Security Deposit (Refundable upon inspection)',
        quantity: 1,
        unitRate: data.securityDeposit,
        duration: 'Escrow',
        amount: data.securityDeposit,
      });
    }

    const totalInvoiceAmount = totalRentalAmount + data.securityDeposit;
    const balanceDue = Math.max(0, totalInvoiceAmount - data.advancePaid);

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      type: 'Rental',
      date: new Date().toISOString().split('T')[0],
      dueDate: data.startDate,
      customerId: newRental.customerId,
      customerName: newRental.customerName,
      customerMobile: newRental.customerMobile,
      customerEmail: newRental.customerEmail,
      customerGst: customer?.gstNumber,
      billingAddress: customer?.billingAddress || '',
      relatedTransactionId: rentalId,
      lineItems: invoiceLineItems,
      subtotal: rentalSubtotal + data.securityDeposit,
      taxRate: data.taxRate,
      taxAmount,
      discount: data.discount,
      total: totalInvoiceAmount,
      securityDeposit: data.securityDeposit,
      paidAmount: data.advancePaid,
      balanceDue,
      refundableDeposit: data.securityDeposit,
      paymentStatus: balanceDue === 0 ? 'Paid' : data.advancePaid > 0 ? 'Partially Paid' : 'Pending',
      notes: `Rental invoice for contract ${rentalId}.`,
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Record advance payment if present
    if (data.advancePaid > 0) {
      const paymentId = `PAY-${payments.length + 1001}`;
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        paymentId,
        invoiceId: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
        customerId: newRental.customerId,
        customerName: newRental.customerName,
        date: new Date().toISOString().split('T')[0],
        amount: data.advancePaid,
        mode: 'Bank Transfer',
        transactionReference: `ADV/${rentalId}`,
        paymentType: data.securityDeposit > 0 ? 'Security Deposit' : 'Rental Fee',
        notes: `Initial advance/deposit for rental ${rentalId}`,
        recordedBy: getActorLabel(),
        createdAt: new Date().toISOString(),
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    setRentals((prev) => [newRental, ...prev]);
    logAudit('Rentals', 'Rental Created', rentalId, `Created rental agreement ${rentalId} for ${assignedAssets.length} devices.`);
    return newRental;
  };

  // Rental Extension
  const extendRental = (
    rentalId: string,
    revisedDueDate: string,
    additionalDays: number,
    additionalCharges: number,
    notes: string
  ) => {
    setRentals((prev) =>
      prev.map((r) => {
        if (r.rentalId === rentalId) {
          const extension = {
            id: `ext-${Date.now()}`,
            extensionDate: new Date().toISOString().split('T')[0],
            previousDueDate: r.expectedReturnDate,
            revisedDueDate,
            additionalDays,
            additionalCharges,
            notes,
            extendedBy: getActorLabel(),
          };

          // Log lifecycle event for each active asset
          r.items
            .filter((item) => item.status === 'Active')
            .forEach((item) => {
              addLifecycle(
                item.assetId,
                'Rental Extended',
                `Rental extended from ${r.expectedReturnDate} to ${revisedDueDate}. ${notes}`,
                rentalId
              );
            });

          return {
            ...r,
            expectedReturnDate: revisedDueDate,
            totalRentalAmount: r.totalRentalAmount + additionalCharges,
            extensions: [...r.extensions, extension],
            status: 'Active',
          };
        }
        return r;
      })
    );
    logAudit('Rentals', 'Rental Extended', rentalId, `Extended rental to ${revisedDueDate}. Charges: ₹${additionalCharges}`);
  };

  // Return Rental Assets (supports Partial Returns!)
  const returnRentalAssets = (
    rentalId: string,
    returnedAssetIds: string[],
    returnData: {
      actualReturnDate: string;
      returnedCondition: any;
      accessoriesReturned: string[];
      missingAccessories?: string[];
      damageNotes?: string;
      lateFees: number;
      repairCharges: number;
      depositAdjustment: number;
      refundAmount: number;
      remarks?: string;
    }
  ): RentalReturn => {
    const returnId = `RET-${returns.length + 1001}`;
    const rental = rentals.find((r) => r.rentalId === rentalId);

    const newReturn: RentalReturn = {
      id: `ret-${Date.now()}`,
      returnId,
      rentalId,
      customerId: rental?.customerId || '',
      customerName: rental?.customerName || '',
      actualReturnDate: returnData.actualReturnDate,
      returnedAssetIds,
      returnedCondition: returnData.returnedCondition,
      accessoriesReturned: returnData.accessoriesReturned,
      missingAccessories: returnData.missingAccessories,
      damageNotes: returnData.damageNotes,
      lateFees: returnData.lateFees,
      repairCharges: returnData.repairCharges,
      depositAdjustment: returnData.depositAdjustment,
      refundAmount: returnData.refundAmount,
      remarks: returnData.remarks,
      inspectionStatus: 'Pending Inspection',
      createdAt: new Date().toISOString(),
    };

    setReturns((prev) => [newReturn, ...prev]);

    // Update assets to 'Returned - Inspection Pending'
    setAssets((prev) =>
      prev.map((a) => {
        if (returnedAssetIds.includes(a.assetId)) {
          return {
            ...a,
            status: 'Returned - Inspection Pending' as AssetStatus,
            condition: returnData.returnedCondition,
          };
        }
        return a;
      })
    );

    // Lifecycle events
    returnedAssetIds.forEach((astId) => {
      addLifecycle(
        astId,
        'Returned',
        `Returned by ${rental?.customerName || 'customer'} under Return ID ${returnId}. Condition: ${returnData.returnedCondition}. Moved to Inspection Pending.`,
        returnId
      );
    });

    // Update rental item status and overall rental status
    setRentals((prev) =>
      prev.map((r) => {
        if (r.rentalId === rentalId) {
          const updatedItems = r.items.map((item) => {
            if (returnedAssetIds.includes(item.assetId)) {
              return {
                ...item,
                status: 'Returned' as const,
                actualReturnDate: returnData.actualReturnDate,
                inspectionStatus: 'Pending' as const,
              };
            }
            return item;
          });

          const allReturned = updatedItems.every((item) => item.status === 'Returned');
          return {
            ...r,
            items: updatedItems,
            status: allReturned ? 'Completed' : 'Partially Returned',
          };
        }
        return r;
      })
    );

    // Record deposit refund payment if applicable
    if (returnData.refundAmount > 0) {
      const payId = `PAY-${payments.length + 1001}`;
      const refundPayment: Payment = {
        id: `pay-${Date.now()}`,
        paymentId: payId,
        invoiceId: rental?.invoiceId || '',
        invoiceNumber: rental?.invoiceId || '',
        customerId: rental?.customerId || '',
        customerName: rental?.customerName || '',
        date: returnData.actualReturnDate,
        amount: returnData.refundAmount,
        mode: 'Bank Transfer',
        transactionReference: `REFUND/${returnId}`,
        paymentType: 'Deposit Refund',
        notes: `Security deposit refund of ₹${returnData.refundAmount} after return inspection adjustments.`,
        recordedBy: getActorLabel(),
        createdAt: new Date().toISOString(),
      };
      setPayments((prev) => [refundPayment, ...prev]);
    }

    logAudit(
      'Rentals',
      'Assets Returned',
      returnId,
      `Returned ${returnedAssetIds.length} assets from rental ${rentalId}. Moved to Inspection Pending.`
    );

    return newReturn;
  };

  // Inspection flow
  const inspectAsset = (
    assetId: string,
    nextStatus: 'Available' | 'Under Service' | 'Damaged',
    inspectionNotes: string
  ) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.assetId === assetId) {
          return {
            ...a,
            status: nextStatus,
            currentCustomerId: nextStatus === 'Available' ? undefined : a.currentCustomerId,
            currentCustomerName: nextStatus === 'Available' ? undefined : a.currentCustomerName,
            currentRentalId: nextStatus === 'Available' ? undefined : a.currentRentalId,
            notes: inspectionNotes ? `${a.notes || ''} | Inspection: ${inspectionNotes}` : a.notes,
          };
        }
        return a;
      })
    );

    // Update return records inspection status
    setReturns((prev) =>
      prev.map((ret) => {
        if (ret.returnedAssetIds.includes(assetId)) {
          return {
            ...ret,
            inspectionStatus: 'Completed',
          };
        }
        return ret;
      })
    );

    addLifecycle(
      assetId,
      'Inspected',
      `Technical inspection completed. Disposition: Marked as ${nextStatus}. Notes: ${inspectionNotes || 'All checklist tests passed.'}`
    );

    logAudit('Assets', 'Inspection Completed', assetId, `Inspected device ${assetId} -> ${nextStatus}`);
  };

  // Sales
  const createSale = (data: {
    customerId: string;
    assetIds: string[];
    saleDate: string;
    sellingPrice: number;
    discount: number;
    taxRate: number;
    paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card';
    paidAmount: number;
    remarks?: string;
  }): Sale => {
    const customer = customers.find((c) => c.customerId === data.customerId || c.id === data.customerId);
    const soldAssets = assets.filter((a) => data.assetIds.includes(a.assetId));

    const saleId = `SAL-${sales.length + 1001}`;
    const invoiceNumber = `${settings.invoicePrefix}-${String(invoices.length + 1).padStart(3, '0')}`;

    const subtotal = data.sellingPrice;
    const taxableAmount = Math.max(0, subtotal - data.discount);
    const taxAmount = (taxableAmount * data.taxRate) / 100;
    const totalAmount = taxableAmount + taxAmount;
    const balanceDue = Math.max(0, totalAmount - data.paidAmount);

    const saleItems = soldAssets.map((asset) => ({
      assetId: asset.assetId,
      serialNumber: asset.serialNumber,
      brand: asset.brand,
      model: asset.model,
      category: asset.category,
      sellingPrice: data.sellingPrice / data.assetIds.length,
    }));

    const newSale: Sale = {
      id: `sal-${Date.now()}`,
      saleId,
      customerId: customer?.customerId || data.customerId,
      customerName: customer ? (customer.type === 'Business' && customer.companyName ? customer.companyName : customer.name) : 'Customer',
      customerMobile: customer?.mobile || '',
      saleDate: data.saleDate,
      items: saleItems,
      subtotal,
      discount: data.discount,
      taxRate: data.taxRate,
      taxAmount,
      totalAmount,
      paymentMode: data.paymentMode,
      paymentStatus: balanceDue === 0 ? 'Paid' : data.paidAmount > 0 ? 'Partial' : 'Pending',
      paidAmount: data.paidAmount,
      balanceDue,
      invoiceId: invoiceNumber,
      remarks: data.remarks,
      createdAt: new Date().toISOString(),
    };

    // Update assets to Sold
    setAssets((prev) =>
      prev.map((a) => {
        if (data.assetIds.includes(a.assetId)) {
          return {
            ...a,
            status: 'Sold' as AssetStatus,
            currentCustomerId: newSale.customerId,
            currentCustomerName: newSale.customerName,
            currentSaleId: saleId,
          };
        }
        return a;
      })
    );

    // Lifecycle events
    data.assetIds.forEach((astId) => {
      addLifecycle(
        astId,
        'Sold',
        `Sold to ${newSale.customerName} for ₹${data.sellingPrice.toLocaleString()} under Sales ID ${saleId}.`,
        saleId
      );
    });

    // Generate Sales Invoice
    const lineItems = soldAssets.map((a) => ({
      id: `li-sal-${a.assetId}`,
      description: `Outright Purchase: ${a.brand} ${a.model} (${a.assetId})`,
      assetId: a.assetId,
      serialNo: a.serialNumber,
      quantity: 1,
      unitRate: data.sellingPrice / data.assetIds.length,
      amount: data.sellingPrice / data.assetIds.length,
    }));

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      type: 'Sale',
      date: data.saleDate,
      dueDate: data.saleDate,
      customerId: newSale.customerId,
      customerName: newSale.customerName,
      customerMobile: newSale.customerMobile,
      customerEmail: customer?.email || '',
      customerGst: customer?.gstNumber,
      billingAddress: customer?.billingAddress || '',
      relatedTransactionId: saleId,
      lineItems,
      subtotal,
      taxRate: data.taxRate,
      taxAmount,
      discount: data.discount,
      total: totalAmount,
      securityDeposit: 0,
      paidAmount: data.paidAmount,
      balanceDue,
      refundableDeposit: 0,
      paymentStatus: balanceDue === 0 ? 'Paid' : data.paidAmount > 0 ? 'Partially Paid' : 'Pending',
      notes: `Outright purchase invoice for ${saleId}.`,
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    if (data.paidAmount > 0) {
      const payId = `PAY-${payments.length + 1001}`;
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        paymentId: payId,
        invoiceId: newInvoice.id,
        invoiceNumber,
        customerId: newSale.customerId,
        customerName: newSale.customerName,
        date: data.saleDate,
        amount: data.paidAmount,
        mode: data.paymentMode,
        transactionReference: `SALE/${saleId}`,
        paymentType: 'Sale Payment',
        notes: `Payment for Sale ${saleId}`,
        recordedBy: getActorLabel(),
        createdAt: new Date().toISOString(),
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    setSales((prev) => [newSale, ...prev]);
    logAudit('Sales', 'Asset Sold', saleId, `Sold ${data.assetIds.length} assets to ${newSale.customerName}.`);
    return newSale;
  };

  // Service Requests
  const createServiceRequest = (data: {
    ownershipType: 'company_owned' | 'customer_owned';
    customerId?: string;
    customerName: string;
    customerPhone: string;
    assetId?: string;
    deviceDetails: string;
    serialNumber?: string;
    requestDate: string;
    reportedProblem: string;
    serviceType: any;
    technician: string;
    estimate: number;
    serviceNotes?: string;
  }): ServiceRequest => {
    const serviceId = `SRV-${serviceRequests.length + 1001}`;
    const newService: ServiceRequest = {
      id: `srv-${Date.now()}`,
      serviceId,
      ownershipType: data.ownershipType,
      customerId: data.customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      assetId: data.assetId,
      deviceDetails: data.deviceDetails,
      serialNumber: data.serialNumber,
      requestDate: data.requestDate,
      reportedProblem: data.reportedProblem,
      serviceType: data.serviceType,
      technician: data.technician,
      estimate: data.estimate,
      actualCost: 0,
      status: 'Received',
      serviceNotes: data.serviceNotes,
      createdAt: new Date().toISOString(),
    };

    if (data.ownershipType === 'company_owned' && data.assetId) {
      setAssets((prev) =>
        prev.map((a) => (a.assetId === data.assetId ? { ...a, status: 'Under Service' as AssetStatus } : a))
      );
      addLifecycle(
        data.assetId,
        'Serviced',
        `Initiated service ticket ${serviceId}: ${data.reportedProblem}. Marked as Under Service.`,
        serviceId
      );
    }

    setServiceRequests((prev) => [newService, ...prev]);
    logAudit('Service', 'Service Ticket Created', serviceId, `Created service ticket for ${data.customerName}`);
    return newService;
  };

  const updateServiceStatus = (
    serviceId: string,
    status: ServiceStatus,
    actualCost?: number,
    completionDate?: string,
    partsReplaced?: string,
    serviceNotes?: string,
    nextAssetStatus?: 'Available' | 'Under Service' | 'Damaged'
  ) => {
    setServiceRequests((prev) =>
      prev.map((srv) => {
        if (srv.serviceId === serviceId) {
          const updated: ServiceRequest = {
            ...srv,
            status,
            actualCost: actualCost !== undefined ? actualCost : srv.actualCost,
            completionDate: completionDate || srv.completionDate,
            partsReplaced: partsReplaced || srv.partsReplaced,
            serviceNotes: serviceNotes || srv.serviceNotes,
          };

          // If company owned asset, update asset status when completed
          if (srv.ownershipType === 'company_owned' && srv.assetId && nextAssetStatus) {
            setAssets((aPrev) =>
              aPrev.map((a) =>
                a.assetId === srv.assetId ? { ...a, status: nextAssetStatus } : a
              )
            );
            addLifecycle(
              srv.assetId,
              'Serviced',
              `Service ticket ${serviceId} moved to ${status}. Final asset status: ${nextAssetStatus}. Cost: ₹${actualCost || srv.actualCost}`,
              serviceId
            );
          }

          return updated;
        }
        return srv;
      })
    );
    logAudit('Service', 'Service Status Updated', serviceId, `Updated status to ${status}`);
  };

  // Invoices & Payments
  const createInvoice = (data: {
    type: 'Rental' | 'Sale' | 'Service' | 'Deposit Receipt';
    customerId: string;
    date: string;
    dueDate: string;
    relatedTransactionId?: string;
    lineItems: Array<{
      description: string;
      assetId?: string;
      serialNo?: string;
      quantity: number;
      unitRate: number;
      duration?: string;
      amount: number;
    }>;
    taxRate: number;
    discount: number;
    securityDeposit?: number;
    notes?: string;
  }): Invoice => {
    const customer = customers.find((c) => c.customerId === data.customerId || c.id === data.customerId);
    const invoiceNumber = `${settings.invoicePrefix}-${String(invoices.length + 1).padStart(3, '0')}`;

    const subtotal = data.lineItems.reduce((acc, item) => acc + item.amount, 0);
    const taxableAmount = Math.max(0, subtotal - data.discount);
    const taxAmount = (taxableAmount * data.taxRate) / 100;
    const securityDeposit = data.securityDeposit || 0;
    const total = taxableAmount + taxAmount + securityDeposit;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      type: data.type,
      date: data.date,
      dueDate: data.dueDate,
      customerId: customer?.customerId || data.customerId,
      customerName: customer ? (customer.type === 'Business' && customer.companyName ? customer.companyName : customer.name) : 'Customer',
      customerMobile: customer?.mobile || '',
      customerEmail: customer?.email || '',
      customerGst: customer?.gstNumber,
      billingAddress: customer?.billingAddress || '',
      relatedTransactionId: data.relatedTransactionId,
      lineItems: data.lineItems.map((item, idx) => ({ ...item, id: `li-${Date.now()}-${idx}` })),
      subtotal,
      taxRate: data.taxRate,
      taxAmount,
      discount: data.discount,
      total,
      securityDeposit,
      paidAmount: 0,
      balanceDue: total,
      refundableDeposit: securityDeposit,
      paymentStatus: 'Pending',
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    logAudit('Invoices', 'Invoice Created', invoiceNumber, `Created ${data.type} invoice for ${newInvoice.customerName}`);
    return newInvoice;
  };

  const recordPayment = (data: {
    invoiceId: string;
    amount: number;
    mode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque';
    transactionReference: string;
    paymentType: 'Rental Fee' | 'Sale Payment' | 'Service Fee' | 'Security Deposit' | 'Deposit Refund';
    notes?: string;
  }): Payment => {
    const invoice = invoices.find((inv) => inv.id === data.invoiceId || inv.invoiceNumber === data.invoiceId);
    const paymentId = `PAY-${payments.length + 1001}`;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      paymentId,
      invoiceId: invoice?.id || data.invoiceId,
      invoiceNumber: invoice?.invoiceNumber || data.invoiceId,
      customerId: invoice?.customerId || '',
      customerName: invoice?.customerName || '',
      date: new Date().toISOString().split('T')[0],
      amount: data.amount,
      mode: data.mode,
      transactionReference: data.transactionReference,
      paymentType: data.paymentType,
      notes: data.notes,
      recordedBy: getActorLabel(),
      createdAt: new Date().toISOString(),
    };

    // Update invoice balance
    if (invoice) {
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === invoice.id) {
            const newPaid = inv.paidAmount + data.amount;
            const newBalance = Math.max(0, inv.total - newPaid);
            return {
              ...inv,
              paidAmount: newPaid,
              balanceDue: newBalance,
              paymentStatus: newBalance === 0 ? 'Paid' : 'Partially Paid',
            };
          }
          return inv;
        })
      );
    }

    setPayments((prev) => [newPayment, ...prev]);
    logAudit('Payments', 'Payment Recorded', paymentId, `Recorded payment ₹${data.amount} for ${invoice?.invoiceNumber}`);
    return newPayment;
  };

  // Purchases & Supplier Asset Intake
  const addPurchase = (data: {
    supplierId: string;
    purchaseDate: string;
    supplierInvoiceNumber: string;
    taxRate: number;
    discount: number;
    notes?: string;
    items: Array<{
      category: 'Laptop' | 'Desktop';
      brand: string;
      model: string;
      serialNumber: string;
      processor: string;
      generation?: string;
      ram: string;
      storage: string;
      graphics?: string;
      screenSize?: string;
      os?: string;
      condition?: any;
      accessories?: string[];
      warranty?: string;
      unitCost: number;
    }>;
  }): Purchase => {
    const supplier = suppliers.find((s) => s.supplierId === data.supplierId || s.id === data.supplierId);
    const purchaseId = `PUR-${purchases.length + 1001}`;

    const subtotal = data.items.reduce((acc, i) => acc + i.unitCost, 0);
    const taxableSubtotal = Math.max(0, subtotal - data.discount);
    const taxAmount = (taxableSubtotal * data.taxRate) / 100;
    const totalCost = taxableSubtotal + taxAmount;

    // Create physical assets automatically
    let currentAssetCount = assets.length;
    const createdItems = data.items.map((item) => {
      currentAssetCount++;
      const assetId = `${settings.assetPrefix}-${1000 + currentAssetCount}`;
      const newAsset: Asset = {
        id: `ast-${Date.now()}-${currentAssetCount}`,
        assetId,
        serialNumber: item.serialNumber,
        category: item.category,
        brand: item.brand,
        model: item.model,
        processor: item.processor,
        generation: item.generation || 'Latest',
        ram: item.ram,
        storage: item.storage,
        graphics: item.graphics || 'Integrated Graphics',
        screenSize: item.screenSize || (item.category === 'Laptop' ? '14.0" FHD' : '24" Display'),
        os: item.os || 'Windows 11 Pro',
        condition: item.condition || 'New',
        accessories: item.accessories || ['Power Adapter'],
        warranty: item.warranty || '1 Year Standard',
        purchaseDate: data.purchaseDate,
        purchasePrice: item.unitCost,
        purchaseId,
        supplierId: supplier?.supplierId || data.supplierId,
        supplierName: supplier?.name || 'Authorized Vendor',
        status: 'Available',
        createdAt: new Date().toISOString(),
      };

      // Add lifecycle records
      addLifecycle(
        assetId,
        'Purchased',
        `Procured from ${supplier?.name} under Supplier Invoice #${data.supplierInvoiceNumber}. Unit Cost: ₹${item.unitCost.toLocaleString()}`,
        purchaseId
      );
      addLifecycle(assetId, 'Registered', `Registered asset ${assetId} with Serial ${item.serialNumber}.`);
      addLifecycle(assetId, 'Made Available', `Intake verification passed. Device marked available.`);

      return {
        asset: newAsset,
        purchaseItem: {
          assetId,
          serialNumber: item.serialNumber,
          category: item.category,
          brand: item.brand,
          model: item.model,
          processor: item.processor,
          ram: item.ram,
          storage: item.storage,
          unitCost: item.unitCost,
        },
      };
    });

    const newAssets = createdItems.map((ci) => ci.asset);
    setAssets((prev) => [...newAssets, ...prev]);

    const newPurchase: Purchase = {
      id: `pur-${Date.now()}`,
      purchaseId,
      supplierId: supplier?.supplierId || data.supplierId,
      supplierName: supplier?.name || 'Vendor',
      purchaseDate: data.purchaseDate,
      supplierInvoiceNumber: data.supplierInvoiceNumber,
      quantity: data.items.length,
      unitCost: subtotal / (data.items.length || 1),
      taxRate: data.taxRate,
      taxAmount,
      discount: data.discount,
      totalCost,
      items: createdItems.map((ci) => ci.purchaseItem),
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    setPurchases((prev) => [newPurchase, ...prev]);
    logAudit(
      'Purchases',
      'Purchase Intake Recorded',
      purchaseId,
      `Intake of ${data.items.length} assets from ${supplier?.name}. Automatically created new asset records.`
    );
    return newPurchase;
  };

  const addSupplier = (data: Omit<Supplier, 'id' | 'createdAt'>): Supplier => {
    const newId = `sup-${Date.now()}`;
    const newSupplier: Supplier = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    logAudit('Purchases', 'Supplier Added', newSupplier.supplierId, `Added supplier ${newSupplier.name}`);
    return newSupplier;
  };

  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAudit('Settings', 'Settings Updated', 'CONFIG', 'Company settings updated.');
  };

  const login = (email: string, password: string, remember = true) => {
    const normalizedEmail = email.trim().toLowerCase();
    const matched = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!matched) {
      return { success: false, message: 'No portal account found for this email address.' };
    }
    if (matched.password !== password) {
      return { success: false, message: 'Incorrect password. Please verify and try again.' };
    }
    if (matched.status !== 'Active') {
      return {
        success: false,
        message: 'This account is currently deactivated. Contact a system administrator.',
      };
    }

    const updatedUser: AuthUser = {
      ...matched,
      lastLogin: new Date().toISOString(),
    };

    setUsers((prev) => prev.map((u) => (u.id === matched.id ? updatedUser : u)));
    setCurrentUser(updatedUser);

    if (remember) {
      localStorage.setItem('cloudtech_auth_user', JSON.stringify(updatedUser));
      sessionStorage.removeItem('cloudtech_auth_user');
    } else {
      sessionStorage.setItem('cloudtech_auth_user', JSON.stringify(updatedUser));
      localStorage.removeItem('cloudtech_auth_user');
    }

    logAudit(
      'Auth',
      'User Signed In',
      updatedUser.userId,
      `${updatedUser.name} (${updatedUser.role}) authenticated into CloudTech Portal.`,
      updatedUser
    );

    // Route technician directly to dashboard or service, standard default dashboard
    setCurrentView('dashboard');

    return { success: true, user: updatedUser };
  };

  const logout = () => {
    if (currentUser) {
      logAudit(
        'Auth',
        'User Signed Out',
        currentUser.userId,
        `${currentUser.name} (${currentUser.role}) signed out.`
      );
    }
    setCurrentUser(null);
    localStorage.removeItem('cloudtech_auth_user');
    sessionStorage.removeItem('cloudtech_auth_user');
  };

  const addUser = (userData: Omit<AuthUser, 'id' | 'userId' | 'createdAt'>): AuthUser => {
    const nextNum = users.length + 101;
    const newUser: AuthUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      userId: `USR-${nextNum}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    logAudit(
      'Settings',
      'Portal User Created',
      newUser.userId,
      `Created ${newUser.role} account for ${newUser.name} (${newUser.email}).`
    );
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<AuthUser>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const nextUser = { ...u, ...updates };
        if (currentUser?.id === id) {
          setCurrentUser(nextUser);
          if (localStorage.getItem('cloudtech_auth_user')) {
            localStorage.setItem('cloudtech_auth_user', JSON.stringify(nextUser));
          } else if (sessionStorage.getItem('cloudtech_auth_user')) {
            sessionStorage.setItem('cloudtech_auth_user', JSON.stringify(nextUser));
          }
        }
        return nextUser;
      })
    );
    logAudit('Settings', 'Portal User Updated', id, 'Updated user role, credentials, or account status.');
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target || target.id === currentUser?.id) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logAudit(
      'Settings',
      'Portal User Removed',
      target.userId,
      `Removed account ${target.name} (${target.email}).`
    );
  };

  const resetAllData = () => {
    setAssets(initialAssets);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setPurchases(initialPurchases);
    setRentals(initialRentals);
    setReturns(initialReturns);
    setSales(initialSales);
    setServiceRequests(initialServiceRequests);
    setInvoices(initialInvoices);
    setPayments(initialPayments);
    setLifecycleEvents(initialLifecycleEvents);
    setSettings(initialCompanySettings);
    setAuditLogs(initialAuditLogs);
    setUsers(initialUsers);
    setCurrentUser(null);
    localStorage.clear();
    sessionStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        assets,
        customers,
        suppliers,
        purchases,
        rentals,
        returns,
        sales,
        serviceRequests,
        invoices,
        payments,
        lifecycleEvents,
        settings,
        auditLogs,
        users,
        currentUser,
        isAuthenticated,
        currentView,
        setCurrentView,
        selectedCustomerId,
        setSelectedCustomerId,
        selectedAssetId,
        setSelectedAssetId,
        globalSearch,
        setGlobalSearch,
        navigateToCustomer360,
        navigateToAssetDetail,
        addCustomer,
        updateCustomer,
        addAsset,
        updateAsset,
        createRental,
        extendRental,
        returnRentalAssets,
        inspectAsset,
        createSale,
        createServiceRequest,
        updateServiceStatus,
        createInvoice,
        recordPayment,
        addPurchase,
        addSupplier,
        updateSettings,
        resetAllData,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
