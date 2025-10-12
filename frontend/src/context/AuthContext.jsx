import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Inicializa desde localStorage para no perder sesión entre recargas
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Persistir cambios en localStorage
  useEffect(() => {
    try {
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
      if (user) localStorage.setItem('user', JSON.stringify(user));
      else localStorage.removeItem('user');
    } catch {
      // Si el navegador bloquea localStorage, ignora silenciosamente
    }
  }, [token, user]);

  // Rehidratar/validar usuario con el backend si hay token
  useEffect(() => {
    const hydrateUser = async () => {
      if (!token) return;
      try {
        const me = await authService.me(); // GET /auth/me/
        // Asegura que el objeto usuario esté actualizado
        setUser(me);
      } catch (err) {
        // Si el token es inválido/expirado, cierra sesión
        logout();
      }
    };
    // Solo llama si no tenemos user cargado aún o quieres forzar refresco
    if (token && !user) {
      hydrateUser();
    }
  }, [token]); // intencionalmente no depende de user para evitar bucles

  // Sincronización entre pestañas/ventanas
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token') setToken(e.newValue);
      if (e.key === 'user') {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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

  const value = { user, token, login, logout, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
