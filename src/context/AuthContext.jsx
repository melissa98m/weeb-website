import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthApi, ensureCsrf } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMe = useCallback(async () => {
    try {
      const me = await AuthApi.me();
      setUser(me);
      setError(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // prépare le CSRF, puis tente /me
    ensureCsrf().finally(() => {
      fetchMe();
    });
  }, [fetchMe]);

  const login = useCallback(async ({ identifier, password }) => {
    // on passe "identifier" comme username (peut être email si backend accepte)
    const username = identifier;
    await AuthApi.login({ username, password });
    await fetchMe();
  }, [fetchMe]);

  const register = useCallback(async (payload) => {
    await AuthApi.register(payload);
    await fetchMe();
  }, [fetchMe]);

  const logout = useCallback(async () => {
    await AuthApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, reload: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
