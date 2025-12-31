import { useState, useEffect, useCallback } from 'react';
import { ADMIN_CONFIG, verifyPassword } from './admin-config';

interface AdminSession {
  isAuthenticated: boolean;
  loginTime: number | null;
  lastActivity: number | null;
}

const ADMIN_SESSION_KEY = 'youtube_admin_session';

export const useAdminAuth = () => {
  const [session, setSession] = useState<AdminSession>(() => {
    // Restore session from localStorage
    const saved = localStorage.getItem(ADMIN_SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check if session is still valid
        if (parsed.loginTime && 
            Date.now() - parsed.loginTime < ADMIN_CONFIG.SESSION_TIMEOUT) {
          return { ...parsed, isAuthenticated: true };
        }
      } catch (e) {
        console.error('Failed to parse session:', e);
      }
    }
    return { isAuthenticated: false, loginTime: null, lastActivity: null };
  });

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => {
      if (session.isAuthenticated) {
        setSession(prev => ({ ...prev, lastActivity: Date.now() }));
      }
    };

    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('mousemove', updateActivity);

    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('mousemove', updateActivity);
    };
  }, [session.isAuthenticated]);

  // Auto-logout on inactivity
  useEffect(() => {
    if (!session.isAuthenticated || !session.lastActivity) return;

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const checkInactivity = () => {
      if (Date.now() - session.lastActivity! > INACTIVITY_TIMEOUT) {
        logout();
      }
    };

    const interval = setInterval(checkInactivity, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [session.isAuthenticated, session.lastActivity]);

  const login = useCallback(async (password: string): Promise<boolean> => {
    const isValid = await verifyPassword(password);
    
    if (isValid) {
      const newSession = {
        isAuthenticated: true,
        loginTime: Date.now(),
        lastActivity: Date.now()
      };
      setSession(newSession);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(newSession));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setSession({ isAuthenticated: false, loginTime: null, lastActivity: null });
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (session.isAuthenticated) {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    }
  }, [session]);

  return {
    isAuthenticated: session.isAuthenticated,
    login,
    logout,
    sessionTime: session.loginTime ? Date.now() - session.loginTime : 0
  };
};
