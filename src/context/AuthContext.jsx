import { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { OWNER_EMAIL } from '../config';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null); // 'pending' | 'approved' | 'rejected'
  const [loading, setLoading] = useState(true);

  // Load the approval status for the given user from renttrack_users.
  const loadStatus = useCallback(async (u) => {
    if (!u) {
      setStatus(null);
      return;
    }
    // The owner is always approved, no DB lookup needed.
    if (u.email === OWNER_EMAIL) {
      setStatus('approved');
      return;
    }
    const { data } = await supabase
      .from('renttrack_users')
      .select('status')
      .eq('id', u.id)
      .maybeSingle();
    setStatus(data?.status || 'pending');
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user || null;
      setUser(u);
      await loadStatus(u);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user || null;
      setUser(u);
      await loadStatus(u);
    });

    return () => subscription?.unsubscribe();
  }, [loadStatus]);

  const refreshStatus = useCallback(() => loadStatus(user), [user, loadStatus]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStatus(null);
  };

  const isOwner = user?.email === OWNER_EMAIL;

  return (
    <AuthContext.Provider value={{ user, status, isOwner, loading, logout, refreshStatus }}>
      {children}
    </AuthContext.Provider>
  );
}
