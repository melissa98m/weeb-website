import React, { useEffect, useRef } from "react";
import { useNotifications } from "../context/NotificationContext";

function NotifIcon({ type }) {
  if (type === "inscription") return <span aria-hidden="true">🎓</span>;
  if (type === "feedback") return <span aria-hidden="true">✅</span>;
  return <span aria-hidden="true">ℹ️</span>;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationDropdown({ onClose, theme = "light" }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const ref = useRef(null);

  const card =
    theme === "dark"
      ? "bg-surface border-border text-white"
      : "bg-white border-gray-200 text-gray-900";
  const divider = theme === "dark" ? "divide-[#333]" : "divide-gray-100";
  const itemHover = theme === "dark" ? "hover:bg-surface-2" : "hover:bg-gray-50";

  // Fermeture au clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
      className={`absolute right-0 top-11 w-80 rounded-2xl border shadow-xl z-50 overflow-hidden ${card}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${theme === "dark" ? "border-border" : "border-gray-100"}`}>
        <span className="font-semibold text-sm">Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-blue-500 hover:underline"
          >
            Tout marquer lu
          </button>
        )}
      </div>

      {/* Liste */}
      <ul
        className={`max-h-80 overflow-y-auto divide-y ${divider}`}
        role="list"
      >
        {notifications.length === 0 ? (
          <li className="px-4 py-8 text-sm text-center opacity-60">
            Aucune notification
          </li>
        ) : (
          notifications.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => { if (!n.read) markRead(n.id); }}
                className={`w-full text-left px-4 py-3 flex gap-3 items-start transition ${itemHover} ${!n.read ? "font-medium" : "opacity-60"}`}
              >
                <span className="text-base mt-0.5 shrink-0">
                  <NotifIcon type={n.type} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{n.message}</p>
                  <p className="text-xs opacity-50 mt-0.5">{formatDate(n.created_at)}</p>
                </div>
                {!n.read && (
                  <span
                    className="ml-auto mt-1.5 shrink-0 w-2 h-2 rounded-full bg-blue-500"
                    aria-label="Non lue"
                  />
                )}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
