import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { Customer360View } from './components/customer360/Customer360View';
import { CustomersView } from './components/customers/CustomersView';
import { AssetsView } from './components/assets/AssetsView';
import { RentalsView } from './components/rentals/RentalsView';
import { SalesView } from './components/sales/SalesView';
import { ServiceView } from './components/service/ServiceView';
import { InvoicesView } from './components/invoices/InvoicesView';
import { PaymentsView } from './components/payments/PaymentsView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginView } from './components/auth/LoginView';

const MainLayout: React.FC = () => {
  const { currentView, isAuthenticated } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'customer360':
        return <Customer360View />;
      case 'customers':
        return <CustomersView />;
      case 'assets':
        return <AssetsView />;
      case 'rentals':
        return <RentalsView />;
      case 'sales':
        return <SalesView />;
      case 'service':
        return <ServiceView />;
      case 'invoices':
        return <InvoicesView />;
      case 'payments':
        return <PaymentsView />;
      case 'purchases':
        return <PurchasesView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Responsive Header */}
        <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        {/* View Contents */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderView()}
        </main>

        {/* Clean Footer */}
        <footer className="no-print border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#073DBB]">CloudTech</span>
              <span>·</span>
              <span>Laptop & Desktop Business Management System</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Rent · Buy · Service · Enterprise Grade
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
