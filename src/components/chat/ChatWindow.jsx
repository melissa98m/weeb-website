import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function ChatWindow({ onClose }) {
  const { messages, connected, connecting, sendMessage, markRead } = useChat();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);

  const dark = theme === "dark";
  const bg = dark ? "bg-[#1c1c1c] border-[#333] text-white" : "bg-white border-gray-200 text-gray-900";
  const headerBg = dark ? "bg-[#262626] border-[#333]" : "bg-gray-50 border-gray-200";
  const inputBg = dark ? "bg-[#111] border-[#333] text-white placeholder:text-white/30" : "bg-white border-gray-300 text-gray-900";
  const bubbleUser = "bg-blue-600 text-white self-end";
  const bubbleAdmin = dark ? "bg-[#333] text-white self-start" : "bg-gray-100 text-gray-900 self-start";

  useEffect(() => {
    markRead();
    inputRef.current?.focus();
  }, [markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fermeture par Escape
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Focus trap : garder le focus dans le dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onTab = (e) => {
      if (e.key !== "Tab") return;
      const focusable = dialog.querySelectorAll("button:not([disabled]), textarea:not([disabled])");
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    dialog.addEventListener("keydown", onTab);
    return () => dialog.removeEventListener("keydown", onTab);
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const sent = sendMessage(text);
    if (sent) {
      setInput("");
    }
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      ref={dialogRef}
      className={`flex flex-col rounded-2xl border shadow-2xl overflow-hidden w-[calc(100vw-1.5rem)] sm:w-[340px] max-w-[340px] h-[80vh] sm:h-[480px] max-h-[480px] ${bg}`}
      role="dialog"
      aria-modal="true"
      aria-label="Chat support"
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${headerBg}`}>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : connecting ? "bg-yellow-400 animate-pulse" : "bg-gray-400"}`}
            title={connected ? "Connecté" : connecting ? "Connexion…" : "Déconnecté"}
            aria-hidden="true"
          />
          <span className="sr-only">{connected ? "Connecté" : connecting ? "Connexion en cours" : "Déconnecté"}</span>
          <span className="font-semibold text-sm">Support</span>
          {connecting && !connected && (
            <span className="text-xs opacity-50">Connexion…</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="opacity-60 hover:opacity-100 transition text-lg leading-none focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
          aria-label="Fermer le chat"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <ul
        className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2 list-none"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Messages du chat"
      >
        {messages.length === 0 && (
          <li className="text-sm opacity-40 text-center mt-8">
            Démarrez la conversation avec notre équipe support.
          </li>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === user?.id;
          return (
            <li key={msg.id} className={`flex flex-col max-w-[80%] ${isOwn ? "self-end items-end" : "self-start items-start"}`}>
              {!isOwn && (
                <span className="text-[10px] opacity-50 mb-0.5 px-1">{msg.sender_username}</span>
              )}
              <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${isOwn ? bubbleUser : bubbleAdmin}`}>
                {msg.content}
              </div>
              <span className="text-[10px] opacity-30 mt-0.5 px-1">
                {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </li>
          );
        })}
        <li ref={bottomRef} aria-hidden="true" />
      </ul>

      {/* Input */}
      <div className={`border-t px-3 py-2 flex gap-2 ${headerBg}`}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={connected ? "Votre message…" : connecting ? "Connexion en cours…" : "Non connecté"}
          rows={1}
          className={`flex-1 resize-none rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
          aria-label="Saisir un message"
          maxLength={2000}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || !connected || connecting}
          className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Envoyer"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
