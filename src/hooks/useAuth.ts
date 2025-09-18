import { useState, useEffect, useCallback } from 'react';
import { logout as apiLogout } from '../api/auth';

export type SessionData = {
  token: string;
  user?: { userId: number; role: string; username: string };
  expires_at?: number | null;
};

export function useAuth() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    try {
      const storedSession = localStorage.getItem('session');
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        // Check if session is expired
        if (
          parsedSession.expires_at &&
          parsedSession.expires_at < Date.now() / 1000
        ) {
          localStorage.removeItem('session');
          setSession(null);
        } else {
          setSession(parsedSession);
        }
      }
    } catch (error) {
      localStorage.removeItem('session');
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('session');
      setSession(null);
    }
  }, [session]);

  const updateSession = useCallback((newSession: SessionData) => {
    localStorage.setItem('session', JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  return {
    session,
    isAuthenticated: !!session,
    isLoading,
    logout,
    updateSession,
  };
}
