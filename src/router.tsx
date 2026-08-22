import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { GuestRoute } from './components/layout/GuestRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PeriodsSettingsPage } from './pages/settings/PeriodsSettingsPage';
import { AccountsPage } from './pages/accounts/AccountsPage';
import { CategoriesPage } from './pages/categories/CategoriesPage';
import { TagsPage } from './pages/tags/TagsPage';
import { BudgetsPage } from './pages/budgets/BudgetsPage';
import { RecurringPaymentsPage } from './pages/recurringPayments/RecurringPaymentsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { AdvancedSettingsPage } from './pages/settings/AdvancedSettingsPage';

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/settings/periods', element: <PeriodsSettingsPage /> },
          { path: '/accounts', element: <AccountsPage /> },
          { path: '/categories', element: <CategoriesPage /> },
          { path: '/tags', element: <TagsPage /> },
          { path: '/budgets', element: <BudgetsPage /> },
          { path: '/recurring-payments', element: <RecurringPaymentsPage /> },
          { path: '/reports', element: <ReportsPage /> },
          { path: '/settings/advanced', element: <AdvancedSettingsPage /> },
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
