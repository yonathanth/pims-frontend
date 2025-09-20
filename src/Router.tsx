import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authStatus } from './api/auth';
// import OnboardingWelcome from "./pages/onboarding/OnboardingWelcome";
import LoginPage from './pages/LoginPage';
import Step1 from './pages/onboarding/steps/pages/Step1';
import Step2 from './pages/onboarding/steps/pages/Step2';
import Notifications from './pages/Notifications';
import Step3 from './pages/onboarding/steps/pages/Step3';
import Dashboard from './pages/dashboard/pages/Dashboard';
import InventoryList from './pages/inventory/pages/InventoryList';
import SuppliersPage from './pages/SuppliersPage';
import EmployeesPage from './pages/EmployeesPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import LocationsPage from './pages/LocationsPage';
import OrdersPage from './pages/OrdersPage';
import ReportGenerationPage from './pages/ReportGenerationPage';
import AuditLogPage from './pages/AuditLogPage';
import TransactionsPage from './pages/TransactionsPage';
import Analytics from './pages/analytics/Analytics';
import SettingsPage from './pages/settingpage';
import OnboardingWelcome from './pages/onboarding/OnboardingWelcome.tsx';
import SellerPage from './pages/SellerPage';

export default function AppRouter() {
  const [setupStatus, setSetupStatus] = useState<{
    initialized: boolean;
    hasUser: boolean;
    setupComplete: boolean;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const status = await authStatus();
        setSetupStatus({
          initialized: status.initialized,
          hasUser: status.hasUser,
          setupComplete: status.setupComplete,
        });
      } catch {
        // If we can't get status, assume system is initialized to avoid setup loop
        setSetupStatus({
          initialized: true,
          hasUser: true,
          setupComplete: true,
        });
      }
    })();
  }, []);

  if (setupStatus === null) return null;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            setupStatus.initialized ? (
              <Navigate to="/login" replace />
            ) : (
              <OnboardingWelcome />
            )
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding/step1" element={<Step1 />} />
        <Route path="/onboarding/step2" element={<Step2 />} />
        <Route path="/onboarding/step3" element={<Step3 />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/home" element={<Dashboard />} />
        <Route path="/dashboard/inventory" element={<InventoryList />} />
        <Route path="/dashboard/suppliers" element={<SuppliersPage />} />
        <Route path="/dashboard/employees" element={<EmployeesPage />} />
        <Route path="/dashboard/products" element={<ProductsPage />} />
        <Route path="/dashboard/orders" element={<OrdersPage />} />
        <Route path="/dashboard/locations" element={<LocationsPage />} />
        <Route path="/dashboard/reports" element={<ReportGenerationPage />} />
        <Route path="/dashboard/audit" element={<AuditLogPage />} />
        <Route path="/dashboard/transactions" element={<TransactionsPage />} />
        <Route path="/dashboard/analytics" element={<Analytics />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/dashboard/categories" element={<CategoriesPage />} />
        <Route path="/dashboard/seller" element={<SellerPage />} />
      </Routes>
    </Router>
  );
}
