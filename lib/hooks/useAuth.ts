import { useEffect, useState } from 'react';
import { Session } from '../types';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setSession(data);
        } else {
          // No session found, user is not authenticated
          setSession(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setSession(null);
      } finally {
        // Always set loading to false after the request completes
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      setSession(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = session?.user?.role === 'ADMIN';
  const isAuthenticated = !!session;

  return {
    session,
    loading,
    signOut,
    isAdmin,
    isAuthenticated,
  };
}
