import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadClaimEvidence } from '@/services/storage';
import type { Claim } from '@/types';

interface CreateClaimData {
  item_id: string;
  claimant_id: string;
  claim_message: string;
  proof_details?: string;
  location_lost?: string;
  date_lost?: string;
}

export function useClaims() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaimsForItem = useCallback(async (itemId: string): Promise<Claim[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('claims')
        .select(`
          *,
          claimant:profiles!claims_claimant_id_fkey(full_name, email, roll_number, department)
        `)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      return (data as Claim[]) ?? [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch claims';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyClaims = useCallback(async (userId: string): Promise<Claim[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('claims')
        .select(`
          *,
          item:items!claims_item_id_fkey(id, title, category, photo_url, status, location)
        `)
        .eq('claimant_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      return (data as Claim[]) ?? [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch your claims';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createClaim = useCallback(
    async (data: CreateClaimData, photo?: File | null): Promise<Claim> => {
      setLoading(true);
      setError(null);

      try {
        // Insert the claim
        const { data: newClaim, error: insertError } = await supabase
          .from('claims')
          .insert({
            item_id: data.item_id,
            claimant_id: data.claimant_id,
            claim_message: data.claim_message,
            proof_details: data.proof_details ?? null,
            location_lost: data.location_lost ?? null,
            date_lost: data.date_lost || null,
            status: 'pending_review',
          })
          .select('*')
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        const claim = newClaim as Claim;

        // Upload proof photo if provided
        if (photo) {
          const evidenceUrl = await uploadClaimEvidence(photo, claim.id);

          const { data: updatedClaim, error: updateError } = await supabase
            .from('claims')
            .update({ proof_photo_url: evidenceUrl })
            .eq('id', claim.id)
            .select('*')
            .single();

          if (updateError) {
            throw new Error(updateError.message);
          }

          return updatedClaim as Claim;
        }

        return claim;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create claim';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const checkExistingClaim = useCallback(
    async (itemId: string, userId: string): Promise<boolean> => {
      try {
        const { data, error: checkError } = await supabase
          .from('claims')
          .select('id')
          .eq('item_id', itemId)
          .eq('claimant_id', userId)
          .in('status', ['pending_review', 'approved', 'awaiting_handover'])
          .limit(1);

        if (checkError) {
          throw new Error(checkError.message);
        }

        return (data?.length ?? 0) > 0;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to check existing claim';
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  const approveClaim = useCallback(
    async (claimId: string, adminId: string, note?: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        // Fetch claim details
        const { data: claim, error: claimError } = await supabase
          .from('claims')
          .select('*, item:items!claims_item_id_fkey(id, title, reported_by)')
          .eq('id', claimId)
          .single();

        if (claimError) {
          throw new Error(claimError.message);
        }

        const claimData = claim as Claim & { item: { id: string; title: string; reported_by: string } };

        // 1. Update this claim to awaiting_handover
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

        // 2. Update item status to 'claimed'
        const { error: itemUpdateError } = await supabase
          .from('items')
          .update({ status: 'claimed' })
          .eq('id', claimData.item_id);

        if (itemUpdateError) {
          console.error('Error updating item status:', itemUpdateError.message);
        }

        // 3. Reject other pending claims for this item
        const { error: rejectError } = await supabase
          .from('claims')
          .update({
            status: 'rejected',
            review_note: 'Another claim for this item was approved.',
            reviewed_by: adminId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('item_id', claimData.item_id)
          .neq('id', claimId)
          .eq('status', 'pending_review');

        if (rejectError) {
          console.error('Error rejecting other claims:', rejectError.message);
        }

        // 4. Create audit log
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

        // 5. Notify the claimant
        await supabase.from('notifications').insert({
          user_id: claimData.claimant_id,
          title: 'Claim Approved!',
          message: `Your claim for "${claimData.item?.title ?? 'an item'}" has been approved. It is now awaiting physical handover.`,
          type: 'claim_approved',
          related_item_id: claimData.item_id,
          related_claim_id: claimId,
        });

        // 6. Notify the item reporter
        if (claimData.item?.reported_by) {
          await supabase.from('notifications').insert({
            user_id: claimData.item.reported_by,
            title: 'Claim Approved on Your Found Item',
            message: `A claim on the item you reported ("${claimData.item.title}") has been verified and approved.`,
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
          title: 'Claim Update',
          message: message ?? `Your claim for "${claimData.item?.title ?? 'an item'}" was reviewed and not approved.${note ? ` Note: ${note}` : ''}`,
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

        // Update claim to returned
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

        // Update item to returned
        const { error: itemUpdateError } = await supabase
          .from('items')
          .update({ status: 'returned' })
          .eq('id', claimData.item_id);

        if (itemUpdateError) {
          console.error('Error updating item status:', itemUpdateError.message);
        }

        // Audit log
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

        // Notify claimant
        await supabase.from('notifications').insert({
          user_id: claimData.claimant_id,
          title: 'Handover Completed',
          message: `The item "${claimData.item?.title ?? 'an item'}" has been successfully handed over. Thank you for using Khoj!`,
          type: 'item_returned',
          related_item_id: claimData.item_id,
          related_claim_id: claimId,
        });

        // Notify reporter
        if (claimData.item?.reported_by) {
          await supabase.from('notifications').insert({
            user_id: claimData.item.reported_by,
            title: 'Item Return Complete',
            message: `The item you found ("${claimData.item.title}") has been returned to its owner. Great job!`,
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

  return {
    loading,
    error,
    fetchClaimsForItem,
    fetchMyClaims,
    createClaim,
    checkExistingClaim,
    approveClaim,
    rejectClaim,
    confirmHandover,
  };
}
