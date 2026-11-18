import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-surface-300 bg-white/50">
      <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center text-surface-500 mb-4">
        <Icon className="w-7 h-7" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-surface-900 mb-1">{title}</h3>
      <p className="text-sm text-surface-500 max-w-sm mb-6">{description}</p>
      {actionLabel && (
        actionHref ? (
          <a href={actionHref} className="btn-primary btn-sm">
            {actionLabel}
          </a>
        ) : (
          <button type="button" onClick={onAction} className="btn-primary btn-sm">
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
