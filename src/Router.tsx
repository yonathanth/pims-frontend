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
import Notifications from './pages/Notifications';
import Dashboard from './pages/dashboard/pages/Dashboard';
import InventoryList from './pages/inventory/pages/InventoryList';
import SuppliersPage from './pages/SuppliersPage';
import EmployeesPage from './pages/EmployeesPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import UnitTypesPage from './pages/UnitTypesPage';
import LocationsPage from './pages/LocationsPage';
import OrdersPage from './pages/OrdersPage';
import ReportGenerationPage from './pages/ReportGenerationPage';
import AuditLogPage from './pages/AuditLogPage';
import TransactionsPage from './pages/TransactionsPage';
import Analytics from './pages/analytics/Analytics';
import SettingsPage from './pages/settingpage';
import OnboardingWelcome from './pages/onboarding/OnboardingWelcome.tsx';
import Step0 from './pages/onboarding/steps/pages/Step0';
import Step2 from './pages/onboarding/steps/pages/Step2';
import CashierPage from './pages/CashierPage';
import SalesPage from './pages/SalesPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

export default function AppRouter() {
  const [setupStatus, setSetupStatus] = useState<{
    initialized: boolean;
    hasUser: boolean;
    hasAdminUser: boolean;
    setupComplete: boolean;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const status = await authStatus();
        setSetupStatus({
          initialized: status.initialized,
          hasUser: status.hasUser,
          hasAdminUser: status.hasAdminUser,
          setupComplete: status.setupComplete,
        });
      } catch {
        // If we can't get status, assume system is initialized to avoid setup loop
        setSetupStatus({
          initialized: true,
          hasUser: true,
          hasAdminUser: true,
          setupComplete: true,
        });
      }
    })();
  }, []);

  if (setupStatus === null) {
    // Show loading state instead of blank screen
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  function RoleLanding() {
    const { session } = useAuth();
    const role = session?.user?.role;
    if (role === 'SELLER') return <Navigate to="/dashboard/cashier" replace />;
    if (role === 'PHARMACIST')
      return <Navigate to="/dashboard/inventory" replace />;
    // Admin and Manager (and any other roles) go to admin dashboard
    return <Navigate to="/dashboard/admin" replace />;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            setupStatus.hasAdminUser ? (
              <Navigate to="/login" replace />
            ) : (
              <OnboardingWelcome />
            )
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding/step0" element={<Step0 />} />
        <Route path="/onboarding/step1" element={<Step1 />} />
        <Route path="/onboarding/step2" element={<Step2 />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={['ADMIN', 'MANAGER', 'PHARMACIST', 'SELLER']}
              fallbackPath="/login"
            >
              <RoleLanding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute
              allowedRoles={['ADMIN', 'MANAGER']}
              fallbackPath="/dashboard"
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/inventory"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'PHARMACIST']}>
              <InventoryList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/suppliers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <SuppliersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/employees"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'PHARMACIST']}>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/orders"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/locations"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'PHARMACIST']}>
              <LocationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <ReportGenerationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/audit"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/transactions"
          element={
            <ProtectedRoute
              allowedRoles={['ADMIN', 'MANAGER', 'PHARMACIST']}
            >
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/categories"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'PHARMACIST']}>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/unit-types"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'PHARMACIST']}>
              <UnitTypesPage />
            </ProtectedRoute>
          }
        />
        {/* Redirect old routes to new ones for backward compatibility */}
        <Route
          path="/dashboard/seller"
          element={<Navigate to="/dashboard/cashier" replace />}
        />
        <Route
          path="/dashboard/sales-products"
          element={<Navigate to="/dashboard/sales" replace />}
        />
        <Route
          path="/dashboard/cashier"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SELLER']}>
              <CashierPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/sales"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'PHARMACIST', 'SELLER']}>
              <SalesPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
