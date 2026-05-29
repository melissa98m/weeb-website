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

/* ==== Inline SVG icons ==== */
function Ico({ size = 16, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function IconLink()       { return <Ico><path d="M8 7h2a4 4 0 0 1 0 8H8"/><path d="M16 17h-2a4 4 0 0 1 0-8h2"/><path d="M9 12h6"/></Ico>; }
function IconCap()        { return <Ico><path d="M12 4l9 5-9 5-9-5 9-5z"/><path d="M4 10v4l8 4 8-4v-4"/></Ico>; }
function IconBook()       { return <Ico><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></Ico>; }
function IconPen()        { return <Ico><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></Ico>; }
function IconTag()        { return <Ico><path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.59-8.59a1 1 0 0 0 0-1.41L12 2Z"/><circle cx="7" cy="7" r="1.5"/></Ico>; }
function IconMessage()    { return <Ico><rect x="3" y="4" width="18" height="14" rx="3"/><path d="M3 9l9 4 9-4"/></Ico>; }
function IconInbox()      { return <Ico><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 13h5l2 3h4l2-3h5"/></Ico>; }
function IconBriefcase()  { return <Ico><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 12h20"/></Ico>; }
function IconMail()       { return <Ico><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Ico>; }
function IconChart()      { return <Ico><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Ico>; }
function IconChat()       { return <Ico><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Ico>; }
function IconShield()     { return <Ico><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Ico>; }

/* ==== Pending badge ==== */
function MiniBadge({ children, isDark, title }) {
  return (
    <span
      title={title}
      className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] leading-none font-semibold border ${
        isDark
          ? "bg-amber-600/20 text-amber-300 border-amber-700/40"
          : "bg-amber-100 text-amber-700 border-amber-200"
      }`}
    >
      {children}
    </span>
  );
}

/* ==== Nav definition ==== */
const NAV_ITEMS = [
  { key: "affect",      to: "/admin/user-formations",  icon: IconLink,      labelKey: "nav_affect",      group: "formation" },
  { key: "forms",       to: "/admin/formations",        icon: IconCap,       labelKey: "nav_formations",  group: "formation" },
  { key: "content",     to: "/admin/content",           icon: IconBook,      labelKey: "nav_content",     group: "formation" },
  { key: "articles",    to: "/admin/articles",          icon: IconPen,       labelKey: "nav_articles",    group: "redaction" },
  { key: "genres",      to: "/admin/genres",            icon: IconTag,       labelKey: "nav_genres",      group: "redaction" },
  { key: "fb",          to: "/admin/feedbacks",         icon: IconMessage,   labelKey: "nav_feedbacks",   group: "processing" },
  { key: "msg",         to: "/admin/messages",          icon: IconInbox,     labelKey: "nav_messages",    group: "processing" },
  { key: "commercial",  to: "/admin/commercial",        icon: IconBriefcase, labelKey: "nav_commercial",  group: "processing" },
  { key: "newsletter",  to: "/admin/newsletter",        icon: IconMail,      labelKey: "nav_newsletter",  group: "communication" },
  { key: "analytics",   to: "/admin/analytics",         icon: IconChart,     labelKey: "nav_analytics",   group: "reports" },
  { key: "chat",        to: "/admin/chat",              icon: IconChat,      labelKey: "nav_chat",        group: "reports" },
];

const GROUPS_FR = [
  { key: "formation",     label: "Formation" },
  { key: "redaction",     label: "Rédaction" },
  { key: "processing",    label: "Traitement" },
  { key: "communication", label: "Communication" },
  { key: "reports",       label: "Rapports" },
];

const GROUPS_EN = [
  { key: "formation",     label: "Training" },
  { key: "redaction",     label: "Editorial" },
  { key: "processing",    label: "Processing" },
  { key: "communication", label: "Communication" },
  { key: "reports",       label: "Reports" },
];

export default function AdminSidebar({ open = false, onClose = () => {} }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? adminFr : adminEn;
  const isDark = theme === "dark";
  const isFr = language === "fr";

  const [fbPending, setFbPending] = useState(null);
  const [msgPending, setMsgPending] = useState(null);
  const ctrlRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const canPersonnel = hasPersonnelRole(user);
  const canStaff     = hasAnyStaffRole(user);
  const canRedaction = hasAnyRedactionRole(user);
  const isAdmin      = !!(user?.is_staff || user?.is_superuser);

  const visibleItems = useMemo(() => {
    return NAV_ITEMS.filter(({ key }) => {
      switch (key) {
        case "affect": case "forms": case "content":
          return canPersonnel || isAdmin;
        case "articles": case "genres":
          return canRedaction || isAdmin;
        case "fb": case "msg": case "commercial":
          return canStaff || isAdmin;
        case "newsletter": case "analytics": case "chat":
          return canStaff || isAdmin;
        default:
          return false;
      }
    }).map(item => ({ ...item, label: t[item.labelKey] }));
  }, [t, canPersonnel, canStaff, canRedaction, isAdmin]);

  const groups = isFr ? GROUPS_FR : GROUPS_EN;

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
    if (visibleItems.some(x => x.key === "fb")) {
      try { setFbPending(await fetchCount(`${API_BASE}/feedbacks/?to_process=false`, ctrl.signal)); }
      catch { setFbPending(null); }
    } else { setFbPending(null); }
    if (visibleItems.some(x => x.key === "msg")) {
      try { setMsgPending(await fetchCount(`${API_BASE}/messages/?is_processed=false`, ctrl.signal)); }
      catch { setMsgPending(null); }
    } else { setMsgPending(null); }
  }, [fetchCount, visibleItems]);

  useEffect(() => {
    loadCounts();
    const id = setInterval(loadCounts, 30000);
    return () => { clearInterval(id); ctrlRef.current?.abort(); };
  }, [loadCounts]);

  /* === Styles === */
  const panel = isDark
    ? "bg-surface border-border text-white"
    : "bg-white border-gray-200 text-gray-900";

  function navItemClass(isActive) {
    const base = "relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden";
    if (isActive) {
      return `${base} ${isDark ? "bg-primary/10 text-primary" : "bg-secondary/8 text-secondary"}`;
    }
    return `${base} ${isDark ? "text-white/60 hover:bg-surface-2 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`;
  }

  function renderItem(item) {
    const { key, to, icon: Icon, label } = item;
    const isFb  = key === "fb";
    const isMsg = key === "msg";
    const pending = isFb ? fbPending : isMsg ? msgPending : null;

    return (
      <li key={to}>
        <NavLink
          to={to}
          onClick={onClose}
          className={({ isActive }) => navItemClass(isActive)}
        >
          {({ isActive }) => (
            <>
              {/* Left accent bar */}
              {isActive && (
                <span
                  className="absolute left-0 inset-y-0 w-[3px] rounded-r-full"
                  style={{ background: isDark ? "#c084fc" : "#9333ea" }}
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              <span className={`shrink-0 ${isActive ? "" : "opacity-50"}`}>
                <Icon />
              </span>

              <span className="truncate">{label}</span>

              {pending !== null && (pending > 0) && (
                <MiniBadge isDark={isDark} title={t.nav_to_process}>{pending}</MiniBadge>
              )}
            </>
          )}
        </NavLink>
      </li>
    );
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Desktop header */}
      <div className="hidden md:flex items-center gap-2.5 px-4 py-4 border-b border-inherit">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #c084fc, #9333ea)" }}
          aria-hidden="true"
        >
          <IconShield size={14} />
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-sm leading-tight truncate">
            {t.nav_administration}
          </p>
          <p className={`text-[10px] truncate ${isDark ? "text-white/60" : "text-gray-400"}`}>
            Weeb
          </p>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-inherit">
        <span className="font-display font-bold text-sm">{t.nav_administration}</span>
        <button
          onClick={onClose}
          className={`w-7 h-7 rounded-lg flex items-center justify-center border text-sm ${
            isDark ? "border-border hover:bg-surface-2" : "border-gray-200 hover:bg-gray-100"
          }`}
          aria-label={t.nav_close}
        >
          ✕
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label={t.nav_admin_label}>
        {visibleItems.length === 0 ? (
          <p className={`text-xs px-2 py-1 ${isDark ? "text-white/60" : "text-gray-400"}`}>
            {t.nav_no_module}
          </p>
        ) : (
          <div className="space-y-4">
            {groups.map(group => {
              const items = visibleItems.filter(i => i.group === group.key);
              if (items.length === 0) return null;
              return (
                <div key={group.key}>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.12em] px-3 mb-1 ${
                    isDark ? "text-white/60" : "text-gray-400"
                  }`}>
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
                    {items.map(renderItem)}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-200 ${
          open ? "bg-black/50 opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed md:sticky z-50 md:z-auto left-0 md:left-auto
          top-[64px] md:top-[128px]
          h-[calc(80%-64px)] md:h-[calc(80vh-128px)]
          w-72 md:w-64 border md:rounded-2xl
          ${panel}
          transition-transform md:transition-none duration-200
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        role="navigation"
        aria-label={t.nav_admin_label}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
