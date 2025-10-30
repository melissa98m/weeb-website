import React, { useEffect, useRef, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

/* ==== Icônes inline (SVG) sans dépendance ==== */
function IconBase({ children, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function IconLink() {
  return (
    <IconBase>
      <path d="M8 7h2a4 4 0 0 1 0 8H8" />
      <path d="M16 17h-2a4 4 0 0 1 0-8h2" />
      <path d="M9 12h6" />
    </IconBase>
  );
}

function IconCap() {
  return (
    <IconBase>
      <path d="M12 4l9 5-9 5-9-5 9-5z" />
      <path d="M4 10v4l8 4 8-4v-4" />
    </IconBase>
  );
}

function IconMessage() {
  return (
    <IconBase>
      <rect x="3" y="4" width="18" height="14" rx="3" />
      <path d="M3 9l9 4 9-4" />
    </IconBase>
  );
}

function IconInbox() {
  return (
    <IconBase>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 13h5l2 3h4l2-3h5" />
    </IconBase>
  );
}

/* ==== Mini badge "à traiter" ==== */
function MiniBadge({ children, theme = "light", title = "À traiter" }) {
  const base = "px-1.5 py-0.5 rounded-full text-[10px] leading-none font-semibold border";
  const light = "bg-amber-200 text-amber-800 border-amber-200";
  const dark = "bg-amber-600/20 text-amber-300 border-amber-700/40";
  return (
    <span className={`${base} ${theme === "dark" ? dark : light}`} title={title}>
      {children}
    </span>
  );
}

/* ===== Items de navigation ===== */
const NAV = [
  { key: "affect", label: "Affectations", to: "/admin/user-formations", icon: IconLink },
  { key: "forms", label: "Formations", to: "/admin/formations", icon: IconCap },
  { key: "fb", label: "Feedbacks", to: "/admin/feedbacks", icon: IconMessage },
  { key: "msg", label: "Messages", to: "/admin/messages", icon: IconInbox },
];

// Normalise toujours vers .../api
const API_BASE = (() => {
  const raw = (import.meta.env.VITE_API_URL ?? "http://localhost:8000") + "";
  const base = raw.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
})();

export default function AdminSidebar({ open = false, onClose = () => {} }) {
  const { theme } = useTheme();

  const [fbPending, setFbPending] = useState(null);
  const [msgPending, setMsgPending] = useState(null);
  const ctrlRef = useRef(null);

  const panel =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";
  const itemBase =
    "flex items-center gap-2 px-3 py-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-1";
  const itemLight = "hover:bg-gray-100 focus:ring-gray-400";
  const itemDark = "hover:bg-[#262626] focus:ring-[#444]";
  const activeLight = "bg-gray-100 font-medium";
  const activeDark = "bg-[#262626] font-medium";

  const fetchCount = useCallback(async (url, signal) => {
    const r = await fetch(url, { credentials: "include", signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return 0;
    const data = await r.json();
    if (typeof data?.count === "number") return data.count;
    if (Array.isArray(data)) return data.length;
    if (Array.isArray(data?.results)) return data.results.length;
    return 0;
  }, []);

  const loadCounts = useCallback(async () => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    try {
      // Feedbacks "à traiter"
      const count = await fetchCount(`${API_BASE}/feedbacks/?to_process=false`, ctrl.signal);
      setFbPending(count);
    } catch {
      setFbPending(null);
    }

    try {
      // Messages "à traiter"
      const count = await fetchCount(`${API_BASE}/messages/?is_processed=false`, ctrl.signal);
      setMsgPending(count);
    } catch {
      setMsgPending(null);
    }
  }, [fetchCount]);

  useEffect(() => {
    loadCounts();
    const id = setInterval(loadCounts, 30000);
    return () => {
      clearInterval(id);
      ctrlRef.current?.abort();
    };
  }, [loadCounts]);

  return (
    <>
      {/* Backdrop mobile */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition ${
          open ? "bg-black/40 opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
       <aside
        className={`fixed md:sticky z-50 md:z-auto left-0 md:left-auto 
          top-[64px] md:top-[128px]
          h-[calc(100%-64px)] md:h-[calc(100vh-128px)]
          w-72 md:w-64 border md:rounded-2xl
          ${panel}
          transition-transform md:transition-none
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        role="navigation"
        aria-label="Menu d’administration"
      >
        {/* Entête mobile */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b">
          <div className="font-semibold">Administration</div>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg border"
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        <div className="p-3 md:p-4">
          <ul className="space-y-1">
            {NAV.map(({ key, label, to, icon: Icon }) => {
              const isFb = key === "fb";
              const isMsg = key === "msg";
              const pending = isFb ? fbPending : isMsg ? msgPending : null;

              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `${itemBase} ${theme === "dark" ? itemDark : itemLight} ${
                        isActive ? (theme === "dark" ? activeDark : activeLight) : ""
                      }`
                    }
                    onClick={onClose}
                  >
                    <Icon />
                    <span className="truncate">{label}</span>

                    {(isFb || isMsg) && pending !== null && (
                      <span className="ml-auto">
                        <MiniBadge theme={theme === "dark" ? "dark" : "light"}>
                          {pending}
                        </MiniBadge>
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}
