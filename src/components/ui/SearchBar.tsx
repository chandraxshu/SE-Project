import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search by item name, keyword, or location...',
  onSearch,
  className = '',
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 text-sm bg-white border border-surface-300 rounded-lg placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
