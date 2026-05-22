import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import ProfileInfo from "../components/profile/ProfileInfo";
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

  return (
    <main className="min-h-screen px-6 pt-28 pb-20">
      <div className="max-w-3xl mx-auto">

        {/* Greeting */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-display shrink-0 select-none ${
                isDark ? "bg-primary/15 text-primary" : "bg-secondary/10 text-secondary"
              }`}
              aria-hidden="true"
            >
              {(user.first_name?.[0] || user.username?.[0] || "?").toUpperCase()}
            </div>
            <div>
              <p
                className={`font-display font-extrabold text-2xl md:text-3xl leading-tight ${
                  isDark ? "text-white" : "text-dark"
                }`}
              >
                {language === "fr"
                  ? `Bonjour, ${user.first_name || user.username || ""}`.trim()
                  : `Hello, ${user.first_name || user.username || ""}`.trim()}
              </p>
              {user.email && (
                <p className={`text-sm mt-0.5 ${isDark ? "text-white/45" : "text-dark/45"}`}>
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Profile info */}
        <ProfileInfo
          user={user}
          t={t}
          theme={theme}
          onRefresh={reload}
          onSignout={logout}
        />

        {/* Dashboard stats */}
        <DashboardStats
          data={dashData}
          loading={dashLoading}
          error={dashError}
          theme={theme}
        />

        {/* Trainings */}
        <TrainingsList
          formations={formations}
          fbMap={fbMap}
          loading={fLoading || fbLoading}
          error={fError}
          theme={theme}
          t={t}
          onGiveFeedback={openFeedback}
        />

        {/* Login history */}
        <section className="mt-6">
          <button
            type="button"
            onClick={() => setShowLoginHistory((v) => !v)}
            className={`flex items-center gap-2 text-sm font-medium mb-3 rounded-lg px-3 py-2 -mx-3 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isDark
                ? "text-white/50 hover:text-white hover:bg-white/5"
                : "text-dark/50 hover:text-dark hover:bg-gray-100/80"
            }`}
            aria-expanded={showLoginHistory}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${showLoginHistory ? "rotate-90" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            {language === "fr" ? "Historique des connexions" : "Login history"}
          </button>

          {showLoginHistory && (
            <div
              className={`rounded-2xl border overflow-hidden ${
                isDark ? "bg-surface border-border" : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              {loginHistoryLoading && (
                <div className={`p-5 text-sm ${isDark ? "text-white/50" : "text-dark/50"}`}>
                  {language === "fr" ? "Chargement…" : "Loading…"}
                </div>
              )}
              {!loginHistoryLoading && loginHistory.length === 0 && (
                <div className={`p-5 text-sm ${isDark ? "text-white/50" : "text-dark/50"}`}>
                  {language === "fr" ? "Aucun événement enregistré." : "No events recorded."}
                </div>
              )}
              {!loginHistoryLoading && loginHistory.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className={`text-left text-[11px] uppercase tracking-[.1em] ${
                          isDark ? "bg-white/5 text-white/40" : "bg-gray-50 text-dark/40"
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
                          <td className={`px-5 py-3 whitespace-nowrap text-xs ${isDark ? "text-white/50" : "text-dark/50"}`}>
                            {new Date(ev.created_at).toLocaleString(
                              language === "fr" ? "fr-FR" : "en-US"
                            )}
                          </td>
                          <td className="px-5 py-3 text-xs">
                            {ev.success ? (
                              <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                                <span>✓</span>
                                {language === "fr" ? "Succès" : "Success"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                                <span>✗</span>
                                {language === "fr" ? "Échec" : "Failed"}
                              </span>
                            )}
                          </td>
                          <td className={`px-5 py-3 text-xs ${isDark ? "text-white/50" : "text-dark/50"}`}>
                            {ev.ip_address || "—"}
                          </td>
                          <td className={`px-5 py-3 text-xs truncate max-w-[160px] ${isDark ? "text-white/40" : "text-dark/40"}`}>
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

        {/* Data rights (RGPD) */}
        <DataRights theme={theme} t={t} onSignedOut={logout} />
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
