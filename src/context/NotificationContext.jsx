import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { API_BASE, WS_BASE } from "../lib/api";
import { getCookie } from "../lib/cookies";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const connect = useCallback(async () => {
    if (!user) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Fetch an ephemeral ticket via HTTP (cookies work normally with HTTP).
    // HttpOnly cookies are not forwarded by browsers during WS handshakes on
    // cross-port origins (e.g. localhost:5173 → localhost:8000, SameSite=Lax).
    let ticket = "";
    try {
      const res = await fetch(`${API_BASE}/auth/ws-ticket/`, {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRFToken": getCookie("csrftoken") ?? "" },
      });
      if (res.ok) {
        const data = await res.json();
        ticket = data.ticket ?? "";
      }
    } catch { /* silently fall back to cookie */ }

    const wsUrl = ticket
      ? `${WS_BASE}/ws/notifications/?ticket=${ticket}`
      : `${WS_BASE}/ws/notifications/`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "init") {
          setNotifications(data.notifications ?? []);
          setUnreadCount((data.notifications ?? []).filter((n) => !n.read).length);
        } else if (data.type === "notification") {
          setNotifications((prev) => [data.notification, ...prev]);
          setUnreadCount((c) => c + 1);
        }
      } catch { /* malformed frame — ignoré */ }
    };

    ws.onclose = () => {
      // Reconnexion automatique toutes les 5s
      reconnectTimer.current = setTimeout(() => {
        if (user) connect();
      }, 5000);
    };

    ws.onerror = () => ws.close();
  }, [user]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  useEffect(() => {
    const handlePageHide = (e) => {
      if (e.persisted) {
        // Page en train d'entrer dans le bfcache — fermer la WS pour l'autoriser
        clearTimeout(reconnectTimer.current);
        wsRef.current?.close();
      }
    };
    const handlePageShow = (e) => {
      if (e.persisted) {
        // Page restaurée depuis le bfcache — reconnecter
        connect();
      }
    };
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [connect]);

  // Réinitialiser à la déconnexion
  useEffect(() => {
    if (!user) {
      wsRef.current?.close();
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const markRead = useCallback((notifId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "ack", id: notifId }));
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const csrf = getCookie("csrftoken");
      await fetch(`${API_BASE}/notifications/read-all/`, {
        method: "POST",
        credentials: "include",
        headers: csrf ? { "X-CSRFToken": csrf } : {},
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* silencieux */ }
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
