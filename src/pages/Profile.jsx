import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import TrainingsList from "../components/profile/TrainingsList";
import FeedbackModal from "../components/FeedbackModal";
import DataRights from "../components/profile/DataRights";
import DashboardStats from "../components/profile/DashboardStats";

import profileFr from "../../locales/fr/profile.json";
import profileEn from "../../locales/en/profile.json";
import { getEnv } from "../lib/env";

const API_BASE = getEnv("VITE_API_URL", "http://localhost:8000/api");

export default function Profile() {
  const { user, loading: authLoading, reload, logout } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = useMemo(() => (language === "fr" ? profileFr : profileEn), [language]);
  const isDark = theme === "dark";

  // SEO: personal page — never indexed
  useEffect(() => {
    const prev = document.title;
    document.title = "Mon profil | Weeb";
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.name = "robots";
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = "noindex, nofollow";
    return () => { document.title = prev; };
  }, []);

  const userId = user?.id ?? user?.pk ?? user?.user_id ?? null;

  // ---------- Formations + Feedbacks + Dashboard (parallel) ----------
  const [formations, setFormations] = useState([]);
  const [fLoading, setFLoading] = useState(true);
  const [fError, setFError] = useState(null);

  const [fbMap, setFbMap] = useState({});
  const [fbLoading, setFbLoading] = useState(true);

  const [dashData, setDashData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState(null);

  useEffect(() => {
    if (authLoading || !userId) return;

    let alive = true;
    const ctr = new AbortController();

    const fetchAllPages = async (url) => {
      const all = [];
      let next = url;
      while (next) {
        const res = await fetch(next, {
          credentials: "include",
          headers: { Accept: "application/json" },
          signal: ctr.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) { all.push(...data); break; }
        all.push(...(Array.isArray(data.results) ? data.results : []));
        next = data.next || null;
      }
      return all;
    };

    setFLoading(true); setFbLoading(true); setDashLoading(true);
    setFError(null); setDashError(null);

    const ts = Date.now();

    (async () => {
      const [formationsRes, feedbacksRes, dashRes] = await Promise.allSettled([
        fetchAllPages(`${API_BASE}/formations/?user=${encodeURIComponent(userId)}&_=${ts}`),
        fetchAllPages(`${API_BASE}/feedbacks/?user=${encodeURIComponent(userId)}&_=${ts}`),
        fetch(`${API_BASE}/dashboard/`, {
          credentials: "include",
          headers: { Accept: "application/json" },
          signal: ctr.signal,
        }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
      ]);

      if (!alive) return;

      if (formationsRes.status === "fulfilled") {
        setFormations(formationsRes.value);
        setFError(null);
      } else {
        setFormations([]);
        setFError(formationsRes.reason);
      }
      setFLoading(false);

      if (feedbacksRes.status === "fulfilled") {
        const map = {};
        for (const item of feedbacksRes.value) {
          const fid = typeof item.formation === "object" ? item.formation?.id : item.formation;
          if (fid != null) map[fid] = item;
        }
        setFbMap(map);
      } else {
        setFbMap({});
      }
      setFbLoading(false);

      if (dashRes.status === "fulfilled") {
        setDashData(dashRes.value);
        setDashError(null);
      } else {
        setDashError(dashRes.reason?.message || "Error");
      }
      setDashLoading(false);
    })();

    return () => { alive = false; ctr.abort(); };
  }, [API_BASE, authLoading, userId]);

  // ---------- Login history ----------
  const [loginHistory, setLoginHistory] = useState([]);
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);

  useEffect(() => {
    if (!showLoginHistory || authLoading || !userId) return;
    let alive = true;
    setLoginHistoryLoading(true);
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/auth/login-history/`, { credentials: "include" });
        if (!alive) return;
        if (r.ok) setLoginHistory(await r.json());
      } catch { /* noop */ }
      finally { if (alive) setLoginHistoryLoading(false); }
    })();
    return () => { alive = false; };
  }, [showLoginHistory, authLoading, userId]);

  // ---------- Feedback modal ----------
  const [openFb, setOpenFb] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);

  // Loading skeleton — test checks container.querySelector(".animate-pulse")
  if (authLoading) {
    return (
      <main className="min-h-screen px-6 pt-28 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className={`rounded-2xl border p-6 ${isDark ? "bg-surface border-border" : "bg-white border-gray-200 shadow-sm"}`}>
            <div className="animate-pulse space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-300/30" />
                <div className="h-6 w-1/3 bg-gray-300/30 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-300/10">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-1/3 bg-gray-300/20 rounded" />
                    <div className="h-4 w-2/3 bg-gray-300/30 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const openFeedback = (formation) => {
    if (fbMap[formation.id]) return;
    setSelectedFormation(formation);
    setOpenFb(true);
  };
  const closeFeedback = () => {
    setOpenFb(false);
    setSelectedFormation(null);
  };
  const handleFeedbackCreated = (created) => {
    const fid =
      typeof created?.formation === "object"
        ? created.formation?.id
        : created?.formation ?? selectedFormation?.id;
    if (!fid) return;
    setFbMap((m) => ({
      ...m,
      [fid]: created || { formation: fid, feedback_content: "" },
    }));
  };

  const initial = (user.first_name?.[0] || user.username?.[0] || "?").toUpperCase();
  const displayName = user.first_name
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
    : user.username || "";
  const divider = isDark ? "border-border/60" : "border-gray-100";

  return (
    <main className="min-h-screen px-4 md:px-6 pt-24 pb-20">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── SIDEBAR ── */}
          <aside className="w-full lg:w-72 shrink-0 space-y-4 lg:sticky lg:top-28">

            {/* Identity card */}
            <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-surface border-border" : "bg-white border-gray-200 shadow-sm"}`}>
              <div
                className="h-16 w-full"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, rgba(192,132,252,0.18) 0%, rgba(147,51,234,0.08) 100%)"
                    : "linear-gradient(135deg, rgba(192,132,252,0.22) 0%, rgba(147,51,234,0.08) 100%)",
                }}
                aria-hidden="true"
              />
              <div className="px-5 pb-5 -mt-8 flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 rounded-2xl border-[3px] flex items-center justify-center text-2xl font-bold font-display select-none ${
                    isDark ? "bg-primary/20 text-primary border-surface" : "bg-secondary/15 text-secondary border-white"
                  }`}
                  aria-hidden="true"
                >
                  {initial}
                </div>
                <h1 className={`font-display font-extrabold text-xl mt-3 leading-tight ${isDark ? "text-white" : "text-dark"}`}>
                  {displayName}
                </h1>
                {user.email && (
                  <p className={`text-xs mt-1 ${isDark ? "text-white/65" : "text-dark/45"}`}>{user.email}</p>
                )}
              </div>

              <div className={`px-5 py-4 border-t space-y-3.5 ${divider}`}>
                {[
                  { label: t.username,  value: user.username   },
                  { label: t.email,     value: user.email      },
                  { label: t.firstName, value: user.first_name },
                  { label: t.lastName,  value: user.last_name  },
                ].filter(({ value }) => !!value).map(({ label, value }) => (
                  <div key={label}>
                    <p className={`text-[10px] font-semibold uppercase tracking-widest mb-0.5 ${isDark ? "text-white/60" : "text-gray-400"}`}>{label}</p>
                    <p className={`text-sm font-medium break-all ${isDark ? "text-white" : "text-dark"}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className={`px-5 py-4 border-t flex gap-2 ${divider}`}>
                <button
                  type="button"
                  onClick={reload}
                  className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isDark ? "border-border text-white/60 hover:bg-white/5 hover:text-white" : "border-gray-200 text-dark/60 hover:bg-gray-50 hover:text-dark"
                  }`}
                >
                  {t.refresh}
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className={`flex-1 py-2 text-xs font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isDark ? "bg-white/5 text-white/70 hover:bg-white/10" : "bg-gray-100 text-dark/70 hover:bg-gray-200"
                  }`}
                >
                  {t.signout}
                </button>
              </div>
            </div>

            {/* Mini stats */}
            {!dashLoading && dashData && (
              <div className={`rounded-2xl border p-4 ${isDark ? "bg-surface border-border" : "bg-white border-gray-200 shadow-sm"}`}>
                <p className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${isDark ? "text-white/60" : "text-gray-400"}`}>
                  {t.dashboard_title}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: dashData.formations_inscrites, label: language === "fr" ? "Formations" : "Courses",  color: "#c084fc" },
                    { value: dashData.articles_lus,         label: language === "fr" ? "Articles"   : "Articles", color: "#34d399" },
                    { value: dashData.feedbacks_laisses,    label: language === "fr" ? "Avis"        : "Reviews",  color: "#38bdf8" },
                  ].map(({ value, label, color }) => (
                    <div key={label} className={`rounded-xl p-2.5 text-center ${isDark ? "bg-surface-2" : "bg-gray-50"}`}>
                      <p className="text-lg font-bold font-display tabular-nums" style={{ color }}>{value ?? "—"}</p>
                      <p className={`text-[10px] mt-0.5 leading-tight ${isDark ? "text-white/60" : "text-dark/40"}`}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0 space-y-5">

            <DashboardStats data={dashData} loading={dashLoading} error={dashError} theme={theme} hideCards />

            <TrainingsList formations={formations} fbMap={fbMap} loading={fLoading || fbLoading} error={fError} theme={theme} t={t} onGiveFeedback={openFeedback} />

            {/* Login history */}
            <section>
              <button
                type="button"
                onClick={() => setShowLoginHistory((v) => !v)}
                className={`flex items-center justify-between gap-2 text-sm font-medium px-4 py-3 w-full rounded-2xl border transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isDark ? "border-border text-white/50 hover:text-white hover:bg-white/5" : "border-gray-200 text-dark/50 hover:text-dark hover:bg-gray-50"
                }`}
                aria-expanded={showLoginHistory}
              >
                <span>{language === "fr" ? "Historique des connexions" : "Login history"}</span>
                <svg className={`w-3.5 h-3.5 transition-transform shrink-0 ${showLoginHistory ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {showLoginHistory && (
                <div className={`mt-2 rounded-2xl border overflow-hidden ${isDark ? "bg-surface border-border" : "bg-white border-gray-200 shadow-sm"}`}>
              {loginHistoryLoading && (
                <div className={`p-5 text-sm ${isDark ? "text-white/70" : "text-dark/50"}`}>
                  {language === "fr" ? "Chargement…" : "Loading…"}
                </div>
              )}
              {!loginHistoryLoading && loginHistory.length === 0 && (
                <div className={`p-5 text-sm ${isDark ? "text-white/70" : "text-dark/50"}`}>
                  {language === "fr" ? "Aucun événement enregistré." : "No events recorded."}
                </div>
              )}
              {!loginHistoryLoading && loginHistory.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className={`text-left text-[11px] uppercase tracking-[.1em] ${
                          isDark ? "bg-white/5 text-white/60" : "bg-gray-50 text-dark/40"
                        }`}
                      >
                        <th className="px-5 py-3 font-semibold">
                          {language === "fr" ? "Date" : "Date"}
                        </th>
                        <th className="px-5 py-3 font-semibold">
                          {language === "fr" ? "Statut" : "Status"}
                        </th>
                        <th className="px-5 py-3 font-semibold">IP</th>
                        <th className="px-5 py-3 font-semibold">
                          {language === "fr" ? "Navigateur" : "Browser"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-border" : "divide-gray-100"}`}>
                      {loginHistory.slice(0, 5).map((ev) => (
                        <tr
                          key={ev.id}
                          className={
                            !ev.success
                              ? isDark ? "bg-red-500/5" : "bg-red-50/60"
                              : ""
                          }
                        >
                          <td className={`px-5 py-3 whitespace-nowrap text-xs ${isDark ? "text-white/70" : "text-dark/50"}`}>
                            {new Date(ev.created_at).toLocaleString(
                              language === "fr" ? "fr-FR" : "en-US"
                            )}
                          </td>
                          <td className="px-5 py-3 text-xs">
                            {ev.success ? (
                              <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                                {language === "fr" ? "Succès" : "Success"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                {language === "fr" ? "Échec" : "Failed"}
                              </span>
                            )}
                          </td>
                          <td className={`px-5 py-3 text-xs ${isDark ? "text-white/70" : "text-dark/50"}`}>
                            {ev.ip_address || "—"}
                          </td>
                          <td className={`px-5 py-3 text-xs truncate max-w-[160px] ${isDark ? "text-white/60" : "text-dark/40"}`}>
                            {ev.user_agent
                              ? ev.user_agent.split(" ").slice(0, 3).join(" ")
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>

            {/* RGPD */}
            <DataRights theme={theme} t={t} onSignedOut={logout} />

          </div>{/* end main content */}
        </div>{/* end flex row */}
      </div>

      <FeedbackModal
        open={openFb}
        onClose={closeFeedback}
        userId={userId}
        formation={selectedFormation}
        theme={theme}
        language={language}
        onSuccess={handleFeedbackCreated}
      />
    </main>
  );
}
