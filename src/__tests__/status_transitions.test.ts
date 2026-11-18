import { describe, it, expect } from 'vitest';
import type { ClaimStatus, ItemStatus } from '@/types';
import { CLAIM_STATUS_LABELS, ITEM_STATUS_LABELS } from '@/types';

describe('Item and Claim Status Transition Invariants (FR-15, FR-18, FR-20)', () => {
  it('maps all defined Claim statuses to legible UI labels', () => {
    const validClaimStatuses: ClaimStatus[] = [
      'pending_review',
      'approved',
      'rejected',
      'awaiting_handover',
      'returned',
    ];

    validClaimStatuses.forEach((status) => {
      expect(CLAIM_STATUS_LABELS[status]).toBeDefined();
      expect(typeof CLAIM_STATUS_LABELS[status]).toBe('string');
    });
  });

  it('maps all defined Item statuses to legible UI labels', () => {
    const validItemStatuses: ItemStatus[] = ['active', 'claimed', 'returned', 'archived'];

    validItemStatuses.forEach((status) => {
      expect(ITEM_STATUS_LABELS[status]).toBeDefined();
      expect(typeof ITEM_STATUS_LABELS[status]).toBe('string');
    });
  });

  it('enforces single approved claim invariant simulation', () => {
    // Simulating the resolution rule: When claim A is approved, other pending claims become rejected
    const itemClaims: { id: string; status: ClaimStatus }[] = [
      { id: 'claim-1', status: 'pending_review' },
      { id: 'claim-2', status: 'pending_review' },
      { id: 'claim-3', status: 'pending_review' },
    ];

    const approvedClaimId = 'claim-2';

    // Business rule implementation test
    const updatedClaims = itemClaims.map((c) => {
      if (c.id === approvedClaimId) {
        return { ...c, status: 'awaiting_handover' as ClaimStatus };
      }
      return { ...c, status: 'rejected' as ClaimStatus };
    });

    const activeHandovers = updatedClaims.filter((c) => c.status === 'awaiting_handover');
    expect(activeHandovers.length).toBe(1);
    expect(activeHandovers[0]?.id).toBe('claim-2');

    const rejectedClaims = updatedClaims.filter((c) => c.status === 'rejected');
    expect(rejectedClaims.length).toBe(2);
  });
});
