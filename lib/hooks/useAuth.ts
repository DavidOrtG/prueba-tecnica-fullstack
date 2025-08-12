import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

interface Session {
  user: User;
  expires: string;
}

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setSession(data);
      }
    } catch {
      // Session check failed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const isAdmin = session?.user?.role === 'ADMIN';

  return {
    session,
    loading,
    isAdmin,
    checkSession,
  };
};
