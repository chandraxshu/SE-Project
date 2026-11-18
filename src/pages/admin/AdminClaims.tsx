import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import type { Claim } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  MessageSquare,
  Shield,
  Eye,
  Lock,
  User,
  Clock,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminClaims() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { fetchAllClaims, approveClaim, rejectClaim, loading } = useAdmin();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Review & Action state
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [claimantMessage, setClaimantMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const PAGE_SIZE = 15;

  const loadClaims = useCallback(async () => {
    try {
      const res = await fetchAllClaims({
        status: status || undefined,
        search: search.trim() || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setClaims(res.claims);
      setTotalCount(res.count);
    } catch (err) {
      console.error('Failed to load claims:', err);
    }
  }, [fetchAllClaims, status, search, page]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const handleApprove = async () => {
    if (!selectedClaim || !user) return;
    try {
      setActionLoading(true);
      await approveClaim(selectedClaim.id, user.id, actionNote.trim() || undefined);
      toast.success('Claim approved! Item moved to Awaiting Handover state.');
      setActionType(null);
      setSelectedClaim(null);
      setActionNote('');
      loadClaims();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to approve claim';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim || !user) return;
    try {
      setActionLoading(true);
      await rejectClaim(
        selectedClaim.id,
        user.id,
        actionNote.trim() || undefined,
        claimantMessage.trim() || undefined
      );
      toast.success('Claim rejected and claimant notified.');
      setActionType(null);
      setSelectedClaim(null);
      setActionNote('');
      setClaimantMessage('');
      loadClaims();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reject claim';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-surface-900">
          Manage Item Claims
        </h2>
        <p className="text-xs text-surface-500">
          Investigate ownership claims, review private proof evidence, and grant approvals.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="card p-4 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search claim descriptions..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="input-field text-xs py-2 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="awaiting_handover">Awaiting Handover</option>
            <option value="returned">Successfully Returned</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="card bg-white overflow-hidden shadow-card">
        {loading ? (
          <LoadingSpinner message="Loading claims..." />
        ) : claims.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No claims match criteria"
            description="All pending claims may have been resolved."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50 text-surface-500 uppercase text-2xs font-semibold">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Claimant</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-surface-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-surface-900 max-w-[180px] truncate">
                        {claim.item?.title || 'Unknown Item'}
                      </td>
                      <td className="py-3 px-4 text-surface-700">
                        <div className="font-medium text-surface-900 truncate">
                          {claim.claimant?.full_name}
                        </div>
                        <div className="text-2xs text-surface-400 truncate">
                          {claim.claimant?.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-surface-800">
                        {claim.claimant?.roll_number}
                      </td>
                      <td className="py-3 px-4 text-surface-600 whitespace-nowrap">
                        {new Date(claim.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={claim.status} type="claim" size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedClaim(claim)}
                          className="btn-primary btn-sm text-xs py-1 px-3 inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Investigate
                        </button>
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

      {/* Comprehensive Claim Investigation Modal */}
      <Modal
        isOpen={Boolean(selectedClaim && !actionType)}
        onClose={() => setSelectedClaim(null)}
        title="Claim Investigation Dossier"
        size="lg"
      >
        {selectedClaim && (
          <div className="space-y-6 text-xs">
            {/* Header info */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-surface-100">
              <div>
                <span className="text-2xs text-surface-400 font-mono">
                  Claim ID: {selectedClaim.id}
                </span>
                <h3 className="text-base font-bold text-surface-900 mt-1">
                  Item Claimed: "{selectedClaim.item?.title}"
                </h3>
              </div>
              <StatusBadge status={selectedClaim.status} type="claim" />
            </div>

            {/* Claimant Profile */}
            <div className="card p-4 bg-surface-50 border-surface-200">
              <span className="font-bold text-surface-800 uppercase tracking-wider text-2xs block mb-2">
                Claimant Institutional Identity
              </span>
              <div className="grid grid-cols-2 gap-3 text-surface-700">
                <div>
                  <span className="text-surface-400 block">Full Name</span>
                  <span className="font-semibold text-surface-900">
                    {selectedClaim.claimant?.full_name}
                  </span>
                </div>
                <div>
                  <span className="text-surface-400 block">Roll Number</span>
                  <span className="font-mono font-semibold text-surface-900">
                    {selectedClaim.claimant?.roll_number}
                  </span>
                </div>
                <div>
                  <span className="text-surface-400 block">Institutional Email</span>
                  <span className="text-surface-900">{selectedClaim.claimant?.email}</span>
                </div>
                <div>
                  <span className="text-surface-400 block">Department</span>
                  <span className="text-surface-900">{selectedClaim.claimant?.department}</span>
                </div>
              </div>
            </div>

            {/* Claim Explanation */}
            <div className="space-y-1.5">
              <span className="font-bold text-surface-800 uppercase tracking-wider text-2xs block">
                Claimant's Explanation
              </span>
              <p className="p-3 bg-white border border-surface-200 rounded-lg text-surface-800 leading-relaxed">
                {selectedClaim.claim_message}
              </p>
            </div>

            {/* Identifying Proof Details */}
            <div className="space-y-1.5">
              <span className="font-bold text-surface-800 uppercase tracking-wider text-2xs flex items-center gap-1.5 text-primary-700">
                <Lock className="w-3.5 h-3.5" />
                Confidential Ownership Proof & Distinguishing Details
              </span>
              <p className="p-3 bg-primary-50/30 border border-primary-200 rounded-lg text-surface-900 leading-relaxed font-medium">
                {selectedClaim.proof_details || 'No additional details provided.'}
              </p>
            </div>

            {/* Proof photo if uploaded */}
            {selectedClaim.proof_photo_url && (
              <div className="space-y-1.5">
                <span className="font-bold text-surface-800 uppercase tracking-wider text-2xs flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-accent-600" />
                  Uploaded Proof Evidence / Invoice
                </span>
                <div className="max-h-60 rounded-lg overflow-hidden border border-surface-200 bg-surface-100 p-2 flex items-center justify-center">
                  <img
                    src={selectedClaim.proof_photo_url}
                    alt="Claim evidence"
                    className="max-h-56 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Review and Admin Actions */}
            <div className="pt-4 border-t border-surface-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-2xs text-surface-400">
                Submitted on {new Date(selectedClaim.created_at).toLocaleString()}
              </div>

              {selectedClaim.status === 'pending_review' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType('reject')}
                    className="btn-danger btn-sm flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" /> Reject Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('approve')}
                    className="btn-primary btn-sm flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve Claim
                  </button>
                </div>
              ) : (
                <div className="text-xs text-surface-500 font-medium">
                  Review finalized: {selectedClaim.status.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Approval Confirmation Dialog */}
      <Modal
        isOpen={actionType === 'approve'}
        onClose={() => setActionType(null)}
        title="Approve Ownership Claim"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Important Safeguard:</span> Approving this claim will automatically{' '}
              <span className="font-semibold">reject any other pending claims</span> for this item and transition the item into the{' '}
              <span className="font-semibold">Awaiting Handover</span> state.
            </div>
          </div>

          <div>
            <label className="input-label text-xs">Internal Administrative Note (Optional)</label>
            <textarea
              rows={2}
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="e.g. Serial number verified against claimant's invoice #4928"
              className="input-field text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setActionType(null)}
              className="btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleApprove}
              className="btn-primary btn-sm"
            >
              {actionLoading ? 'Processing...' : 'Confirm Approval'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Rejection Dialog */}
      <Modal
        isOpen={actionType === 'reject'}
        onClose={() => setActionType(null)}
        title="Reject Ownership Claim"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="input-label text-xs">
              Internal Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Internal record of why evidence was deemed insufficient..."
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="input-label text-xs">
              Message to Student (Visible in their dashboard)
            </label>
            <textarea
              rows={2}
              value={claimantMessage}
              onChange={(e) => setClaimantMessage(e.target.value)}
              placeholder="e.g. Identifying marks provided did not match the actual item."
              className="input-field text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setActionType(null)}
              className="btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleReject}
              className="btn-danger btn-sm"
            >
              {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
