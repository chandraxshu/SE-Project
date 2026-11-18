import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  AlertCircle,
  ShieldCheck,
  Package,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useItems } from '@/hooks/useItems';
import type { Item, ItemCategory } from '@/types';
import { ITEM_CATEGORIES } from '@/types';
import { ItemCard } from '@/components/items/ItemCard';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { fetchItems } = useItems();
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecent() {
      try {
        const result = await fetchItems({
          report_type: 'found',
          status: 'active',
          pageSize: 6,
        });
        setRecentItems(result.items);
      } catch (err) {
        console.error('Failed to load recent items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecent();
  }, [fetchItems]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Noticeboard Style Hero Section */}
      <section className="relative bg-surface-100/60 border-b border-surface-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-800 border border-primary-200 text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
              IIIT Allahabad Official Lost Property Portal
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-bold text-surface-900 tracking-tight leading-tight">
              Lost something on campus? <br />
              <span className="text-primary-600">Khoj</span> brings it back to you.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-surface-600 max-w-2xl leading-relaxed">
              A secure, student-to-student noticeboard for items found or misplaced across Jhalwa campus. Verified with your institutional IIITA ID.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-8 flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by item name (e.g., Casio fx-991, Hostel 3 Keys, Blue Bottle)..."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-surface-300 rounded-xl shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button type="submit" className="btn-primary py-3 px-6 text-sm shrink-0">
                Search Items
              </button>
            </form>

            {/* Quick Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/report/found"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-900 text-white font-medium text-sm hover:bg-surface-800 shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-primary-400" />
                I Found Something
              </Link>
              <Link
                to="/report/lost"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-surface-300 text-surface-700 font-medium text-sm hover:bg-surface-50 shadow-xs transition-colors"
              >
                <AlertCircle className="w-4 h-4 text-amber-500" />
                I Lost Something
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-surface-900">
              Browse by Category
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 mt-1">
              Commonly reported lost and found items on campus
            </p>
          </div>
          <Link
            to="/browse"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
          >
            All Items <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {ITEM_CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              to={`/browse?category=${cat.value}`}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-surface-200 bg-white hover:border-primary-400 hover:shadow-card-hover transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-100 group-hover:bg-primary-50 text-surface-600 group-hover:text-primary-600 flex items-center justify-center mb-2 transition-colors">
                <CategoryIcon category={cat.value} className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-surface-800 line-clamp-1">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Reported Found Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Live Campus Reports
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-surface-900">
              Recently Reported Found Items
            </h2>
          </div>
          <Link
            to="/browse"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
          >
            View all ({recentItems.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Checking noticeboard for recent items..." />
        ) : recentItems.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-surface-300 bg-white">
            <Package className="w-8 h-8 text-surface-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-surface-700">No active found items right now</p>
            <p className="text-xs text-surface-500 mt-1">If you have found an item, report it to help its owner.</p>
            <Link to="/report/found" className="btn-primary btn-sm mt-4 inline-flex">
              Report Found Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* How the Process Works */}
      <section className="bg-surface-100/70 border-y border-surface-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold font-display text-surface-900">
              How the Claim & Return Process Works
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 mt-2">
              Designed to protect student belongings and prevent fraudulent claims through verified administrator handovers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-5 relative">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center mb-3">
                1
              </div>
              <h3 className="text-sm font-bold text-surface-900">Report or Browse</h3>
              <p className="text-xs text-surface-500 mt-1.5 leading-relaxed">
                Found an item? Report it with location and photo. Lost an item? Browse active listings or register a lost report.
              </p>
            </div>

            <div className="card p-5 relative">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center mb-3">
                2
              </div>
              <h3 className="text-sm font-bold text-surface-900">Submit a Claim</h3>
              <p className="text-xs text-surface-500 mt-1.5 leading-relaxed">
                Spot your item? Submit a claim describing unique distinguishing marks or providing serial numbers / receipts.
              </p>
            </div>

            <div className="card p-5 relative">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center mb-3">
                3
              </div>
              <h3 className="text-sm font-bold text-surface-900">Admin Verification</h3>
              <p className="text-xs text-surface-500 mt-1.5 leading-relaxed">
                Campus administrators review claimant details and proof to prevent false handovers. Private evidence is never shown publicly.
              </p>
            </div>

            <div className="card p-5 relative">
              <div className="w-8 h-8 rounded-full bg-accent-100 text-accent-700 font-bold text-xs flex items-center justify-center mb-3">
                4
              </div>
              <h3 className="text-sm font-bold text-surface-900">Physical Handover</h3>
              <p className="text-xs text-surface-500 mt-1.5 leading-relaxed">
                Once approved, collect the item from the designated desk. The admin logs the handover with roll number verification.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-surface-500">
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-surface-400" />
              Confidential Proof Evidence
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent-600" />
              Audit Logged Handovers
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary-600" />
              @iiita.ac.in Verified Accounts Only
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
