import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import {
  Compass,
  PlusCircle,
  AlertCircle,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Browse Items', href: '/browse', icon: Compass },
    { label: 'Report Found', href: '/report/found', icon: PlusCircle },
    { label: 'Report Lost', href: '/report/lost', icon: AlertCircle },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-xs group-hover:bg-primary-700 transition-colors">
              <span className="font-display font-bold text-lg leading-none">ख</span>
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-surface-900 group-hover:text-primary-600 transition-colors">
                Khoj
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-2xs font-semibold uppercase tracking-wider text-surface-400 border-l border-surface-300 pl-1.5">
                IIITA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Controls & Notifications */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <NotificationDropdown />

                {/* Profile menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-100 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-semibold text-xs border border-primary-200">
                      {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:inline-block text-xs font-medium text-surface-700 max-w-[120px] truncate">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-elevated border border-surface-200 py-1.5 z-50"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-surface-100">
                        <p className="text-xs font-semibold text-surface-900 truncate">
                          {profile?.full_name || 'IIITA Student'}
                        </p>
                        <p className="text-2xs text-surface-400 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 badge bg-primary-50 text-primary-700 border border-primary-200 text-2xs font-semibold">
                            Admin
                          </span>
                        )}
                      </div>

                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-surface-700 hover:bg-surface-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-surface-400" />
                        My Dashboard
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-primary-700 hover:bg-primary-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-primary-600" />
                          Admin Portal
                        </Link>
                      )}

                      <div className="border-t border-surface-100 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary btn-sm">
                <UserIcon className="w-4 h-4" />
                Sign In
              </Link>
            )}

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-surface-600 hover:text-surface-900 rounded-lg hover:bg-surface-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          {user && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100"
              >
                <LayoutDashboard className="w-4 h-4" />
                My Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary-700 bg-primary-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Portal
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
}
