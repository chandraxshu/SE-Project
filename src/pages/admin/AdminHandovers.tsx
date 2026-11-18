import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import type { Claim } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Handshake,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Calendar,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminHandovers() {
  const { user } = useAuth();
  const { fetchAllClaims, confirmHandover, loading } = useAdmin();

  const [awaitingClaims, setAwaitingClaims] = useState<Claim[]>([]);
  const [completedClaims, setCompletedClaims] = useState<Claim[]>([]);

  // Handover confirmation modal
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientRoll, setRecipientRoll] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [awaitingRes, completedRes] = await Promise.all([
        fetchAllClaims({ status: 'awaiting_handover', pageSize: 50 }),
        fetchAllClaims({ status: 'returned', pageSize: 50 }),
      ]);
      setAwaitingClaims(awaitingRes.claims);
      setCompletedClaims(completedRes.claims);
    } catch (err) {
      console.error('Failed to load handovers:', err);
    }
  }, [fetchAllClaims]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openHandoverModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setRecipientName(claim.claimant?.full_name || '');
    setRecipientRoll(claim.claimant?.roll_number || '');
  };

  const handleConfirmHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim || !user) return;

    if (!recipientName.trim() || !recipientRoll.trim()) {
      toast.error('Recipient name and roll number are mandatory for verification.');
      return;
    }

    try {
      setSubmitting(true);
      await confirmHandover(
        selectedClaim.id,
        user.id,
        recipientName.trim(),
        recipientRoll.trim().toUpperCase()
      );

      toast.success('Physical handover recorded successfully in audit log!');
      setSelectedClaim(null);
      loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to confirm handover';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold font-display text-surface-900">
          Campus Handover & Return Desk
        </h2>
        <p className="text-xs text-surface-500">
          Verify student identity cards and record physical transfers into the permanent ledger.
        </p>
      </div>

      {/* Section 1: Awaiting Collection */}
      <div className="card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <h3 className="text-sm font-bold text-surface-900">
              Awaiting Physical Collection ({awaitingClaims.length})
            </h3>
          </div>
          <span className="text-2xs text-surface-400">
            Claims approved — ready for desk handover
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Checking desk queue..." />
        ) : awaitingClaims.length === 0 ? (
          <p className="text-xs text-surface-400 py-6 text-center">
            No approved items currently waiting for physical collection.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-200 text-surface-400 uppercase text-2xs font-semibold">
                  <th className="pb-3">Item Title</th>
                  <th className="pb-3">Approved Claimant</th>
                  <th className="pb-3">Roll Number</th>
                  <th className="pb-3">Location Found</th>
                  <th className="pb-3 text-right">Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {awaitingClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-surface-50/60">
                    <td className="py-3.5 font-bold text-surface-900 max-w-[200px] truncate">
                      {claim.item?.title}
                    </td>
                    <td className="py-3.5 text-surface-800 font-medium">
                      {claim.claimant?.full_name}
                    </td>
                    <td className="py-3.5 font-mono text-surface-700">
                      {claim.claimant?.roll_number}
                    </td>
                    <td className="py-3.5 text-surface-600 truncate max-w-[140px]">
                      {claim.item?.location}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => openHandoverModal(claim)}
                        className="btn-primary btn-sm inline-flex items-center gap-1.5"
                      >
                        <Handshake className="w-3.5 h-3.5" />
                        Record Handover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Completed Handovers History */}
      <div className="card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-surface-900">
              Completed Handovers History ({completedClaims.length})
            </h3>
          </div>
          <span className="text-2xs text-surface-400">
            Audit-verified returns to verified owners
          </span>
        </div>

        {completedClaims.length === 0 ? (
          <p className="text-xs text-surface-400 py-6 text-center">
            No handovers recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-200 text-surface-400 uppercase text-2xs font-semibold">
                  <th className="pb-3">Item Title</th>
                  <th className="pb-3">Handed Over To</th>
                  <th className="pb-3">Recipient Roll</th>
                  <th className="pb-3">Handover Timestamp</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {completedClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-surface-50/60">
                    <td className="py-3 font-medium text-surface-900 max-w-[200px] truncate">
                      {claim.item?.title}
                    </td>
                    <td className="py-3 text-surface-800">
                      {claim.recipient_name || claim.claimant?.full_name}
                    </td>
                    <td className="py-3 font-mono text-surface-700">
                      {claim.recipient_roll_number || claim.claimant?.roll_number}
                    </td>
                    <td className="py-3 text-surface-600 whitespace-nowrap">
                      {claim.handover_confirmed_at
                        ? new Date(claim.handover_confirmed_at).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Recorded'}
                    </td>
                    <td className="py-3 text-right">
                      <span className="badge-returned text-2xs">✓ Handed Over</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Handover Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedClaim)}
        onClose={() => setSelectedClaim(null)}
        title="Physical Handover Verification"
        size="md"
      >
        {selectedClaim && (
          <form onSubmit={handleConfirmHandover} className="space-y-5 text-xs">
            <div className="p-3.5 bg-primary-50/40 rounded-lg border border-primary-200">
              <span className="font-bold text-primary-900 block mb-1">
                Item: "{selectedClaim.item?.title}"
              </span>
              <p className="text-2xs text-primary-800">
                Found at: {selectedClaim.item?.location} • Original Finder ID recorded.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="input-label text-xs">
                  Physical Recipient Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Verify against student ID card"
                  className="input-field text-xs"
                  required
                />
              </div>

              <div>
                <label className="input-label text-xs">
                  Physical Recipient Roll Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recipientRoll}
                  onChange={(e) => setRecipientRoll(e.target.value.toUpperCase())}
                  placeholder="e.g. IIT2023001"
                  className="input-field text-xs font-mono uppercase"
                  required
                />
              </div>
            </div>

            <div className="rounded-lg bg-surface-100 p-3 text-2xs text-surface-600 leading-relaxed">
              <span className="font-bold text-surface-800">Verification Protocol:</span> Please physically inspect the student's institutional IIITA Identity Card before confirming this return. This action updates both the item and claim states to <span className="font-bold">RETURNED</span> and writes an immutable audit record with your administrator ID.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setSelectedClaim(null)}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary btn-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? 'Recording...' : 'Confirm Physical Handover'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
