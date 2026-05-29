import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";

function IconBell() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function NotificationBell({ theme = "light" }) {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);

  // Fermeture Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const hover =
    theme === "dark"
      ? "text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 focus:ring-violet-500/40"
      : "text-violet-500 hover:text-violet-700 hover:bg-violet-50 focus:ring-violet-300";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lue${unreadCount > 1 ? "s" : ""})` : ""}`}
        className={`relative p-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${hover}`}
      >
        <IconBell />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown theme={theme} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
