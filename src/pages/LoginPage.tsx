import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, AlertCircle, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const { user, needsOnboarding, signInWithGoogle, error: authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  if (user && !needsOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  if (user && needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await signInWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  const displayError = authError || errorMessage;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card p-8 sm:p-10 shadow-elevated">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white mx-auto mb-3 shadow-xs">
              <span className="font-display font-bold text-2xl">ख</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-surface-900">
              Khoj — IIITA
            </h1>
            <p className="text-xs text-surface-500 mt-1 font-medium">
              Campus Lost & Found Platform
            </p>
          </div>

          {/* Institutional restriction badge */}
          <div className="rounded-lg bg-amber-50 border border-amber-200/80 p-3 mb-6 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">Institutional Access Only:</span> Only verified accounts ending in{' '}
              <code className="px-1 py-0.5 rounded bg-amber-100 font-mono text-2xs font-semibold text-amber-900">
                @iiita.ac.in
              </code>{' '}
              are permitted to sign in.
            </div>
          </div>

          {/* Error Banner */}
          {displayError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-6 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">{displayError}</p>
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-surface-300 rounded-xl bg-white hover:bg-surface-50 text-surface-700 font-semibold text-sm shadow-xs transition-colors duration-150 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            {loading ? 'Connecting to IIITA Google...' : 'Continue with IIITA Google Account'}
          </button>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-surface-100 text-center text-xs text-surface-400">
            Personal Google accounts (@gmail.com) are automatically rejected by server-side domain verification.
          </div>
        </div>
      </div>
    </div>
  );
}
