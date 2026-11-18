import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useItems } from '@/hooks/useItems';
import { useClaims } from '@/hooks/useClaims';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import type { Item } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  MapPin,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  ArrowLeft,
  HandCoins,
  AlertCircle,
  FileCheck2,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { fetchItemById, loading: itemLoading, error: itemError } = useItems();
  const { checkExistingClaim } = useClaims();
  const { deleteItem } = useAdmin();

  const [item, setItem] = useState<Item | null>(null);
  const [hasExistingClaim, setHasExistingClaim] = useState(false);
  const [checkingClaim, setCheckingClaim] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadItem() {
      if (!id) return;
      try {
        const data = await fetchItemById(id);
        setItem(data);

        // Check if current logged-in user already has a claim on this item
        if (user && data.report_type === 'found') {
          setCheckingClaim(true);
          const alreadyClaimed = await checkExistingClaim(data.id, user.id);
          setHasExistingClaim(alreadyClaimed);
          setCheckingClaim(false);
        }
      } catch (err) {
        console.error('Error loading item:', err);
      }
    }

    loadItem();
  }, [id, user, fetchItemById, checkExistingClaim]);

  const handleAdminDelete = async () => {
    if (!item || !user) return;
    try {
      setIsDeleting(true);
      await deleteItem(item.id, user.id, `Admin deleted listing from detail page: ${item.title}`);
      toast.success('Listing permanently deleted');
      navigate('/browse');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete listing');
    } finally {
      setIsDeleting(false);
    }
  };

  if (itemLoading) {
    return <LoadingSpinner fullScreen message="Loading item details..." />;
  }

  if (itemError || !item) {
    return (
      <div className="page-container py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-surface-900">Item Not Found</h2>
        <p className="text-sm text-surface-500 mt-2 max-w-sm mx-auto">
          {itemError || 'This item listing does not exist or has been removed.'}
        </p>
        <Link to="/browse" className="btn-primary btn-sm mt-6 inline-flex">
          Browse All Items
        </Link>
      </div>
    );
  }

  const isReporter = user && user.id === item.reported_by;
  const isFoundItem = item.report_type === 'found';
  const isAvailableForClaim = isFoundItem && item.status === 'active' && !isReporter;

  const formattedDate = new Date(item.date_occurred).toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="page-container max-w-5xl">
      {/* Breadcrumb & Back & Admin actions */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-600 hover:text-surface-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Listings
        </Link>

        {profile?.role === 'admin' && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-danger btn-sm text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Admin: Delete Listing
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Photograph / Placeholder */}
        <div className="card overflow-hidden bg-surface-100 border-surface-200">
          {item.photo_url ? (
            <div className="relative aspect-4/3 w-full bg-surface-900/5">
              <img
                src={item.photo_url}
                alt={item.title}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-4/3 flex flex-col items-center justify-center p-8 text-surface-400">
              <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center mb-3 text-primary-600">
                <CategoryIcon category={item.category} className="w-8 h-8" />
              </div>
              <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                No photograph provided
              </p>
              <p className="text-2xs text-surface-400 mt-1">
                Distinguishing marks verified upon claim review
              </p>
            </div>
          )}
        </div>

        {/* Right: Details & Claim action */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`text-2xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  item.report_type === 'found'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                {item.report_type === 'found' ? 'Found Item' : 'Lost Item'}
              </span>
              <StatusBadge status={item.status} type="item" />
              <span className="badge bg-surface-100 text-surface-700 capitalize">
                {item.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-surface-900">
              {item.title}
            </h1>
          </div>

          {/* Description */}
          <div className="card p-5 bg-white space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-1">
                Description
              </h3>
              <p className="text-sm text-surface-700 whitespace-pre-line leading-relaxed">
                {item.description}
              </p>
            </div>

            {item.distinguishing_details && (
              <div className="pt-3 border-t border-surface-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-1">
                  Distinguishing Features
                </h3>
                <p className="text-sm text-surface-700 leading-relaxed">
                  {item.distinguishing_details}
                </p>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="card p-5 bg-white divide-y divide-surface-100 text-xs">
            <div className="flex items-center justify-between py-2.5 first:pt-0">
              <span className="text-surface-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-surface-400" />
                Location
              </span>
              <span className="font-semibold text-surface-900">{item.location}</span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-surface-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-surface-400" />
                Date Occurred
              </span>
              <span className="font-semibold text-surface-900">{formattedDate}</span>
            </div>

            {item.time_occurred && (
              <div className="flex items-center justify-between py-2.5">
                <span className="text-surface-500 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-surface-400" />
                  Approximate Time
                </span>
                <span className="font-semibold text-surface-900">{item.time_occurred}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-2.5 last:pb-0">
              <span className="text-surface-500 flex items-center gap-2">
                <User className="w-4 h-4 text-surface-400" />
                Reported by
              </span>
              <span className="font-semibold text-surface-900">
                {item.reporter?.full_name || 'IIITA Student'}
                {item.reporter?.department && ` (${item.reporter.department})`}
              </span>
            </div>
          </div>

          {/* Claim Action Box */}
          <div className="card p-6 bg-surface-100/60 border-surface-300">
            {isFoundItem ? (
              item.status === 'active' ? (
                isReporter ? (
                  <div className="text-center py-2">
                    <p className="text-xs font-semibold text-surface-700">
                      You reported this item.
                    </p>
                    <p className="text-2xs text-surface-500 mt-1">
                      Check your dashboard to track any submitted claims.
                    </p>
                    <Link to="/dashboard" className="btn-secondary btn-sm mt-3 inline-flex">
                      Go to Dashboard
                    </Link>
                  </div>
                ) : hasExistingClaim ? (
                  <div className="text-center py-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold mb-2">
                      <FileCheck2 className="w-4 h-4" /> Claim Under Review
                    </div>
                    <p className="text-xs text-surface-600">
                      You have already submitted a claim for this item.
                    </p>
                    <Link to="/dashboard" className="btn-primary btn-sm mt-3 inline-flex">
                      Track My Claim in Dashboard
                    </Link>
                  </div>
                ) : user ? (
                  <div>
                    <h3 className="text-sm font-bold text-surface-900 mb-1">
                      Does this item belong to you?
                    </h3>
                    <p className="text-xs text-surface-500 mb-4 leading-relaxed">
                      Submit a claim with proof of ownership (identifying marks, serial numbers, purchase invoice, or time lost).
                    </p>
                    <Link
                      to={`/items/${item.id}/claim`}
                      className="btn-primary w-full py-2.5 text-sm"
                    >
                      <HandCoins className="w-4 h-4 mr-1" />
                      Claim This Item
                    </Link>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-bold text-surface-900 mb-1">
                      Believe this item is yours?
                    </h3>
                    <p className="text-xs text-surface-500 mb-4">
                      Please sign in with your verified IIITA Google account to submit an ownership claim.
                    </p>
                    <Link to="/login" className="btn-primary w-full py-2.5 text-sm">
                      Sign In to Claim
                    </Link>
                  </div>
                )
              ) : (
                <div className="text-center py-2">
                  <span className="badge bg-surface-200 text-surface-700 text-xs font-semibold mb-2">
                    Item Status: {item.status.toUpperCase()}
                  </span>
                  <p className="text-xs text-surface-500">
                    This item is no longer available for claims as it is currently claimed or has been returned.
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-2">
                <span className="badge bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
                  Lost Item Notice
                </span>
                <p className="text-xs text-surface-500">
                  If you find an item matching this description, please report it as a "Found Item" so the owner can be notified.
                </p>
                <Link to="/report/found" className="btn-primary btn-sm mt-3 inline-flex">
                  Report Found Item
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleAdminDelete}
        title="Admin: Delete Listing?"
        message={`Are you sure you want to permanently delete "${item.title}"? This item and all associated claims will be permanently removed. This action will be logged in the campus audit trail.`}
        confirmLabel="Yes, Delete Listing"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
