export type AssetCategory = 'Laptop' | 'Desktop';

export type AssetCondition = 'New' | 'Like New' | 'Good' | 'Fair';

export type AssetStatus =
  | 'Available'
  | 'Rented'
  | 'Returned - Inspection Pending'
  | 'Under Service'
  | 'Damaged'
  | 'Sold'
  | 'Retired';

export interface AssetLifecycleEvent {
  id: string;
  assetId: string;
  timestamp: string;
  eventType:
    | 'Purchased'
    | 'Registered'
    | 'Made Available'
    | 'Rented'
    | 'Rental Extended'
    | 'Returned'
    | 'Inspected'
    | 'Serviced'
    | 'Sold'
    | 'Retired/Damaged';
  details: string;
  performedBy: string;
  referenceId?: string;
}

export interface Asset {
  id: string;
  assetId: string; // e.g. AST-1001
  serialNumber: string;
  category: AssetCategory;
  brand: string;
  model: string;
  processor: string;
  generation: string;
  ram: string;
  storage: string;
  graphics: string;
  screenSize: string;
  os: string;
  condition: AssetCondition;
  accessories: string[];
  warranty: string;
  purchaseDate: string;
  purchasePrice: number;
  purchaseId?: string;
  supplierId?: string;
  supplierName?: string;
  status: AssetStatus;
  currentCustomerId?: string;
  currentCustomerName?: string;
  currentRentalId?: string;
  currentSaleId?: string;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerId: string; // e.g. CUST-1001
  name: string;
  type: 'Individual' | 'Business';
  companyName?: string;
  mobile: string;
  altMobile?: string;
  email: string;
  billingAddress: string;
  deliveryAddress: string;
  city: string;
  state: string;
  pinCode: string;
  gstNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  supplierId: string; // e.g. SUP-101
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  taxDetails: string;
  notes?: string;
  createdAt: string;
}

export interface PurchaseItem {
  assetId: string;
  serialNumber: string;
  category: AssetCategory;
  brand: string;
  model: string;
  processor: string;
  ram: string;
  storage: string;
  unitCost: number;
}

export interface Purchase {
  id: string;
  purchaseId: string; // e.g. PUR-1001
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  supplierInvoiceNumber: string;
  quantity: number;
  unitCost: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalCost: number;
  items: PurchaseItem[];
  invoiceAttachmentName?: string;
  notes?: string;
  createdAt: string;
}

export interface RentalItem {
  assetId: string;
  serialNumber: string;
  category: AssetCategory;
  brand: string;
  model: string;
  rate: number;
  status: 'Active' | 'Returned';
  actualReturnDate?: string;
  inspectionStatus?: 'Pending' | 'Available' | 'Under Service' | 'Damaged';
}

export interface RentalExtension {
  id: string;
  extensionDate: string;
  previousDueDate: string;
  revisedDueDate: string;
  additionalDays: number;
  additionalCharges: number;
  notes: string;
  extendedBy: string;
}

export interface Rental {
  id: string;
  rentalId: string; // e.g. RNT-1001
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  rentalDate: string;
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
  taxAmount: number;
  totalRentalAmount: number;
  terms: string;
  remarks?: string;
  status: 'Active' | 'Partially Returned' | 'Completed' | 'Overdue';
  items: RentalItem[];
  extensions: RentalExtension[];
  invoiceId?: string;
  createdAt: string;
}

export interface RentalReturn {
  id: string;
  returnId: string; // e.g. RET-1001
  rentalId: string;
  customerId: string;
  customerName: string;
  actualReturnDate: string;
  returnedAssetIds: string[];
  returnedCondition: AssetCondition;
  accessoriesReturned: string[];
  missingAccessories?: string[];
  damageNotes?: string;
  lateFees: number;
  repairCharges: number;
  depositAdjustment: number;
  refundAmount: number;
  remarks?: string;
  inspectionStatus: 'Pending Inspection' | 'Completed';
  createdAt: string;
}

export interface SaleItem {
  assetId: string;
  serialNumber: string;
  brand: string;
  model: string;
  category: AssetCategory;
  sellingPrice: number;
}

export interface Sale {
  id: string;
  saleId: string; // e.g. SAL-1001
  customerId: string;
  customerName: string;
  customerMobile: string;
  saleDate: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card';
  paymentStatus: 'Paid' | 'Partial' | 'Pending';
  paidAmount: number;
  balanceDue: number;
  invoiceId?: string;
  remarks?: string;
  createdAt: string;
}

export type ServiceStatus =
  | 'Received'
  | 'Diagnosis Pending'
  | 'Estimate Prepared'
  | 'Customer Approval Pending'
  | 'In Progress'
  | 'Completed'
  | 'Delivered'
  | 'Cancelled';

export interface ServiceRequest {
  id: string;
  serviceId: string; // e.g. SRV-1001
  ownershipType: 'company_owned' | 'customer_owned';
  customerId?: string;
  customerName: string;
  customerPhone: string;
  assetId?: string; // If company owned
  deviceDetails: string;
  serialNumber?: string;
  requestDate: string;
  reportedProblem: string;
  diagnosis?: string;
  serviceType:
    | 'Hardware Repair'
    | 'Screen Replacement'
    | 'OS & Software'
    | 'RAM/SSD Upgrade'
    | 'Motherboard Service'
    | 'General Service & Cleaning';
  technician: string;
  estimate: number;
  actualCost: number;
  status: ServiceStatus;
  completionDate?: string;
  partsReplaced?: string;
  serviceNotes?: string;
  invoiceId?: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  assetId?: string;
  serialNo?: string;
  quantity: number;
  unitRate: number;
  duration?: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-001
  type: 'Rental' | 'Sale' | 'Service' | 'Deposit Receipt';
  date: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  customerGst?: string;
  billingAddress: string;
  relatedTransactionId?: string; // Rental ID, Sales ID, or Service ID
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  securityDeposit: number;
  paidAmount: number;
  balanceDue: number;
  refundableDeposit: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Pending' | 'Overdue';
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentId: string; // e.g. PAY-1001
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  mode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque';
  transactionReference: string;
  paymentType: 'Rental Fee' | 'Sale Payment' | 'Service Fee' | 'Security Deposit' | 'Deposit Refund';
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  brandTagline: string;
  supportDescriptor: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  email: string;
  website: string;
  gstNumber: string;
  defaultRentalTerms: string;
  defaultTaxRate: number;
  currencySymbol: string;
  invoicePrefix: string;
  rentalPrefix: string;
  assetPrefix: string;
  customerPrefix: string;
}

export type UserRole = 'Admin' | 'Operations Manager' | 'Service Technician';

export interface AuthUser {
  id: string;
  userId: string; // e.g. USR-101
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  phone: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  module:
    | 'Auth'
    | 'Assets'
    | 'Customers'
    | 'Rentals'
    | 'Sales'
    | 'Service'
    | 'Invoices'
    | 'Payments'
    | 'Purchases'
    | 'Settings';
  entityId: string;
  performedBy: string;
  details: string;
}
