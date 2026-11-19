import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useItems } from '@/hooks/useItems';
import { useClaims } from '@/hooks/useClaims';
import type { Item, Claim } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Link } from 'react-router-dom';
import {
  Package,
  HandCoins,
  Clock,
  CheckCircle2,
  PlusCircle,
  AlertCircle,
  User,
  LogOut,
  Calendar,
  MapPin,
  ExternalLink,
  MessageSquare,
  Shield,
  Edit2,
  Save,
  X,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { fetchMyItems } = useItems();
  const { fetchMyClaims } = useClaims();

  const [activeTab, setActiveTab] = useState<'overview' | 'found' | 'lost' | 'claims' | 'profile'>('overview');
  const [foundItems, setFoundItems] = useState<Item[]>([]);
  const [lostItems, setLostItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [phoneEdit, setPhoneEdit] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        setLoading(true);
        const [found, lost, userClaims] = await Promise.all([
          fetchMyItems(user.id, 'found'),
          fetchMyItems(user.id, 'lost'),
          fetchMyClaims(user.id),
        ]);

        setFoundItems(found);
        setLostItems(lost);
        setClaims(userClaims);
        if (profile?.phone) {
          setPhoneEdit(profile.phone);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user, profile, fetchMyItems, fetchMyClaims]);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      await updateProfile({
        phone: phoneEdit.trim() || null,
      });
      toast.success('Contact info updated.');
      setIsEditingProfile(false);
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your dashboard..." />;
  }

  const pendingClaimsCount = claims.filter((c) => c.status === 'pending_review').length;
  const returnedCount =
    claims.filter((c) => c.status === 'returned').length +
    foundItems.filter((i) => i.status === 'returned').length;

  return (
    <div className="page-container">
      {/* Header Profile Bar */}
      <div className="card p-6 mb-8 bg-white border-surface-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-800 flex items-center justify-center font-display font-bold text-xl border border-primary-200 shadow-xs">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-display text-surface-900">
                  {profile?.full_name || 'IIITA Student'}
                </h1>
                <span className="badge bg-primary-50 text-primary-700 border border-primary-200 uppercase text-2xs font-bold">
                  {profile?.role || 'student'}
                </span>
              </div>
              <p className="text-xs text-surface-500 mt-0.5">
                {profile?.roll_number} • {profile?.department} (Batch {profile?.academic_batch})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/report/found" className="btn-primary btn-sm">
              <PlusCircle className="w-4 h-4" />
              Report Found
            </Link>
            <Link to="/report/lost" className="btn-secondary btn-sm">
              <AlertCircle className="w-4 h-4" />
              Report Lost
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-surface-100 mt-6 pt-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'found', label: `My Found Reports (${foundItems.length})` },
            { id: 'lost', label: `My Lost Reports (${lostItems.length})` },
            { id: 'claims', label: `My Claims (${claims.length})` },
            { id: 'profile', label: 'Profile & Contact' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 bg-white">
              <div className="flex items-center justify-between text-surface-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Reported Found</span>
                <Package className="w-4 h-4 text-primary-600" />
              </div>
              <div className="text-2xl font-bold font-display text-surface-900">
                {foundItems.length}
              </div>
              <p className="text-2xs text-surface-400 mt-1">Items posted to noticeboard</p>
            </div>

            <div className="card p-5 bg-white">
              <div className="flex items-center justify-between text-surface-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Reported Lost</span>
                <AlertCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold font-display text-surface-900">
                {lostItems.length}
              </div>
              <p className="text-2xs text-surface-400 mt-1">Items you are searching for</p>
            </div>

            <div className="card p-5 bg-white">
              <div className="flex items-center justify-between text-surface-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Claims</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold font-display text-surface-900">
                {pendingClaimsCount}
              </div>
              <p className="text-2xs text-surface-400 mt-1">Pending admin investigation</p>
            </div>

            <div className="card p-5 bg-white">
              <div className="flex items-center justify-between text-surface-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Items Returned</span>
                <CheckCircle2 className="w-4 h-4 text-accent-600" />
              </div>
              <div className="text-2xl font-bold font-display text-surface-900">
                {returnedCount}
              </div>
              <p className="text-2xs text-surface-400 mt-1">Successfully resolved handovers</p>
            </div>
          </div>

          {/* Recent Claims Snapshot */}
          <div className="card p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-surface-900 font-display">
                Recent Claim Activity
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('claims')}
                className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
              >
                View all claims →
              </button>
            </div>

            {claims.length === 0 ? (
              <p className="text-xs text-surface-400 py-6 text-center">
                You haven't submitted any ownership claims yet.
              </p>
            ) : (
              <div className="divide-y divide-surface-100">
                {claims.slice(0, 3).map((claim) => (
                  <div key={claim.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-surface-900 truncate">
                        {claim.item?.title || 'Claimed Item'}
                      </p>
                      <p className="text-2xs text-surface-400 mt-0.5">
                        Submitted on {new Date(claim.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={claim.status} type="claim" size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: My Found Reports */}
      {activeTab === 'found' && (
        <div className="card p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold font-display text-surface-900">
              Found Items You Reported
            </h3>
            <Link to="/report/found" className="btn-primary btn-sm">
              <PlusCircle className="w-4 h-4" />
              New Report
            </Link>
          </div>

          {foundItems.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No found items reported"
              description="If you have picked up a lost item on campus, report it here so its owner can reclaim it."
              actionLabel="Report a Found Item"
              actionHref="/report/found"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-200 text-surface-400 uppercase text-2xs">
                    <th className="pb-3 font-semibold">Item Title</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Date Found</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {foundItems.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-50/60">
                      <td className="py-3.5 font-medium text-surface-900 max-w-[200px] truncate">
                        {item.title}
                      </td>
                      <td className="py-3.5 text-surface-600 truncate">{item.location}</td>
                      <td className="py-3.5 text-surface-600">{item.date_occurred}</td>
                      <td className="py-3.5">
                        <StatusBadge status={item.status} type="item" size="sm" />
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/items/${item.id}`}
                          className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Lost Reports */}
      {activeTab === 'lost' && (
        <div className="card p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold font-display text-surface-900">
              Lost Items You Registered
            </h3>
            <Link to="/report/lost" className="btn-secondary btn-sm">
              <AlertCircle className="w-4 h-4" />
              Register Lost Item
            </Link>
          </div>

          {lostItems.length === 0 ? (
            <EmptyState
              icon={AlertCircle}
              title="No lost reports active"
              description="Misplaced something on campus? Register a lost report to keep security and fellow students informed."
              actionLabel="Report a Lost Item"
              actionHref="/report/lost"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-200 text-surface-400 uppercase text-2xs">
                    <th className="pb-3 font-semibold">Item Title</th>
                    <th className="pb-3 font-semibold">Last Known Location</th>
                    <th className="pb-3 font-semibold">Date Lost</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {lostItems.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-50/60">
                      <td className="py-3.5 font-medium text-surface-900 max-w-[200px] truncate">
                        {item.title}
                      </td>
                      <td className="py-3.5 text-surface-600 truncate">{item.location}</td>
                      <td className="py-3.5 text-surface-600">{item.date_occurred}</td>
                      <td className="py-3.5">
                        <StatusBadge status={item.status} type="item" size="sm" />
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/items/${item.id}`}
                          className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: My Claims */}
      {activeTab === 'claims' && (
        <div className="card p-6 bg-white space-y-6">
          <div>
            <h3 className="text-base font-bold font-display text-surface-900">
              My Submitted Ownership Claims
            </h3>
            <p className="text-xs text-surface-500 mt-1">
              Track administrator reviews, feedback, and physical collection status.
            </p>
          </div>

          {claims.length === 0 ? (
            <EmptyState
              icon={HandCoins}
              title="No claims submitted"
              description="If you see your lost belonging listed on the noticeboard, you can submit an ownership claim with identifying proof."
              actionLabel="Browse Found Items"
              actionHref="/browse"
            />
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="card p-5 bg-surface-50/60 border-surface-200 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-200">
                    <div>
                      <h4 className="text-sm font-bold text-surface-900">
                        {claim.item?.title || 'Reported Item'}
                      </h4>
                      <p className="text-2xs text-surface-500">
                        Claim submitted on {new Date(claim.created_at).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={claim.status} type="claim" />
                  </div>

                  {/* Claim explanation excerpt */}
                  <div className="text-xs text-surface-700">
                    <span className="font-semibold text-surface-900">Your claim note: </span>
                    {claim.claim_message}
                  </div>

                  {/* Admin feedback if any */}
                  {claim.admin_message && (
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Message from Administrator:</span>{' '}
                        {claim.admin_message}
                      </div>
                    </div>
                  )}

                  {/* Next Step Guidance */}
                  {claim.status === 'awaiting_handover' && (
                    <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-900 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Claim Approved!</span> Please visit the Security / Student Welfare Desk with your IIITA ID card to physically collect your item.
                      </div>
                    </div>
                  )}

                  {claim.status === 'returned' && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Handover Completed:</span> This item has been physically collected and confirmed by administrative verification.
                      </div>
                    </div>
                  )}

                  {claim.item_id && (
                    <div className="pt-2 flex justify-end">
                      <Link
                        to={`/items/${claim.item_id}`}
                        className="text-xs text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-1"
                      >
                        View Original Listing <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Profile & Contact */}
      {activeTab === 'profile' && (
        <div className="max-w-xl card p-6 bg-white space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-100">
            <div>
              <h3 className="text-base font-bold font-display text-surface-900">
                Institutional Profile
              </h3>
              <p className="text-xs text-surface-500">
                Credentials retrieved from your verified @iiita.ac.in account
              </p>
            </div>
            {!isEditingProfile && (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="btn-secondary btn-sm flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Contact
              </button>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-surface-400 block mb-0.5">Full Name</span>
              <span className="text-sm font-semibold text-surface-900">
                {profile?.full_name}
              </span>
            </div>

            <div>
              <span className="text-surface-400 block mb-0.5">Institutional Email</span>
              <span className="text-sm font-semibold text-surface-900">
                {profile?.email}
              </span>
            </div>

            <div>
              <span className="text-surface-400 block mb-0.5">IIITA Roll Number</span>
              <span className="text-sm font-semibold text-surface-900 font-mono">
                {profile?.roll_number}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-surface-400 block mb-0.5">Department</span>
                <span className="text-sm font-semibold text-surface-900">
                  {profile?.department}
                </span>
              </div>
              <div>
                <span className="text-surface-400 block mb-0.5">Academic Batch</span>
                <span className="text-sm font-semibold text-surface-900">
                  Batch {profile?.academic_batch}
                </span>
              </div>
            </div>

            <div>
              <span className="text-surface-400 block mb-0.5">Contact Number</span>
              {isEditingProfile ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="tel"
                    value={phoneEdit}
                    onChange={(e) => setPhoneEdit(e.target.value)}
                    placeholder="+91 9876543210"
                    className="input-field text-xs py-1.5"
                  />
                  <button
                    type="button"
                    disabled={savingProfile}
                    onClick={handleSaveProfile}
                    className="btn-primary btn-sm shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="btn-secondary btn-sm shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-sm font-semibold text-surface-900">
                  {profile?.phone || 'Not provided'}
                </span>
              )}
            </div>

            {/* Telegram Bot Integration Card */}
            <div className="rounded-xl p-4 bg-sky-50/70 border border-sky-200/80 mt-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-surface-900">
                      Khoj Telegram Bot (@iiita_khoj_bot)
                    </h4>
                    <p className="text-2xs text-surface-500">
                      Report lost items directly in Telegram in under 30 seconds
                    </p>
                  </div>
                </div>

                {profile?.telegram_chat_id ? (
                  <span className="badge bg-green-100 text-green-800 text-2xs font-semibold">
                    Linked
                  </span>
                ) : (
                  <span className="badge bg-surface-200 text-surface-600 text-2xs font-semibold">
                    Not Linked
                  </span>
                )}
              </div>

              <p className="text-2xs text-surface-600 leading-relaxed">
                {profile?.telegram_chat_id
                  ? `Your Telegram account (${profile.telegram_username || 'connected'}) is active. You can report notices on the go and receive instant claim alerts.`
                  : 'Link your Telegram to report lost/found items with photos right from your phone without opening a browser.'}
              </p>

              <div>
                <a
                  href={`https://t.me/iiita_khoj_bot?start=${user?.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary btn-sm inline-flex items-center gap-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white"
                >
                  <Send className="w-3.5 h-3.5" />
                  {profile?.telegram_chat_id ? 'Open Telegram Bot' : 'Connect Telegram Bot'}
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-surface-100 flex items-center justify-between">
            <span className="text-2xs text-surface-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-accent-600" />
              Institutional Roll No. locked to account ID
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
