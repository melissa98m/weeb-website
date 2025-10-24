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
      return me;
    } catch (e) {
      setUser(null);
      setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Prépare le CSRF puis tente /me
    (async () => {
      try {
        await ensureCsrf();
      } finally {
        await fetchMe();
      }
    })();
  }, [fetchMe]);

  //  Accepte email/username/identifier + password, pose les cookies, puis charge /me
  const login = useCallback(
    async ({ email, username, identifier, password }) => {
      const id = (email ?? username ?? identifier ?? "").trim();
      await AuthApi.login({ email: id, username: id, identifier: id, password });
      const me = await fetchMe(); // hydrate le context
      return me;                  
    },
    [fetchMe]
  );

  // Après register, on tente de connecter puis on charge /me
  const register = useCallback(
    async (payload) => {
      await AuthApi.register(payload);
      try {
        await AuthApi.login({ email: payload.email, username: payload.email, identifier: payload.email, password: payload.password });
      } catch {
       
      }
      const me = await fetchMe();
      return me;
    },
    [fetchMe]
  );

  const logout = useCallback(async () => {
    await AuthApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        reload: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
