import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-surface-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center text-white text-xs font-bold font-display">
              ख
            </div>
            <span className="text-sm font-semibold text-surface-900 font-display">
              Khoj — IIITA Lost & Found
            </span>
          </div>

          <p className="text-xs text-surface-500 text-center flex items-center gap-1">
            Built for Indian Institute of Information Technology Allahabad (IIITA)
          </p>

          <div className="flex items-center gap-4 text-xs text-surface-500">
            <span>© {currentYear} IIIT Allahabad</span>
            <span className="text-surface-300">•</span>
            <span className="flex items-center gap-1 text-surface-400">
              <Shield className="w-3.5 h-3.5 text-accent-600" />
              Verified Campus Portal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
