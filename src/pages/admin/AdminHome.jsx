import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { hasAnyStaffRole, hasAnyRedactionRole, hasPersonnelRole } from "../../utils/roles";
import AdminAccessFooter from "../../components/admin/AdminAccessFooter";
import ExportCSVButton from "../../components/admin/ExportCSVButton";
import { API_BASE } from "../../lib/api";
import adminEn from "../../../locales/en/admin.json";
import adminFr from "../../../locales/fr/admin.json";

/* ==== Icons ==== */
function Ico({ size = 18, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function IconLink({ size = 18 })       { return <Ico size={size}><path d="M8 7h2a4 4 0 0 1 0 8H8"/><path d="M16 17h-2a4 4 0 0 1 0-8h2"/><path d="M9 12h6"/></Ico>; }
function IconCap({ size = 18 })        { return <Ico size={size}><path d="M12 4l9 5-9 5-9-5 9-5z"/><path d="M4 10v4l8 4 8-4v-4"/></Ico>; }
function IconMail({ size = 18 })       { return <Ico size={size}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Ico>; }
function IconMessage({ size = 18 })    { return <Ico size={size}><rect x="3" y="4" width="18" height="14" rx="3"/><path d="M3 9l9 4 9-4"/></Ico>; }
function IconInbox({ size = 18 })      { return <Ico size={size}><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 13h5l2 3h4l2-3h5"/></Ico>; }
function IconPen({ size = 18 })        { return <Ico size={size}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></Ico>; }
function IconUsers({ size = 18 })      { return <Ico size={size}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Ico>; }
function IconTrophy({ size = 18 })     { return <Ico size={size}><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M7 4H4a2 2 0 0 0-2 2v2c0 3.31 2.69 6 6 6h0"/><path d="M17 4h3a2 2 0 0 1 2 2v2c0 3.31-2.69 6-6 6h0"/><rect x="7" y="2" width="10" height="9" rx="2" ry="2"/></Ico>; }
function IconRefresh({ size = 16 })    { return <Ico size={size}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></Ico>; }
function IconArrow({ size = 14 })      { return <Ico size={size}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Ico>; }

/* ==== Mini pending badge ==== */
function MiniBadge({ children, isDark, title }) {
  return (
    <span
      title={title}
      className={`px-2 py-0.5 rounded-full text-xs leading-none font-semibold border ${
        isDark ? "bg-amber-600/20 text-amber-300 border-amber-700/40" : "bg-amber-100 text-amber-700 border-amber-200"
      }`}
    >
      {children}
    </span>
  );
}

/* ==== Shortcut card ==== */
function ShortcardCard({ to, icon: Icon, title, desc, badge, isDark, accentClass, iconBg }) {
  return (
    <Link
      to={to}
      className={`group rounded-2xl border p-4 flex items-start gap-3.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isDark
          ? "bg-surface border-border hover:border-primary/30 hover:bg-surface-2"
          : "bg-white border-gray-200 hover:border-secondary/30 hover:bg-gray-50"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className={`font-display font-semibold text-sm flex items-center gap-2 ${accentClass}`}>
          {title}
          {badge}
        </div>
        <p className={`text-xs leading-relaxed mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>
          {desc}
        </p>
      </div>
    </Link>
  );
}

/* ==== Stat card ==== */
function StatCard({ label, value, accent, isDark }) {
  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-1 ${
      isDark ? "bg-surface border-border" : "bg-white border-gray-200"
    }`}>
      <span
        className="font-display font-black tabular-nums leading-none"
        style={{
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          color: accent
            ? "#f59e0b"
            : isDark ? "#ffffff" : "#0f172a",
        }}
      >
        {value ?? <span className="text-base opacity-20">—</span>}
      </span>
      <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>{label}</span>
    </div>
  );
}

/* ==== Export section ==== */
function ExportSection({ isDark, canStaff, canPersonnel, t }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const inputClass = `rounded-xl border px-3 py-1.5 text-sm transition-colors ${
    isDark
      ? "bg-surface text-white border-border placeholder:text-white/30 focus:border-primary"
      : "bg-white text-gray-900 border-gray-200 focus:border-secondary"
  } focus:outline-none`;

  const ghostBtn = isDark
    ? "bg-surface text-white border-border hover:bg-surface-raised"
    : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className={`flex items-center gap-2 text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>
          {t.home_export_from}
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputClass} aria-label={t.home_export_start_date} />
        </label>
        <label className={`flex items-center gap-2 text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>
          {t.home_export_to}
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inputClass} aria-label={t.home_export_end_date} />
        </label>
      </div>

      <div className="space-y-2.5">
        {canPersonnel && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`text-xs font-medium w-20 shrink-0 ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.home_export_registrations}</span>
            <ExportCSVButton type="registrations" format="csv" dateFrom={dateFrom} dateTo={dateTo} label="CSV" className={ghostBtn} />
            <ExportCSVButton type="registrations" format="pdf" dateFrom={dateFrom} dateTo={dateTo} label="PDF" className={ghostBtn} />
          </div>
        )}
        {canStaff && (
          <>
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`text-xs font-medium w-20 shrink-0 ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.home_export_feedbacks}</span>
              <ExportCSVButton type="feedbacks" format="csv" dateFrom={dateFrom} dateTo={dateTo} label="CSV" className={ghostBtn} />
              <ExportCSVButton type="feedbacks" format="pdf" dateFrom={dateFrom} dateTo={dateTo} label="PDF" className={ghostBtn} />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`text-xs font-medium w-20 shrink-0 ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.home_export_messages}</span>
              <ExportCSVButton type="messages" format="csv" dateFrom={dateFrom} dateTo={dateTo} label="CSV" className={ghostBtn} />
              <ExportCSVButton type="messages" format="pdf" dateFrom={dateFrom} dateTo={dateTo} label="PDF" className={ghostBtn} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ==== Page ==== */
export default function AdminHome() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? adminFr : adminEn;
  const isDark = theme === "dark";

  useEffect(() => {
    const prev = document.title;
    document.title = t.page_title_admin;
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) { metaRobots = document.createElement("meta"); metaRobots.name = "robots"; document.head.appendChild(metaRobots); }
    metaRobots.content = "noindex, nofollow";
    return () => { document.title = prev; };
  }, [t]);

  const canStaff     = hasAnyStaffRole(user);
  const canPersonnel = hasPersonnelRole(user);
  const canRedact    = hasAnyRedactionRole(user);

  const card = isDark ? "bg-surface border-border" : "bg-white border-gray-200";

  const [analytics, setAnalytics] = useState(null);
  useEffect(() => {
    if (!canStaff) return;
    let alive = true;
    fetch(`${API_BASE}/admin/analytics/`, { credentials: "include", headers: { Accept: "application/json" } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (alive) setAnalytics(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, [canStaff]);

  const [fbPending, setFbPending]   = useState(null);
  const [msgPending, setMsgPending] = useState(null);
  const ctrlRef = useRef(null);

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
    const ac = new AbortController();
    ctrlRef.current = ac;
    try { setFbPending(await fetchCount(`${API_BASE}/feedbacks/?to_process=false`, ac.signal)); } catch { setFbPending(null); }
    try { setMsgPending(await fetchCount(`${API_BASE}/messages/?is_processed=false`, ac.signal)); } catch { setMsgPending(null); }
  }, [fetchCount]);

  useEffect(() => {
    loadCounts();
    const id = setInterval(loadCounts, 30000);
    return () => { clearInterval(id); ctrlRef.current?.abort(); };
  }, [loadCounts]);

  const shortcards = [
    canPersonnel && {
      to: "/admin/user-formations",
      icon: IconLink,
      title: t.nav_affect,
      desc: t.home_affect_desc,
      iconBg: isDark ? "bg-primary/10 text-primary" : "bg-purple-100 text-purple-600",
      accentClass: isDark ? "text-white" : "text-gray-900",
    },
    canPersonnel && {
      to: "/admin/formations",
      icon: IconCap,
      title: t.nav_formations,
      desc: t.home_formations_desc,
      iconBg: isDark ? "bg-violet-500/10 text-violet-400" : "bg-violet-100 text-violet-600",
      accentClass: isDark ? "text-white" : "text-gray-900",
    },
    canRedact && {
      to: "/admin/articles",
      icon: IconPen,
      title: t.nav_articles,
      desc: t.home_articles_desc,
      iconBg: isDark ? "bg-sky-500/10 text-sky-400" : "bg-sky-100 text-sky-600",
      accentClass: isDark ? "text-white" : "text-gray-900",
    },
    canStaff && {
      to: "/admin/feedbacks",
      icon: IconMessage,
      title: t.nav_feedbacks,
      desc: t.home_feedbacks_desc,
      iconBg: isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-600",
      accentClass: isDark ? "text-white" : "text-gray-900",
      badge: fbPending !== null && fbPending > 0 && (
        <MiniBadge isDark={isDark} title={`${fbPending} ${t.home_feedback_to_process}`}>{fbPending}</MiniBadge>
      ),
    },
    canStaff && {
      to: "/admin/messages",
      icon: IconInbox,
      title: t.nav_messages,
      desc: t.home_messages_desc,
      iconBg: isDark ? "bg-rose-500/10 text-rose-400" : "bg-rose-100 text-rose-600",
      accentClass: isDark ? "text-white" : "text-gray-900",
      badge: msgPending !== null && msgPending > 0 && (
        <MiniBadge isDark={isDark} title={`${msgPending} ${t.home_message_to_process}`}>{msgPending}</MiniBadge>
      ),
    },
    canStaff && {
      to: "/admin/newsletter",
      icon: IconMail,
      title: t.nav_newsletter,
      desc: t.home_newsletter_desc,
      iconBg: isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-600",
      accentClass: isDark ? "text-white" : "text-gray-900",
    },
  ].filter(Boolean);

  return (
    <main className="px-4 md:px-6 py-6 space-y-5">

      {/* ── Header banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{ background: "linear-gradient(135deg, #c084fc 0%, #9333ea 60%, #7c3aed 100%)" }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-6 left-1/3 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-white/60 mb-2">
            Administration
          </span>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white leading-tight">
            {t.home_title}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {t.home_hello}{user?.username ? `, ${user.username}` : ""}. {t.home_subtitle}
          </p>
        </div>
      </motion.div>

      {/* ── Shortcut grid ── */}
      {shortcards.length > 0 && (
        <section aria-label="Raccourcis">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shortcards.map((card, i) => (
              <motion.div
                key={card.to}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <ShortcardCard {...card} isDark={isDark} />
              </motion.div>
            ))}
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={loadCounts}
              className={`inline-flex items-center gap-1.5 text-xs rounded-lg border px-3 py-1.5 transition-colors ${
                isDark
                  ? "bg-surface border-border text-white/50 hover:text-white"
                  : "bg-white border-gray-200 text-gray-500 hover:text-gray-800"
              }`}
            >
              <IconRefresh />
              {t.home_refresh_counts}
            </button>
          </div>
        </section>
      )}

      {/* ── Analytics summary ── */}
      {canStaff && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className={`rounded-2xl border p-5 ${card}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-display font-semibold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
              {t.home_analytics}
            </h2>
            <Link
              to="/admin/analytics"
              className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                isDark ? "text-primary hover:text-white" : "text-secondary hover:text-gray-900"
              }`}
            >
              {t.home_see_all}
              <IconArrow />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label={t.home_stat_users}             value={analytics?.total_utilisateurs}     isDark={isDark} />
            <StatCard label={t.home_stat_registrations}     value={analytics?.total_inscrits}         isDark={isDark} />
            <StatCard label={t.home_stat_feedbacks}         value={analytics?.total_feedbacks}        isDark={isDark} />
            <StatCard
              label={t.home_stat_messages_pending}
              value={analytics?.messages_non_traites}
              isDark={isDark}
              accent={(analytics?.messages_non_traites ?? 0) > 0}
            />
          </div>

          {analytics?.taux_satisfaction != null && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.home_satisfaction}</span>
                <span
                  className="text-sm font-bold"
                  style={{
                    color: analytics.taux_satisfaction >= 70 ? "#22c55e"
                         : analytics.taux_satisfaction >= 40 ? "#f59e0b"
                         : "#ef4444",
                  }}
                >
                  {analytics.taux_satisfaction} %
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ background: isDark ? "#333" : "#e5e7eb" }}>
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${analytics.taux_satisfaction}%`,
                    background: analytics.taux_satisfaction >= 70 ? "#22c55e"
                              : analytics.taux_satisfaction >= 40 ? "#f59e0b"
                              : "#ef4444",
                  }}
                />
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* ── Exports ── */}
      {(canStaff || canPersonnel || canRedact) && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className={`rounded-2xl border p-5 ${card}`}
        >
          <h2 className={`font-display font-semibold text-base mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            {t.home_exports}
          </h2>
          <ExportSection isDark={isDark} canStaff={canStaff} canPersonnel={canPersonnel} t={t} />
        </motion.section>
      )}

      <AdminAccessFooter />
    </main>
  );
}
