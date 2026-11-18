import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-elevated border border-surface-200">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-surface-400 hover:text-surface-600 rounded-lg p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 mb-4">
            {variant === 'danger' ? (
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-surface-900">{title}</h3>
              <p className="text-sm text-surface-500 mt-1">{message}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="btn-secondary btn-sm"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={variant === 'danger' ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}
            >
              {loading ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
