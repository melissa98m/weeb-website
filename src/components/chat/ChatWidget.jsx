import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import ChatWindow from "./ChatWindow";

export default function ChatWidget() {
  const { user } = useAuth();
  const { unreadCount } = useChat();
  const [open, setOpen] = useState(false);

  // Pas affiché pour les anonymes ni pour les admins (qui ont leur propre panel)
  if (!user || user.is_staff || user.is_superuser) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && <ChatWindow onClose={() => setOpen(false)} />}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        aria-label={open ? "Fermer le chat" : `Ouvrir le chat${unreadCount > 0 ? ` (${unreadCount} non lu${unreadCount > 1 ? "s" : ""})` : ""}`}
        aria-expanded={open}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {!open && unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center"
            aria-live="polite"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
