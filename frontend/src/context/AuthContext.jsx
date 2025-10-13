import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    try {
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
      if (user) localStorage.setItem('user', JSON.stringify(user));
      else localStorage.removeItem('user');
    } catch {}
  }, [token, user]);

  // Rehidratar usuario si hay token pero no hay user cargado
  useEffect(() => {
    const hydrateUser = async () => {
      if (!token) return;
      try {
        const me = await authService.me();
        setUser(me);
      } catch (err) {
        logout();
      }
    };
    if (token && !user) {
      hydrateUser();
    }
  }, [token]); // no dependemos de user para evitar bucles

  // Helper para forzar carga de /auth/me si hace falta
  const ensureUserLoaded = async () => {
    if (!token) return false;
    if (user) return true;
    try {
      const me = await authService.me();
      setUser(me);
      return true;
    } catch {
      logout();
      return false;
    }
  };

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    try {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}
  };

  // Flag claro para saber si hay sesión
  const isAuthenticated = Boolean(token);

  const value = { user, token, isAuthenticated, login, logout, setUser, ensureUserLoaded };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
