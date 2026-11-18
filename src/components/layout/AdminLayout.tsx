import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PackageSearch,
  AlertCircle,
  FileCheck2,
  Handshake,
  Users,
  ScrollText,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { profile } = useAuth();

  if (profile?.role !== 'admin') {
    return (
      <div className="page-container py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-surface-900">Access Denied</h2>
        <p className="text-sm text-surface-500 mt-2 max-w-md mx-auto">
          You do not have administrative privileges. Only verified administrators can access the Admin Portal.
        </p>
        <Link to="/" className="btn-primary btn-sm mt-6 inline-flex">
          Return to Home
        </Link>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Found Items', href: '/admin/found-items', icon: PackageSearch },
    { label: 'Lost Items', href: '/admin/lost-items', icon: AlertCircle },
    { label: 'Claims', href: '/admin/claims', icon: FileCheck2 },
    { label: 'Handovers', href: '/admin/handovers', icon: Handshake },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Audit Log', href: '/admin/audit-log', icon: ScrollText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with quick back link */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-surface-200 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge bg-primary-100 text-primary-800 border border-primary-200 font-semibold text-2xs uppercase">
              Admin Portal
            </span>
            <span className="text-xs text-surface-400">• IIIT Allahabad</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mt-1">Management Desk</h1>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-600 hover:text-surface-900 px-3 py-1.5 rounded-lg border border-surface-300 hover:bg-surface-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Student Portal
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-1">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-4 min-w-0">{children}</div>
      </div>
    </div>
  );
}
