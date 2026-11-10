import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "../lib/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  const logout = useCallback(() => { tokenStore.clear(); setUser(null); }, []);

  // Restore the session on page load.
  useEffect(() => {
    if (!tokenStore.get()) return;
    api.me().then((r) => setUser(r.user)).catch(() => tokenStore.clear()).finally(() => setLoading(false));
  }, []);

  // Any 401 from the API (expired token, etc.) signs the user out.
  useEffect(() => {
    window.addEventListener("taskora:unauthorized", logout);
    return () => window.removeEventListener("taskora:unauthorized", logout);
  }, [logout]);

  const startSession = ({ token, user }) => { tokenStore.set(token); setUser(user); };
  const login = async (body) => startSession(await api.login(body));
  const register = async (body) => startSession(await api.register(body));

  return <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
