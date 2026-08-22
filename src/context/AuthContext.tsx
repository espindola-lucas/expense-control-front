import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthUser } from '../types';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Reads the persisted session synchronously so the very first render already knows
// whether there's a user — avoids a redirect race in ProtectedRoute/GuestRoute where
// routing decisions would be made before an async restore had a chance to run.
function restoreUser(): AuthUser | null {
  const storedUser = localStorage.getItem('auth_user');
  if (!localStorage.getItem('auth_token') || !storedUser) {
    return null;
  }
  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(restoreUser);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // The API client dispatches this when a request comes back 401 (expired/invalid token)
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const data = await apiLogin({ email, password });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      setUser(data.user);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (localStorage.getItem('auth_token')) {
      try {
        await apiLogout();
      } catch {
        /* ignore network errors on logout */
      }
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
