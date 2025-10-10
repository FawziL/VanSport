import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Aquí puedes guardar el usuario logueado
  const [token, setToken] = useState(null);

  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    // Puedes guardar en localStorage si quieres persistencia
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Limpia localStorage si lo usas
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}