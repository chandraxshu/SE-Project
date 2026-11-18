import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import type { AuditLog } from '@/types';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScrollText, Shield, Clock, Terminal } from 'lucide-react';

export function AdminAuditLog() {
  const { fetchAuditLogs, loading } = useAdmin();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 20;

  const loadLogs = useCallback(async () => {
    try {
      const res = await fetchAuditLogs(page, PAGE_SIZE);
      setLogs(res.logs);
      setTotalCount(res.count);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  }, [fetchAuditLogs, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-surface-900">
            Administrative Audit Ledger
          </h2>
          <p className="text-xs text-surface-500">
            Cryptographically timestamped, immutable record of administrative decisions and handovers.
          </p>
        </div>
        <span className="badge bg-surface-200 text-surface-800 text-2xs font-mono">
          {totalCount} Total Events
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="card bg-white overflow-hidden shadow-card">
        {loading ? (
          <LoadingSpinner message="Querying audit records..." />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="Audit log empty"
            description="No administrative actions or handovers have been recorded yet."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50 text-surface-500 uppercase text-2xs font-semibold">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Type</th>
                    <th className="py-3 px-4">Entity ID</th>
                    <th className="py-3 px-4">Admin Performer</th>
                    <th className="py-3 px-4">Audit Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 font-mono text-2xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-50/80">
                      <td className="py-3 px-4 text-surface-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded ${
                            log.action.includes('approved')
                              ? 'bg-green-100 text-green-800'
                              : log.action.includes('rejected')
                              ? 'bg-red-100 text-red-800'
                              : log.action.includes('handover')
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-surface-100 text-surface-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-surface-600 uppercase font-sans">
                        {log.entity_type}
                      </td>
                      <td className="py-3 px-4 text-surface-500 truncate max-w-[120px]" title={log.entity_id}>
                        {log.entity_id}
                      </td>
                      <td className="py-3 px-4 text-surface-800 font-sans font-medium">
                        {log.performer?.full_name || 'Admin'}
                      </td>
                      <td className="py-3 px-4 max-w-[280px]">
                        <pre className="p-1.5 bg-surface-100 rounded text-[10px] text-surface-700 overflow-x-auto truncate">
                          {log.details ? JSON.stringify(log.details) : '{}'}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>

      <div className="rounded-xl border border-surface-200 bg-surface-100/60 p-4 flex items-center gap-3 text-xs text-surface-600">
        <Shield className="w-5 h-5 text-accent-600 shrink-0" />
        <span>
          <strong className="text-surface-900">Security Invariant:</strong> Database RLS prevents deletion or modification of rows in the <code className="bg-surface-200 px-1 py-0.5 rounded font-mono">audit_logs</code> table by any user.
        </span>
      </div>
    </div>
  );
}
