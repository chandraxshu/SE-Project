import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import type { Item } from '@/types';
import { ITEM_CATEGORIES } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Package, ExternalLink, Eye, MapPin, Calendar, User, Mail, Phone, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export function AdminFoundItems() {
  const { fetchAllItems, deleteItem, loading } = useAdmin();
  const { user } = useAuth();

  const [items, setItems] = useState<Item[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Modal inspection state
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const PAGE_SIZE = 15;

  const loadItems = useCallback(async () => {
    try {
      const res = await fetchAllItems({
        report_type: 'found',
        search: search.trim() || undefined,
        category: category || undefined,
        status: status || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(res.items);
      setTotalCount(res.count);
    } catch (err) {
      console.error('Failed to load found items:', err);
    }
  }, [fetchAllItems, search, category, status, page]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !user) return;
    try {
      setIsDeleting(true);
      await deleteItem(itemToDelete.id, user.id, `Admin deletion of found item report: ${itemToDelete.title}`);
      toast.success('Found item report deleted successfully');
      setItemToDelete(null);
      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null);
      }
      loadItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-surface-900">
          Manage Found Items
        </h2>
        <p className="text-xs text-surface-500">
          Inspect all found item reports, reporter identities, and claim statuses.
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
            placeholder="Search by title, location..."
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
            <option value="active">Active</option>
            <option value="claimed">Claimed</option>
            <option value="returned">Returned</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-white overflow-hidden shadow-card">
        {loading ? (
          <LoadingSpinner message="Loading found items records..." />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No found items match criteria"
            description="Adjust your search filters or status selection."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50 text-surface-500 uppercase text-2xs font-semibold">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Reported By</th>
                    <th className="py-3 px-4">Date</th>
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
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="btn-ghost btn-sm text-xs p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Inspect Item Modal */}
      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title="Admin Item Inspection Record"
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-6 text-xs">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="badge bg-amber-100 text-amber-800 text-2xs uppercase">
                  {selectedItem.category}
                </span>
                <h3 className="text-lg font-bold font-display text-surface-900 mt-1">
                  {selectedItem.title}
                </h3>
                <p className="text-2xs text-surface-400 font-mono mt-0.5">
                  UUID: {selectedItem.id}
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

            {/* Reporter Full Details */}
            <div className="card p-4 bg-primary-50/30 border-primary-200 space-y-2">
              <span className="font-bold text-primary-900 text-xs">Reporter Identity</span>
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

            <div className="flex justify-between items-center pt-4 border-t border-surface-200">
              <button
                type="button"
                onClick={() => setItemToDelete(selectedItem)}
                className="btn-danger btn-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Found Item
              </button>

              <Link
                to={`/admin/claims?search=${encodeURIComponent(selectedItem.title)}`}
                className="btn-primary btn-sm"
              >
                Inspect Claims for this Item →
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Found Item Report?"
        message={`Are you sure you want to permanently delete the found item report "${itemToDelete?.title}"? Any associated claims will also be removed. This action cannot be undone and will be permanently recorded in the campus audit log.`}
        confirmLabel="Yes, Delete Item"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
