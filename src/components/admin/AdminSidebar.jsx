import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  hasPersonnelRole,
  hasAnyStaffRole,
  hasAnyRedactionRole,
} from "../../utils/roles";
import { API_BASE } from "../../lib/api";
import adminEn from "../../../locales/en/admin.json";
import adminFr from "../../../locales/fr/admin.json";

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
function IconPen() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconTag() {
  return (
    <IconBase>
      <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.59-8.59a1 1 0 0 0 0-1.41L12 2Z" />
      <circle cx="7" cy="7" r="1.5" />
    </IconBase>
  );
}

/* ==== Mini badge "à traiter" ==== */
function MiniBadge({ children, theme = "light", title }) {
  const base =
    "px-1.5 py-0.5 rounded-full text-[10px] leading-none font-semibold border";
  const light = "bg-amber-200 text-amber-800 border-amber-200";
  const dark = "bg-amber-600/20 text-amber-300 border-amber-700/40";
  return (
    <span className={`${base} ${theme === "dark" ? dark : light}`} title={title}>
      {children}
    </span>
  );
}

/* ===== Items de navigation (toutes les entrées potentielles) ===== */
function IconMail() {
  return (
    <IconBase>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </IconBase>
  );
}

function IconChart() {
  return (
    <IconBase>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </IconBase>
  );
}

function IconBriefcase() {
  return (
    <IconBase>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="12" />
      <path d="M2 12h20" />
    </IconBase>
  );
}

function IconChat() {
  return (
    <IconBase>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </IconBase>
  );
}

function IconBook() {
  return (
    <IconBase>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </IconBase>
  );
}

function buildNav(t) {
  return [
    { key: "affect", labelKey: "nav_affect", to: "/admin/user-formations", icon: IconLink },
    { key: "forms", labelKey: "nav_formations", to: "/admin/formations", icon: IconCap },
    { key: "content", labelKey: "nav_content", to: "/admin/content", icon: IconBook },
    { key: "articles", labelKey: "nav_articles", to: "/admin/articles", icon: IconPen },
    { key: "genres", labelKey: "nav_genres", to: "/admin/genres", icon: IconTag },
    { key: "fb", labelKey: "nav_feedbacks", to: "/admin/feedbacks", icon: IconMessage },
    { key: "msg", labelKey: "nav_messages", to: "/admin/messages", icon: IconInbox },
    { key: "commercial", labelKey: "nav_commercial", to: "/admin/commercial", icon: IconBriefcase },
    { key: "newsletter", labelKey: "nav_newsletter", to: "/admin/newsletter", icon: IconMail },
    { key: "analytics", labelKey: "nav_analytics", to: "/admin/analytics", icon: IconChart },
    { key: "chat", labelKey: "nav_chat", to: "/admin/chat", icon: IconChat },
  ].map(item => ({ ...item, label: t[item.labelKey] }));
}


export default function AdminSidebar({ open = false, onClose = () => {} }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? adminFr : adminEn;

  const [fbPending, setFbPending] = useState(null);
  const [msgPending, setMsgPending] = useState(null);
  const ctrlRef = useRef(null);

  // Fermeture du menu mobile au clavier (Escape)
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

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

  // Capacités par rôle
  const canPersonnel = hasPersonnelRole(user);
  const canStaff = hasAnyStaffRole(user); // ex: Commercial OU Personnel
  const canRedaction = hasAnyRedactionRole(user);
  const isAdmin = !!(user?.is_staff || user?.is_superuser);

  const NAV_ALL = useMemo(() => buildNav(t), [t]);

  // Filtrage des onglets visibles selon rôles
  const NAV = useMemo(() => {
    return NAV_ALL.filter(({ key }) => {
      switch (key) {
        case "affect":
        case "forms":
        case "content":
          return canPersonnel || isAdmin;
        case "articles":
        case "genres":
          return canRedaction || isAdmin;
        case "fb":
        case "msg":
          return canStaff || isAdmin;
        case "commercial":
          return canStaff || isAdmin;
        case "newsletter":
        case "analytics":
        case "chat":
          return canStaff || isAdmin;
        default:
          return false;
      }
    });
  }, [NAV_ALL, canPersonnel, canStaff, canRedaction, isAdmin]);

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

    // On ne charge les compteurs que si les onglets sont visibles
    if (NAV.some((x) => x.key === "fb")) {
      try {
        const count = await fetchCount(
          `${API_BASE}/feedbacks/?to_process=false`,
          ctrl.signal
        );
        setFbPending(count);
      } catch {
        setFbPending(null);
      }
    } else {
      setFbPending(null);
    }

    if (NAV.some((x) => x.key === "msg")) {
      try {
        const count = await fetchCount(
          `${API_BASE}/messages/?is_processed=false`,
          ctrl.signal
        );
        setMsgPending(count);
      } catch {
        setMsgPending(null);
      }
    } else {
      setMsgPending(null);
    }
  }, [fetchCount, NAV]);

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
          h-[calc(80%-64px)] md:h-[calc(80vh-128px)]
          w-72 md:w-64 border md:rounded-2xl
          ${panel}
          transition-transform md:transition-none
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        role="navigation"
        aria-label={t.nav_admin_label}
      >
        {/* Entête mobile */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b">
          <div className="font-semibold">{t.nav_administration}</div>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg border"
            aria-label={t.nav_close}
          >
            ✕
          </button>
        </div>

        <div className="p-3 md:p-4">
          {NAV.length === 0 ? (
            <div className="text-sm opacity-70 px-2">
              {t.nav_no_module}
            </div>
          ) : (
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
                          <MiniBadge theme={theme === "dark" ? "dark" : "light"} title={t.nav_to_process}>
                            {pending}
                          </MiniBadge>
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
