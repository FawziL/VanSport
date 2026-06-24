import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/routes';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  setUser: () => {},
  ensureUserLoaded: async () => false,
  initialLoading: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await authService.me();
      return res?.user || res;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const me = await fetchMe();
      if (me) {
        setUser(me);
        setIsAuthenticated(true);
      }
      setInitialLoading(false);
    };
    checkSession();
  }, [fetchMe]);

  const login = async (email, password) => {
    await authService.signIn(email, password);
    const me = await fetchMe();
    setUser(me);
    setIsAuthenticated(true);
    return me;
  };

  const logout = async () => {
    try {
      await authService.signOut();
    } catch {
      // continue clearing state even if request fails
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  const ensureUserLoaded = useCallback(async () => {
    if (!isAuthenticated) return false;
    if (user) return true;
    const me = await fetchMe();
    if (me) {
      setUser(me);
      return true;
    }
    setIsAuthenticated(false);
    return false;
  }, [isAuthenticated, user, fetchMe]);

  const value = { user, isAuthenticated, login, logout, setUser, ensureUserLoaded, initialLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
