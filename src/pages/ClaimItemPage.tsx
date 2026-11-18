import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useItems } from '@/hooks/useItems';
import { useClaims } from '@/hooks/useClaims';
import type { Item } from '@/types';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import {
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  HandCoins,
  Lock,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function ClaimItemPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fetchItemById, loading: itemLoading } = useItems();
  const { createClaim, checkExistingClaim } = useClaims();

  const [item, setItem] = useState<Item | null>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [checkingClaim, setCheckingClaim] = useState(true);

  const [formData, setFormData] = useState({
    claim_message: '',
    proof_details: '',
    location_lost: '',
    date_lost: '',
  });
  const [proofPhoto, setProofPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadItemAndCheck() {
      if (!id || !user) return;
      try {
        const itemData = await fetchItemById(id);
        setItem(itemData);

        const hasClaim = await checkExistingClaim(id, user.id);
        setAlreadyClaimed(hasClaim);
      } catch (err) {
        console.error('Failed to load item:', err);
      } finally {
        setCheckingClaim(false);
      }
    }
    loadItemAndCheck();
  }, [id, user, fetchItemById, checkExistingClaim]);

  if (itemLoading || checkingClaim) {
    return <LoadingSpinner fullScreen message="Loading claim form..." />;
  }

  if (!item) {
    return (
      <div className="page-container py-16 text-center">
        <h2 className="text-xl font-bold text-surface-900">Item Not Found</h2>
        <Link to="/browse" className="btn-primary btn-sm mt-4 inline-flex">
          Browse Items
        </Link>
      </div>
    );
  }

  // Self claim prevention
  if (user && item.reported_by === user.id) {
    return (
      <div className="page-container max-w-lg py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-surface-900">Cannot Claim Your Own Report</h2>
        <p className="text-sm text-surface-500 mt-2">
          You are the reporter of this item. You cannot submit an ownership claim on an item you reported.
        </p>
        <Link to={`/items/${item.id}`} className="btn-secondary btn-sm mt-6 inline-flex">
          Back to Item
        </Link>
      </div>
    );
  }

  if (alreadyClaimed) {
    return (
      <div className="page-container max-w-lg py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
          <FileCheck2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-surface-900">Claim Already Submitted</h2>
        <p className="text-sm text-surface-500 mt-2">
          You have an active claim under review for "{item.title}". You can track its approval status and administrator notes on your dashboard.
        </p>
        <Link to="/dashboard" className="btn-primary btn-sm mt-6 inline-flex">
          Go to My Dashboard
        </Link>
      </div>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.claim_message.trim()) {
      newErrors.claim_message =
        'Please explain why you believe this item belongs to you.';
    }
    if (!formData.proof_details.trim()) {
      newErrors.proof_details =
        'Please describe unique identifying details (e.g., marks, screen unlock, contents, serial numbers).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be signed in.');
      navigate('/login');
      return;
    }

    if (!validate()) return;

    try {
      setSubmitting(true);
      await createClaim(
        {
          item_id: item.id,
          claimant_id: user.id,
          claim_message: formData.claim_message.trim(),
          proof_details: formData.proof_details.trim(),
          location_lost: formData.location_lost.trim() || undefined,
          date_lost: formData.date_lost || undefined,
        },
        proofPhoto
      );

      toast.success('Claim submitted! Our campus administrator will review your evidence.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit claim';
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <div className="mb-6">
        <Link
          to={`/items/${item.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-600 hover:text-surface-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel and return to item
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <HandCoins className="w-3.5 h-3.5 text-primary-700" />
          Ownership Verification
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-surface-900">
          Claim Item Ownership
        </h1>
        <p className="section-subtitle">
          Submit proof so administrators can verify your ownership before releasing the item.
        </p>
      </div>

      {/* Item Summary Card */}
      <div className="card p-4 sm:p-5 mb-8 bg-surface-50 border-surface-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="w-16 h-16 rounded-lg bg-surface-200 overflow-hidden shrink-0 flex items-center justify-center">
          {item.photo_url ? (
            <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <CategoryIcon category={item.category} className="w-8 h-8 text-surface-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="badge bg-surface-200 text-surface-700 text-2xs uppercase">
              {item.category}
            </span>
            <StatusBadge status={item.status} type="item" size="sm" />
          </div>
          <h3 className="text-base font-bold text-surface-900 truncate mt-1">{item.title}</h3>
          <p className="text-xs text-surface-500 truncate">
            Found at: <span className="font-medium text-surface-700">{item.location}</span> on{' '}
            {item.date_occurred}
          </p>
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="rounded-xl bg-accent-50/70 border border-accent-200 p-4 mb-8 flex items-start gap-3">
        <Lock className="w-5 h-5 text-accent-700 shrink-0 mt-0.5" />
        <div className="text-xs text-accent-900 leading-relaxed">
          <span className="font-bold">Confidential Proof:</span> The evidence and photo proof you provide below will{' '}
          <span className="underline font-semibold">only be visible to verified administrators</span>. Other students and the original finder cannot view your private proof.
        </div>
      </div>

      {/* Claim Form */}
      <div className="card p-6 sm:p-8 bg-white shadow-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Claim message */}
          <div>
            <label className="input-label">
              Why do you believe this is yours? <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.claim_message}
              onChange={(e) => setFormData({ ...formData, claim_message: e.target.value })}
              placeholder="e.g., I lost my watch right around CC3 after our afternoon lab session on Tuesday..."
              className="input-field"
            />
            {errors.claim_message && <p className="input-error">{errors.claim_message}</p>}
          </div>

          {/* Proof details */}
          <div>
            <label className="input-label">
              Unique Identifying Marks / Proof <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.proof_details}
              onChange={(e) => setFormData({ ...formData, proof_details: e.target.value })}
              placeholder="Provide exact details not visible in public photos: serial numbers, wallpaper description, passcodes, internal contents, specific scratch marks, invoices..."
              className="input-field"
            />
            {errors.proof_details && <p className="input-error">{errors.proof_details}</p>}
          </div>

          {/* Location and Date lost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Where did you lose it?</label>
              <input
                type="text"
                value={formData.location_lost}
                onChange={(e) => setFormData({ ...formData, location_lost: e.target.value })}
                placeholder="e.g. Near CC3 Lab 2"
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">When did you lose it?</label>
              <input
                type="date"
                value={formData.date_lost}
                onChange={(e) => setFormData({ ...formData, date_lost: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Proof Photograph Upload */}
          <div>
            <ImageUpload
              value={proofPhoto}
              onChange={(f) => setProofPhoto(f)}
              label="Supporting Evidence / Purchase Proof (Optional)"
              helperText="Upload purchase invoice, original box picture, warranty card, or earlier photograph of the item. Stored in encrypted private storage."
            />
          </div>

          <div className="pt-4 border-t border-surface-200">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
            >
              {submitting ? 'Submitting Claim...' : 'Submit Claim for Review'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
