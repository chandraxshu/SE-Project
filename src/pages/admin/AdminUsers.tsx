import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import type { Profile } from '@/types';
import { SearchBar } from '@/components/ui/SearchBar';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users, Shield, GraduationCap, Mail, Phone, Calendar, UserCheck } from 'lucide-react';

export function AdminUsers() {
  const { fetchAllUsers, loading } = useAdmin();
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  }, [fetchAllUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.roll_number?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-surface-900">
          User & Student Registry
        </h2>
        <p className="text-xs text-surface-500">
          Directory of verified @iiita.ac.in accounts and their institutional profile data.
        </p>
      </div>

      {/* Search Bar */}
      <div className="card p-4 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <SearchBar
            value={search}
            onChange={(val) => setSearch(val)}
            placeholder="Search students by name, email, roll..."
          />
        </div>
        <span className="text-xs text-surface-500">
          {filteredUsers.length} registered students
        </span>
      </div>

      {/* Users Table */}
      <div className="card bg-white overflow-hidden shadow-card">
        {loading ? (
          <LoadingSpinner message="Loading user directory..." />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students found"
            description="No profiles match your search criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50 text-surface-500 uppercase text-2xs font-semibold">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-surface-900">
                      {u.full_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-surface-700">{u.roll_number}</td>
                    <td className="py-3 px-4 text-surface-600">{u.email}</td>
                    <td className="py-3 px-4 text-surface-600">{u.department}</td>
                    <td className="py-3 px-4 text-surface-600">Batch {u.academic_batch}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`badge ${
                          u.role === 'admin'
                            ? 'bg-primary-100 text-primary-800 border-primary-200 font-bold'
                            : 'bg-surface-100 text-surface-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className="btn-ghost btn-sm text-xs font-semibold text-primary-600"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title="Student Institutional Profile"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-surface-100">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-800 font-bold text-lg flex items-center justify-center font-display">
                {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-base font-bold text-surface-900">
                  {selectedUser.full_name}
                </h3>
                <p className="text-2xs text-surface-400 font-mono">
                  {selectedUser.roll_number} • {selectedUser.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-surface-700">
              <div>
                <span className="text-surface-400 block mb-0.5">Department</span>
                <span className="font-semibold text-surface-900">{selectedUser.department}</span>
              </div>
              <div>
                <span className="text-surface-400 block mb-0.5">Academic Batch</span>
                <span className="font-semibold text-surface-900">
                  Batch {selectedUser.academic_batch}
                </span>
              </div>
              <div>
                <span className="text-surface-400 block mb-0.5">Contact Number</span>
                <span className="font-semibold text-surface-900">
                  {selectedUser.phone || 'None provided'}
                </span>
              </div>
              <div>
                <span className="text-surface-400 block mb-0.5">System Role</span>
                <span className="font-bold text-primary-700 capitalize">
                  {selectedUser.role}
                </span>
              </div>
              <div>
                <span className="text-surface-400 block mb-0.5">Account Created</span>
                <span className="text-surface-900">
                  {new Date(selectedUser.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-surface-400 block mb-0.5">User ID (Auth)</span>
                <span className="font-mono text-2xs text-surface-600 truncate block">
                  {selectedUser.id}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-surface-100 p-3 text-2xs text-surface-500 leading-relaxed">
              <Shield className="w-3.5 h-3.5 text-accent-600 inline mr-1" />
              Role escalation is protected by PostgreSQL RLS. Students cannot elevate their own role. Administrative privileges must be granted directly via database migrations or Supabase SQL console.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
