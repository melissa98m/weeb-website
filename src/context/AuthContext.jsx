import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { AuthApi, ensureCsrf } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const didInitRef = useRef(false);

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
    if (didInitRef.current) return;
    didInitRef.current = true;

    const run = async () => {
      // Prépare le CSRF puis tente /me
      try {
        await ensureCsrf();
      } finally {
        await fetchMe();
      }
    };

    const isProtectedPath = (() => {
      if (typeof window === "undefined") return false;
      const path = window.location.pathname || "";
      return path === "/profile" || path.startsWith("/admin");
    })();

    if (isProtectedPath || (typeof window !== "undefined" && window.Cypress)) {
      run();
      return;
    }

    let idleId;
    let timeoutId;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(() => run(), { timeout: 1500 });
    } else {
      timeoutId = setTimeout(() => run(), 1200);
    }

    return () => {
      if (typeof window !== "undefined" && idleId) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
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
    try {
      await AuthApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      register,
      logout,
      reload: fetchMe,
    }),
    [user, loading, error, login, register, logout, fetchMe]
  );

  return (
    <AuthContext.Provider
      value={value}
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
