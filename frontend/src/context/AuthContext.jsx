import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/routes';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  setUser: () => {},
  ensureUserLoaded: async () => false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('access_token'));

  useEffect(() => {
    // Al cargar la app, si estamos autenticados pero no tenemos datos de usuario,
    // intentamos obtenerlos.
    const initialLoad = async () => {
      if (isAuthenticated && !user) {
        try {
          const me = await authService.me();
          setUser(me);
        } catch (err) {
          // Si el token es inválido, cerramos sesión.
          logout();
        }
      }
    };
    initialLoad();
  }, [isAuthenticated]); // Se ejecuta solo cuando cambia el estado de autenticación.

  const login = async (accessToken, refreshToken) => {
    // 1. Guardar los tokens
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }

    setIsAuthenticated(true);

    // 2. Obtener y guardar los datos del usuario
    try {
      const userData = await authService.me();
      setUser(userData);
      return userData;
    } catch (error) {
      // Si falla, limpiar todo para evitar un estado inconsistente.
      logout();
      throw new Error('No se pudo obtener la información del usuario después del login.');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // LIMPIA la cabecera de axios al cerrar sesión
    // También borramos los viejos por si acaso
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Helper para forzar carga de /auth/me si hace falta (útil en páginas protegidas)
  const ensureUserLoaded = async () => {
    if (!isAuthenticated) return false;
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

  const value = { user, isAuthenticated, login, logout, setUser, ensureUserLoaded };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
