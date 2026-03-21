import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { API_BASE, WS_BASE } from "../lib/api";
import { getCookie } from "../lib/cookies";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const userRef = useRef(user);

  useEffect(() => { userRef.current = user; }, [user]);

  const connect = useCallback(async () => {
    if (!userRef.current) return;
    const ws = wsRef.current;
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

    setConnecting(true);

    // Obtenir un ticket éphémère via HTTP (les cookies passent normalement en HTTP)
    // afin d'authentifier la connexion WebSocket (les cookies HttpOnly ne sont pas
    // toujours transmis lors du handshake WS en cross-port en local).
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
    } catch {
      // silencieux — le fallback cookie sera tenté côté serveur
    }

    const wsUrl = ticket
      ? `${WS_BASE}/ws/chat/support/?ticket=${ticket}`
      : `${WS_BASE}/ws/chat/support/`;
    const newWs = new WebSocket(wsUrl);
    wsRef.current = newWs;

    newWs.onopen = () => {
      setConnected(true);
      setConnecting(false);
    };

    newWs.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "history") {
          setMessages(data.messages ?? []);
          setUnreadCount((data.messages ?? []).filter((m) => !m.read && m.sender_is_staff).length);
        } else if (data.type === "message") {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
          if (data.message.sender_is_staff) {
            setUnreadCount((n) => n + 1);
          }
        }
      } catch {
        // JSON invalide — ignoré
      }
    };

    newWs.onclose = (e) => {
      setConnected(false);
      setConnecting(false);
      // Ne pas reconnecter si fermeture intentionnelle (code 4401 = non auth)
      if (e.code === 4401 || e.code === 1000) return;
      reconnectRef.current = setTimeout(() => {
        if (userRef.current) connect();
      }, 4000);
    };

    newWs.onerror = () => newWs.close();
  }, []); // stable — utilise userRef pour éviter les re-créations

  useEffect(() => {
    const handlePageHide = (e) => {
      if (e.persisted) {
        // Page en train d'entrer dans le bfcache — fermer la WS pour l'autoriser
        clearTimeout(reconnectRef.current);
        wsRef.current?.close(1000, "bfcache");
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

  useEffect(() => {
    if (!user) {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close(1000, "logout");
      wsRef.current = null;
      setMessages([]);
      setUnreadCount(0);
      setConnected(false);
      setConnecting(false);
      return;
    }
    connect();
    return () => {
      clearTimeout(reconnectRef.current);
    };
  }, [user, connect]);

  const sendMessage = useCallback((content) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify({ type: "message", content }));
    return true;
  }, []);

  const markRead = useCallback(() => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "read" }));
    }
    setUnreadCount(0);
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
  }, []);

  return (
    <ChatContext.Provider value={{ messages, unreadCount, connected, connecting, sendMessage, markRead }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
