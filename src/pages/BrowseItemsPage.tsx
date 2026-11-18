import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useItems } from '@/hooks/useItems';
import type { Item, ItemCategory } from '@/types';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '@/types';
import { ItemCard } from '@/components/items/ItemCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Filter, SlidersHorizontal, Package, RefreshCw, X } from 'lucide-react';

export function BrowseItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchItems, loading } = useItems();

  // State from URL or defaults
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState<string>(searchParams.get('category') || '');
  const [location, setLocation] = useState<string>(searchParams.get('location') || '');
  const [reportType, setReportType] = useState<'found' | 'lost'>(
    (searchParams.get('type') as 'found' | 'lost') || 'found'
  );
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'active');
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10));

  const [items, setItems] = useState<Item[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const PAGE_SIZE = 12;

  // Sync state to URL
  const updateQueryParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (location) params.location = location;
    if (reportType) params.type = reportType;
    if (statusFilter && statusFilter !== 'active') params.status = statusFilter;
    if (page > 1) params.page = page.toString();

    setSearchParams(params, { replace: true });
  }, [search, category, location, reportType, statusFilter, page, setSearchParams]);

  const loadItems = useCallback(async () => {
    try {
      const res = await fetchItems({
        search: search.trim() || undefined,
        category: category || undefined,
        report_type: reportType,
        status: statusFilter || undefined,
        page,
        pageSize: PAGE_SIZE,
      });

      // Filter by location in memory if location filter is active
      let filtered = res.items;
      if (location) {
        filtered = filtered.filter((i) => i.location === location);
      }

      setItems(filtered);
      setTotalCount(res.count);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    }
  }, [fetchItems, search, category, reportType, statusFilter, location, page]);

  useEffect(() => {
    updateQueryParams();
    loadItems();
  }, [updateQueryParams, loadItems]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setStatusFilter('active');
    setPage(1);
    setSearchParams({});
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasActiveFilters = Boolean(search || category || location || statusFilter !== 'active');

  return (
    <div className="page-container">
      {/* Title & Type Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-surface-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-surface-900">
            Browse Campus Noticeboard
          </h1>
          <p className="section-subtitle">
            Search items reported found or lost across IIIT Allahabad campus.
          </p>
        </div>

        {/* Found vs Lost toggle */}
        <div className="flex items-center p-1 bg-surface-200/80 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setReportType('found');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              reportType === 'found'
                ? 'bg-white text-surface-900 shadow-xs'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            Found Items
          </button>
          <button
            type="button"
            onClick={() => {
              setReportType('lost');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              reportType === 'lost'
                ? 'bg-white text-surface-900 shadow-xs'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            Lost Reports
          </button>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Item Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-100">
              <span className="text-sm font-bold text-surface-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary-600" />
                Filters
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="mb-5">
              <label className="input-label text-xs">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="input-field text-xs bg-white"
              >
                <option value="">All Categories</option>
                {ITEM_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="mb-5">
              <label className="input-label text-xs">Campus Location</label>
              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className="input-field text-xs bg-white"
              >
                <option value="">All Locations</option>
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="mb-4">
              <label className="input-label text-xs">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="input-field text-xs bg-white"
              >
                <option value="active">Available / Active</option>
                <option value="claimed">Claimed (Under Verification)</option>
                <option value="returned">Handed Over / Returned</option>
                <option value="">All Statuses</option>
              </select>
            </div>
          </div>

          {/* Quick Help box */}
          <div className="rounded-xl border border-primary-200/80 bg-primary-50/50 p-4">
            <h4 className="text-xs font-semibold text-primary-900 mb-1">Found something?</h4>
            <p className="text-2xs text-primary-800 leading-relaxed">
              If an item is in your possession, report it so the true owner can claim it safely through administrative verification.
            </p>
            <Link
              to="/report/found"
              className="inline-block mt-3 text-xs font-semibold text-primary-700 hover:text-primary-800 underline"
            >
              Report a found item →
            </Link>
          </div>
        </aside>

        {/* Results Area */}
        <section className="lg:col-span-3 space-y-6">
          {/* Top Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                placeholder="Search by keywords, model, serial..."
              />
            </div>

            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden btn-secondary btn-sm flex items-center justify-center gap-1.5"
            >
              <Filter className="w-4 h-4" />
              Filter Options {hasActiveFilters && '●'}
            </button>
          </div>

          {/* Mobile Filter drawer */}
          {mobileFiltersOpen && (
            <div className="lg:hidden card p-4 space-y-4 border-primary-200 bg-primary-50/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-surface-900">Filter Criteria</span>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="text-surface-400 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="input-label text-2xs">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field text-xs bg-white"
                  >
                    <option value="">All Categories</option>
                    {ITEM_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label text-2xs">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field text-xs bg-white"
                  >
                    <option value="">All Locations</option>
                    {CAMPUS_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label text-2xs">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field text-xs bg-white"
                  >
                    <option value="active">Available</option>
                    <option value="claimed">Claimed</option>
                    <option value="returned">Returned</option>
                    <option value="">All</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-2xs text-primary-600 font-semibold"
                >
                  Reset all filters
                </button>
              )}
            </div>
          )}

          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-surface-400 text-2xs uppercase tracking-wider font-semibold">
                Active:
              </span>
              {category && (
                <span className="badge bg-surface-200 text-surface-800 flex items-center gap-1">
                  Category: {category}
                  <button type="button" onClick={() => setCategory('')}>
                    <X className="w-3 h-3 hover:text-red-600" />
                  </button>
                </span>
              )}
              {location && (
                <span className="badge bg-surface-200 text-surface-800 flex items-center gap-1">
                  Location: {location}
                  <button type="button" onClick={() => setLocation('')}>
                    <X className="w-3 h-3 hover:text-red-600" />
                  </button>
                </span>
              )}
              {search && (
                <span className="badge bg-surface-200 text-surface-800 flex items-center gap-1">
                  Query: "{search}"
                  <button type="button" onClick={() => setSearch('')}>
                    <X className="w-3 h-3 hover:text-red-600" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Items Content */}
          {loading ? (
            <LoadingSpinner message="Searching noticeboard records..." />
          ) : items.length === 0 ? (
            <EmptyState
              icon={Package}
              title={`No ${reportType} items found`}
              description={
                hasActiveFilters
                  ? 'Try broadening your search keywords or resetting active filters.'
                  : `There are currently no ${reportType} items reported in this category.`
              }
              actionLabel={hasActiveFilters ? 'Reset Filters' : undefined}
              onAction={handleResetFilters}
            />
          ) : (
            <div className="space-y-6">
              <div className="text-xs text-surface-500 font-medium">
                Showing {items.length} of {totalCount} {reportType} reports
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
