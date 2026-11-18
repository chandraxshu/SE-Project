import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { AuditLog } from '@/types';
import {
  Package,
  AlertCircle,
  FileCheck2,
  Clock,
  CheckCircle2,
  Handshake,
  Users,
  ScrollText,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export function AdminDashboard() {
  const { fetchDashboardStats, fetchAuditLogs, loading } = useAdmin();
  const [stats, setStats] = useState({
    totalItems: 0,
    activeItems: 0,
    returnedItems: 0,
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    awaitingHandoverClaims: 0,
    totalUsers: 0,
    lostItems: 0,
    foundItems: 0,
  });
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, logsData] = await Promise.all([
          fetchDashboardStats(),
          fetchAuditLogs(1, 5),
        ]);
        setStats(statsData);
        setRecentLogs(logsData.logs);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      }
    }
    loadData();
  }, [fetchDashboardStats, fetchAuditLogs]);

  if (loading && !stats.totalItems) {
    return <LoadingSpinner fullScreen message="Loading administrative metrics..." />;
  }

  const statCards = [
    {
      label: 'Found Reports',
      count: stats.foundItems,
      desc: 'Active on noticeboard',
      icon: Package,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
      link: '/admin/found-items',
    },
    {
      label: 'Lost Reports',
      count: stats.lostItems,
      desc: 'Registered lost items',
      icon: AlertCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/admin/lost-items',
    },
    {
      label: 'Pending Claims',
      count: stats.pendingClaims,
      desc: 'Awaiting your review',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      link: '/admin/claims?status=pending_review',
      highlight: stats.pendingClaims > 0,
    },
    {
      label: 'Awaiting Handover',
      count: stats.awaitingHandoverClaims,
      desc: 'Ready for desk collection',
      icon: Handshake,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      link: '/admin/handovers',
      highlight: stats.awaitingHandoverClaims > 0,
    },
    {
      label: 'Total Claims',
      count: stats.totalClaims,
      desc: 'All-time claims filed',
      icon: FileCheck2,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      link: '/admin/claims',
    },
    {
      label: 'Returned Items',
      count: stats.returnedItems,
      desc: 'Handovers confirmed',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      link: '/admin/handovers',
    },
    {
      label: 'Registered Students',
      count: stats.totalUsers,
      desc: 'Verified @iiita accounts',
      icon: Users,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      link: '/admin/users',
    },
    {
      label: 'Audit Log Entries',
      count: recentLogs.length,
      desc: 'Immutable system actions',
      icon: ScrollText,
      color: 'text-stone-600',
      bg: 'bg-stone-100',
      link: '/admin/audit-log',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Action Alerts */}
      {(stats.pendingClaims > 0 || stats.awaitingHandoverClaims > 0) && (
        <div className="rounded-xl border border-primary-300 bg-primary-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
              !
            </div>
            <div>
              <h3 className="text-sm font-bold text-surface-900">
                Action Required at Administrative Desk
              </h3>
              <p className="text-xs text-surface-600">
                You have {stats.pendingClaims} claims waiting for verification and{' '}
                {stats.awaitingHandoverClaims} items ready for physical collection.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/claims?status=pending_review" className="btn-primary btn-sm">
              Review Claims
            </Link>
            <Link to="/admin/handovers" className="btn-secondary btn-sm">
              Desk Handovers
            </Link>
          </div>
        </div>
      )}

      {/* Grid of 8 stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.link}
              className={`card p-4 sm:p-5 hover:shadow-card-hover transition-all ${
                c.highlight ? 'border-amber-300 bg-amber-50/20' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider line-clamp-1">
                  {c.label}
                </span>
                <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-display text-surface-900">{c.count}</div>
              <p className="text-2xs text-surface-400 mt-1 line-clamp-1">{c.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Audit Trail Preview */}
      <div className="card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-surface-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-surface-900 font-display">
              Recent Administrative Actions
            </h3>
            <p className="text-xs text-surface-500">
              Latest security and handover events logged to the audit trail
            </p>
          </div>
          <Link
            to="/admin/audit-log"
            className="text-xs text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-1"
          >
            Full Audit Log <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-surface-400 py-4 text-center">No audit records logged yet.</p>
        ) : (
          <div className="divide-y divide-surface-100 text-xs">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono px-2 py-0.5 rounded bg-surface-100 text-surface-700 text-2xs font-bold">
                    {log.action}
                  </span>
                  <span className="text-surface-700">
                    By <span className="font-semibold text-surface-900">{log.performer?.full_name || 'Admin'}</span>
                  </span>
                </div>
                <span className="text-2xs text-surface-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
