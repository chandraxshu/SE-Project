import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import type { Item } from '@/types';
import { ITEM_CATEGORIES } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertCircle, ExternalLink, Eye, MapPin, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminLostItems() {
  const { fetchAllItems, loading } = useAdmin();

  const [items, setItems] = useState<Item[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const PAGE_SIZE = 15;

  const loadItems = useCallback(async () => {
    try {
      const res = await fetchAllItems({
        report_type: 'lost',
        search: search.trim() || undefined,
        category: category || undefined,
        status: status || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(res.items);
      setTotalCount(res.count);
    } catch (err) {
      console.error('Failed to load lost items:', err);
    }
  }, [fetchAllItems, search, category, status, page]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-surface-900">
          Manage Lost Item Reports
        </h2>
        <p className="text-xs text-surface-500">
          View registered lost notices submitted by students and security records.
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
            placeholder="Search lost reports..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="input-field text-xs py-2 bg-white"
          >
            <option value="">All Categories</option>
            {ITEM_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="input-field text-xs py-2 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="active">Active (Searching)</option>
            <option value="returned">Found / Resolved</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-white overflow-hidden shadow-card">
        {loading ? (
          <LoadingSpinner message="Loading lost notices..." />
        ) : items.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No lost reports match criteria"
            description="Adjust your search query or category filters."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50 text-surface-500 uppercase text-2xs font-semibold">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Last Location</th>
                    <th className="py-3 px-4">Reported By</th>
                    <th className="py-3 px-4">Date Lost</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-surface-900 max-w-[180px] truncate">
                        {item.title}
                      </td>
                      <td className="py-3 px-4 text-surface-600 capitalize">{item.category}</td>
                      <td className="py-3 px-4 text-surface-600 truncate max-w-[140px]">
                        {item.location}
                      </td>
                      <td className="py-3 px-4 text-surface-700">
                        <div className="font-medium text-surface-900 truncate">
                          {item.reporter?.full_name || 'Student'}
                        </div>
                        <div className="text-2xs text-surface-400 font-mono truncate">
                          {item.reporter?.roll_number}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-surface-600 whitespace-nowrap">
                        {item.date_occurred}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} type="item" size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="btn-ghost btn-sm text-xs p-1.5"
                          title="Inspect Details"
                        >
                          <Eye className="w-4 h-4 text-surface-500" />
                        </button>
                        <Link
                          to={`/items/${item.id}`}
                          className="btn-ghost btn-sm text-xs p-1.5"
                          title="Public Listing"
                        >
                          <ExternalLink className="w-4 h-4 text-surface-500" />
                        </Link>
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

      {/* Inspect Lost Item Modal */}
      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title="Admin Lost Notice Inspection"
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-6 text-xs">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="badge bg-blue-100 text-blue-800 text-2xs uppercase">
                  {selectedItem.category}
                </span>
                <h3 className="text-lg font-bold font-display text-surface-900 mt-1">
                  {selectedItem.title}
                </h3>
                <p className="text-2xs text-surface-400 font-mono mt-0.5">
                  ID: {selectedItem.id}
                </p>
              </div>
              <StatusBadge status={selectedItem.status} type="item" />
            </div>

            {selectedItem.photo_url && (
              <div className="w-full max-h-56 bg-surface-100 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={selectedItem.photo_url}
                  alt={selectedItem.title}
                  className="max-h-56 object-contain"
                />
              </div>
            )}

            <div className="space-y-2">
              <span className="font-bold text-surface-700 uppercase tracking-wider text-2xs">
                Description
              </span>
              <p className="p-3 bg-surface-50 rounded-lg text-surface-800 leading-relaxed">
                {selectedItem.description}
              </p>
            </div>

            {selectedItem.distinguishing_details && (
              <div className="space-y-2">
                <span className="font-bold text-surface-700 uppercase tracking-wider text-2xs">
                  Distinguishing Features
                </span>
                <p className="p-3 bg-surface-50 rounded-lg text-surface-800 leading-relaxed">
                  {selectedItem.distinguishing_details}
                </p>
              </div>
            )}

            <div className="card p-4 bg-blue-50/40 border-blue-200 space-y-2">
              <span className="font-bold text-blue-900 text-xs">Student Contact Details</span>
              <div className="grid grid-cols-2 gap-2 text-surface-700">
                <div>
                  <span className="text-surface-400 block">Name</span>
                  <span className="font-semibold text-surface-900">
                    {selectedItem.reporter?.full_name}
                  </span>
                </div>
                <div>
                  <span className="text-surface-400 block">Roll Number</span>
                  <span className="font-mono font-semibold text-surface-900">
                    {selectedItem.reporter?.roll_number}
                  </span>
                </div>
                <div>
                  <span className="text-surface-400 block">Email</span>
                  <span className="text-surface-900">{selectedItem.reporter?.email}</span>
                </div>
                <div>
                  <span className="text-surface-400 block">Department</span>
                  <span className="text-surface-900">{selectedItem.reporter?.department}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
