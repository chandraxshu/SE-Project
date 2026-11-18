import React from 'react';
import type { ItemStatus, ClaimStatus } from '@/types';
import { ITEM_STATUS_LABELS, CLAIM_STATUS_LABELS } from '@/types';

interface StatusBadgeProps {
  status: ItemStatus | ClaimStatus | string;
  type?: 'item' | 'claim';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, type = 'item', size = 'md' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-2xs px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  if (type === 'item') {
    const label = ITEM_STATUS_LABELS[status as ItemStatus] || status;
    switch (status) {
      case 'active':
        return <span className={`badge-available ${sizeClass}`}>● {label}</span>;
      case 'claimed':
        return <span className={`badge-claimed ${sizeClass}`}>● {label}</span>;
      case 'returned':
        return <span className={`badge-returned ${sizeClass}`}>✓ {label}</span>;
      case 'archived':
        return <span className={`badge bg-surface-100 text-surface-600 border border-surface-200 ${sizeClass}`}>- {label}</span>;
      default:
        return <span className={`badge bg-surface-100 text-surface-700 ${sizeClass}`}>{label}</span>;
    }
  }

  // Claim status
  const label = CLAIM_STATUS_LABELS[status as ClaimStatus] || status;
  switch (status) {
    case 'pending_review':
      return <span className={`badge-pending ${sizeClass}`}>⏳ {label}</span>;
    case 'approved':
      return <span className={`badge-approved ${sizeClass}`}>✓ {label}</span>;
    case 'rejected':
      return <span className={`badge-rejected ${sizeClass}`}>✕ {label}</span>;
    case 'awaiting_handover':
      return <span className={`badge bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClass}`}>📦 {label}</span>;
    case 'returned':
      return <span className={`badge-returned ${sizeClass}`}>✓ {label}</span>;
    default:
      return <span className={`badge bg-surface-100 text-surface-700 ${sizeClass}`}>{label}</span>;
  }
}
