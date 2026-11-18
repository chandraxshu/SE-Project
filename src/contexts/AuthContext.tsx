import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  needsOnboarding: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_DOMAIN = 'iiita.ac.in';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // No profile found — user needs onboarding
        return null;
      }
      console.error('Error fetching profile:', fetchError.message);
      return null;
    }

    return data as Profile;
  }, []);

  const validateEmailDomain = useCallback((email: string | undefined): boolean => {
    if (!email) return false;
    return email.endsWith(`@${ALLOWED_DOMAIN}`);
  }, []);

  const handleAuthUser = useCallback(
    async (currentSession: Session | null) => {
      if (!currentSession?.user) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setNeedsOnboarding(false);
        setError(null);
        setLoading(false);
        return;
      }

      const currentUser = currentSession.user;

      // Validate email domain
      if (!validateEmailDomain(currentUser.email)) {
        setError('Only @iiita.ac.in email addresses are allowed. Please sign in with your IIITA account.');
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        setNeedsOnboarding(false);
        setLoading(false);
        return;
      }

      setError(null);
      setSession(currentSession);
      setUser(currentUser);

      // Fetch profile
      const userProfile = await fetchProfile(currentUser.id);
      if (userProfile) {
        setProfile(userProfile);
        setNeedsOnboarding(false);
      } else {
        setProfile(null);
        setNeedsOnboarding(true);
      }

      setLoading(false);
    },
    [fetchProfile, validateEmailDomain]
  );

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleAuthUser(initialSession);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, changedSession) => {
      handleAuthUser(changedSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthUser]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          hd: ALLOWED_DOMAIN,
        },
        redirectTo: window.location.origin,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      throw new Error(oauthError.message);
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      throw new Error(signOutError.message);
    }
    setSession(null);
    setUser(null);
    setProfile(null);
    setNeedsOnboarding(false);
    setError(null);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<Profile>) => {
      if (!user) {
        throw new Error('No authenticated user');
      }

      const updates = {
        ...data,
        id: user.id,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedProfile, error: upsertError } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' })
        .select('*')
        .single();

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      setProfile(updatedProfile as Profile);
      setNeedsOnboarding(false);
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    needsOnboarding,
    error,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
