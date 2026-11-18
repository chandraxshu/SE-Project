import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-surface-200 border-t-primary-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && <p className="text-sm font-medium text-surface-500">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        {spinner}
      </div>
    );
  }

  return <div className="py-8 flex items-center justify-center">{spinner}</div>;
}
