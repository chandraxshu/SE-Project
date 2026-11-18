import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-between border-t border-surface-200 px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:justify-end gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="btn-secondary btn-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="inline-flex items-center px-4 py-1.5 text-xs font-medium text-surface-600 bg-surface-100 rounded-lg">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="btn-secondary btn-sm"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
