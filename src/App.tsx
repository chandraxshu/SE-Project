import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { BrowseItemsPage } from '@/pages/BrowseItemsPage';
import { ItemDetailPage } from '@/pages/ItemDetailPage';
import { ReportFoundPage } from '@/pages/ReportFoundPage';
import { ReportLostPage } from '@/pages/ReportLostPage';
import { ClaimItemPage } from '@/pages/ClaimItemPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminFoundItems } from '@/pages/admin/AdminFoundItems';
import { AdminLostItems } from '@/pages/admin/AdminLostItems';
import { AdminClaims } from '@/pages/admin/AdminClaims';
import { AdminHandovers } from '@/pages/admin/AdminHandovers';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminAuditLog } from '@/pages/admin/AdminAuditLog';

// Route Guards
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen message="Authenticating session..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Verifying permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Connecting to Khoj IIITA..." />;
  }

  return (
    <Layout>
      <Routes>
        {/* Auth Route - Only Public Entry Point */}
        <Route path="/login" element={<LoginPage />} />

        {/* Onboarding Route */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Closed Campus Protected Routes - Only Accessible After Institutional Sign-In */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse"
          element={
            <ProtectedRoute>
              <BrowseItemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/:id"
          element={
            <ProtectedRoute>
              <ItemDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/found"
          element={
            <ProtectedRoute>
              <ReportFoundPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/lost"
          element={
            <ProtectedRoute>
              <ReportLostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/:id/claim"
          element={
            <ProtectedRoute>
              <ClaimItemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/found-items"
          element={
            <AdminRoute>
              <AdminFoundItems />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/lost-items"
          element={
            <AdminRoute>
              <AdminLostItems />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/claims"
          element={
            <AdminRoute>
              <AdminClaims />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/handovers"
          element={
            <AdminRoute>
              <AdminHandovers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/audit-log"
          element={
            <AdminRoute>
              <AdminAuditLog />
            </AdminRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <NotFoundPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
