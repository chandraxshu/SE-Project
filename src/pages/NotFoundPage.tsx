import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 font-display font-bold text-2xl flex items-center justify-center mx-auto mb-4">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-surface-900">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 mt-2 leading-relaxed">
          The notice or page you are looking for does not exist on the IIITA Lost & Found noticeboard.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link to="/" className="btn-primary btn-sm flex items-center gap-1.5">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link to="/browse" className="btn-secondary btn-sm flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            Browse Items
          </Link>
        </div>
      </div>
    </div>
  );
}
