import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Item, Claim, Profile, AuditLog } from '@/types';

interface DashboardStats {
  totalItems: number;
  activeItems: number;
  returnedItems: number;
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  awaitingHandoverClaims: number;
  totalUsers: number;
  lostItems: number;
  foundItems: number;
}

interface AdminFilters {
  status?: string;
  category?: string;
  search?: string;
  report_type?: 'lost' | 'found';
  page?: number;
  pageSize?: number;
}

interface AdminClaimFilters {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async (): Promise<DashboardStats> => {
    setLoading(true);
    setError(null);

    try {
      const [
        itemsResult,
        activeItemsResult,
        returnedItemsResult,
        lostItemsResult,
        foundItemsResult,
        claimsResult,
        pendingClaimsResult,
        approvedClaimsResult,
        awaitingHandoverClaimsResult,
        usersResult,
      ] = await Promise.all([
        supabase.from('items').select('*', { count: 'exact', head: true }),
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'returned'),
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('report_type', 'lost'),
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('report_type', 'found'),
        supabase.from('claims').select('*', { count: 'exact', head: true }),
        supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'awaiting_handover'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalItems: itemsResult.count ?? 0,
        activeItems: activeItemsResult.count ?? 0,
        returnedItems: returnedItemsResult.count ?? 0,
        totalClaims: claimsResult.count ?? 0,
        pendingClaims: pendingClaimsResult.count ?? 0,
        approvedClaims: approvedClaimsResult.count ?? 0,
        awaitingHandoverClaims: awaitingHandoverClaimsResult.count ?? 0,
        totalUsers: usersResult.count ?? 0,
        lostItems: lostItemsResult.count ?? 0,
        foundItems: foundItemsResult.count ?? 0,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard stats';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllItems = useCallback(
    async (filters: AdminFilters = {}): Promise<{ items: Item[]; count: number }> => {
      setLoading(true);
      setError(null);

      try {
        const { status, category, search, report_type, page = 1, pageSize = 20 } = filters;

        let query = supabase
          .from('items')
          .select('*, reporter:profiles!items_reported_by_fkey(full_name, email, roll_number, department)', {
            count: 'exact',
          });

        if (status) {
          query = query.eq('status', status);
        }

        if (category) {
          query = query.eq('category', category);
        }

        if (report_type) {
          query = query.eq('report_type', report_type);
        }

        if (search) {
          query = query.or(
            `title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`
          );
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        query = query.order('created_at', { ascending: false }).range(from, to);

        const { data, error: fetchError, count } = await query;

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        return {
          items: (data as Item[]) ?? [],
          count: count ?? 0,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch items';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchAllClaims = useCallback(
    async (filters: AdminClaimFilters = {}): Promise<{ claims: Claim[]; count: number }> => {
      setLoading(true);
      setError(null);

      try {
        const { status, search, page = 1, pageSize = 20 } = filters;

        let query = supabase.from('claims').select(
          `
            *,
            item:items!claims_item_id_fkey(id, title, category, photo_url, status, location, reported_by),
            claimant:profiles!claims_claimant_id_fkey(full_name, email, roll_number, department)
          `,
          { count: 'exact' }
        );

        if (status) {
          query = query.eq('status', status);
        }

        if (search) {
          query = query.or(
            `claim_message.ilike.%${search}%,proof_details.ilike.%${search}%`
          );
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        query = query.order('created_at', { ascending: false }).range(from, to);

        const { data, error: fetchError, count } = await query;

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        return {
          claims: (data as Claim[]) ?? [],
          count: count ?? 0,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch claims';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchAllUsers = useCallback(async (): Promise<Profile[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      return (data as Profile[]) ?? [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(
    async (page = 1, pageSize = 20): Promise<{ logs: AuditLog[]; count: number }> => {
      setLoading(true);
      setError(null);

      try {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error: fetchError, count } = await supabase
          .from('audit_logs')
          .select(
            `
              *,
              performer:profiles!audit_logs_performed_by_fkey(full_name, email)
            `,
            { count: 'exact' }
          )
          .order('created_at', { ascending: false })
          .range(from, to);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        return {
          logs: (data as AuditLog[]) ?? [],
          count: count ?? 0,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch audit logs';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const approveClaim = useCallback(
    async (claimId: string, adminId: string, note?: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const { data: claim, error: claimError } = await supabase
          .from('claims')
          .select('*, item:items!claims_item_id_fkey(id, title, reported_by)')
          .eq('id', claimId)
          .single();

        if (claimError) {
          throw new Error(claimError.message);
        }

        const claimData = claim as Claim & { item: { id: string; title: string; reported_by: string } };

        // 1. Move claim to awaiting_handover
        const { error: updateError } = await supabase
          .from('claims')
          .update({
            status: 'awaiting_handover',
            review_note: note ?? null,
            reviewed_by: adminId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', claimId);

        if (updateError) {
          throw new Error(updateError.message);
        }

        // 2. Mark item as claimed
        await supabase
          .from('items')
          .update({ status: 'claimed' })
          .eq('id', claimData.item_id);

        // 3. Reject other pending claims for this item
        await supabase
          .from('claims')
          .update({
            status: 'rejected',
            review_note: 'Another claim was approved for this item.',
            reviewed_by: adminId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('item_id', claimData.item_id)
          .neq('id', claimId)
          .eq('status', 'pending_review');

        // 4. Audit log
        await supabase.from('audit_logs').insert({
          action: 'claim_approved',
          performed_by: adminId,
          entity_type: 'claim',
          entity_id: claimId,
          details: {
            item_id: claimData.item_id,
            claimant_id: claimData.claimant_id,
            note: note ?? null,
          },
        });

        // 5. Notify claimant
        await supabase.from('notifications').insert({
          user_id: claimData.claimant_id,
          title: 'Claim Approved!',
          message: `Your claim for "${claimData.item?.title ?? 'an item'}" has been approved. Please visit the admin desk for physical handover.`,
          type: 'claim_approved',
          related_item_id: claimData.item_id,
          related_claim_id: claimId,
        });

        // 6. Notify reporter
        if (claimData.item?.reported_by) {
          await supabase.from('notifications').insert({
            user_id: claimData.item.reported_by,
            title: 'Claim Approved on Your Item',
            message: `A claim for your reported item "${claimData.item.title}" has been verified and approved.`,
            type: 'claim_approved',
            related_item_id: claimData.item_id,
            related_claim_id: claimId,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to approve claim';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const rejectClaim = useCallback(
    async (claimId: string, adminId: string, note?: string, message?: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const { data: claim, error: claimError } = await supabase
          .from('claims')
          .select('*, item:items!claims_item_id_fkey(id, title)')
          .eq('id', claimId)
          .single();

        if (claimError) {
          throw new Error(claimError.message);
        }

        const claimData = claim as Claim & { item: { id: string; title: string } };

        const { error: updateError } = await supabase
          .from('claims')
          .update({
            status: 'rejected',
            review_note: note ?? null,
            admin_message: message ?? null,
            reviewed_by: adminId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', claimId);

        if (updateError) {
          throw new Error(updateError.message);
        }

        await supabase.from('audit_logs').insert({
          action: 'claim_rejected',
          performed_by: adminId,
          entity_type: 'claim',
          entity_id: claimId,
          details: {
            item_id: claimData.item_id,
            claimant_id: claimData.claimant_id,
            note: note ?? null,
            admin_message: message ?? null,
          },
        });

        await supabase.from('notifications').insert({
          user_id: claimData.claimant_id,
          title: 'Claim Rejected',
          message: message ?? `Your claim for "${claimData.item?.title ?? 'an item'}" has been rejected.${note ? ` Reason: ${note}` : ''}`,
          type: 'claim_rejected',
          related_item_id: claimData.item_id,
          related_claim_id: claimId,
        });
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to reject claim';
        setError(errMessage);
        throw new Error(errMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const confirmHandover = useCallback(
    async (
      claimId: string,
      adminId: string,
      recipientName: string,
      recipientRoll: string
    ): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const { data: claim, error: claimError } = await supabase
          .from('claims')
          .select('*, item:items!claims_item_id_fkey(id, title, reported_by)')
          .eq('id', claimId)
          .single();

        if (claimError) {
          throw new Error(claimError.message);
        }

        const claimData = claim as Claim & { item: { id: string; title: string; reported_by: string } };

        const { error: claimUpdateError } = await supabase
          .from('claims')
          .update({
            status: 'returned',
            handover_confirmed_at: new Date().toISOString(),
            handover_confirmed_by: adminId,
            recipient_name: recipientName,
            recipient_roll_number: recipientRoll,
          })
          .eq('id', claimId);

        if (claimUpdateError) {
          throw new Error(claimUpdateError.message);
        }

        const { error: itemUpdateError } = await supabase
          .from('items')
          .update({ status: 'returned' })
          .eq('id', claimData.item_id);

        if (itemUpdateError) {
          console.error('Error updating item status:', itemUpdateError.message);
        }

        await supabase.from('audit_logs').insert({
          action: 'handover_confirmed',
          performed_by: adminId,
          entity_type: 'claim',
          entity_id: claimId,
          details: {
            item_id: claimData.item_id,
            claimant_id: claimData.claimant_id,
            recipient_name: recipientName,
            recipient_roll_number: recipientRoll,
          },
        });

        await supabase.from('notifications').insert({
          user_id: claimData.claimant_id,
          title: 'Item Handed Over',
          message: `The item "${claimData.item?.title ?? 'an item'}" has been successfully handed over. Thank you for using Khoj!`,
          type: 'item_returned',
          related_item_id: claimData.item_id,
          related_claim_id: claimId,
        });

        if (claimData.item?.reported_by) {
          await supabase.from('notifications').insert({
            user_id: claimData.item.reported_by,
            title: 'Item Resolved',
            message: `Your item "${claimData.item.title}" has been successfully resolved and handed over.`,
            type: 'item_returned',
            related_item_id: claimData.item_id,
            related_claim_id: claimId,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to confirm handover';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteItem = useCallback(
    async (itemId: string, adminId: string, reason?: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        // 1. Audit log before deletion
        await supabase.from('audit_logs').insert({
          action: 'item_deleted',
          performed_by: adminId,
          entity_type: 'item',
          entity_id: itemId,
          details: {
            reason: reason || 'Deleted by campus admin',
          },
        });

        // 2. Delete item
        const { error: deleteError } = await supabase
          .from('items')
          .delete()
          .eq('id', itemId);

        if (deleteError) {
          throw new Error(deleteError.message);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete item';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    fetchDashboardStats,
    fetchAllItems,
    fetchAllClaims,
    fetchAllUsers,
    fetchAuditLogs,
    approveClaim,
    rejectClaim,
    confirmHandover,
    deleteItem,
  };
}
