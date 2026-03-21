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

  // SEO : profil utilisateur — données personnelles, jamais indexées
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

  // ---------- Formations + Feedbacks + Dashboard (parallèle) ----------
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

      // Formations
      if (formationsRes.status === "fulfilled") {
        setFormations(formationsRes.value);
        setFError(null);
      } else {
        setFormations([]);
        setFError(formationsRes.reason);
      }
      setFLoading(false);

      // Feedbacks → map { formation_id: feedback }
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

      // Dashboard
      if (dashRes.status === "fulfilled") {
        setDashData(dashRes.value);
        setDashError(null);
      } else {
        setDashError(dashRes.reason?.message || "Erreur");
      }
      setDashLoading(false);
    })();

    return () => { alive = false; ctr.abort(); };
  }, [API_BASE, authLoading, userId]);

  // ---------- Historique connexions ----------
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

  // ---------- Modale feedback ----------
  const [openFb, setOpenFb] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);

  // tant que l'auth charge, on peut afficher un skeleton basique
  if (authLoading) {
    return (
      <main className="min-h-[60vh] px-6 py-16 flex justify-center">
        <div className={`w-full max-w-2xl rounded-xl border shadow p-6 ${theme==="dark"?"bg-[#1c1c1c] border-[#333]":"bg-white border-gray-200"}`}>
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-1/3 bg-gray-300/30 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-gray-300/30 rounded" />
              <div className="h-4 bg-gray-300/30 rounded" />
              <div className="h-4 bg-gray-300/30 rounded" />
              <div className="h-4 bg-gray-300/30 rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const openFeedback = (formation) => {
    if (fbMap[formation.id]) return; // si déjà envoyé, on bloque
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
    <main className="min-h-[60vh] px-6 py-16 flex justify-center">
      <div className="w-full max-w-2xl">
        <ProfileInfo
          user={user}
          t={t}
          theme={theme}
          onRefresh={reload}
          onSignout={logout}
        />

        <DashboardStats
          data={dashData}
          loading={dashLoading}
          error={dashError}
          theme={theme}
        />

        <TrainingsList
          formations={formations}
          fbMap={fbMap}
          loading={fLoading || fbLoading}
          error={fError}
          theme={theme}
          t={t}
          onGiveFeedback={openFeedback}
        />

        {/* Historique des connexions */}
        <section className="w-full max-w-2xl mt-10">
          <button
            type="button"
            onClick={() => setShowLoginHistory((v) => !v)}
            className={`flex items-center gap-2 text-sm font-medium mb-3 underline-offset-2 hover:underline ${
              theme === "dark" ? "text-white/70" : "text-gray-600"
            }`}
            aria-expanded={showLoginHistory}
          >
            {showLoginHistory ? "▾" : "▸"} Historique des connexions
          </button>

          {showLoginHistory && (
            <div className={`rounded-xl border shadow overflow-hidden ${theme === "dark" ? "bg-[#1c1c1c] border-[#333]" : "bg-white border-gray-200"}`}>
              {loginHistoryLoading && (
                <div className="p-4 text-sm opacity-60">Chargement…</div>
              )}
              {!loginHistoryLoading && loginHistory.length === 0 && (
                <div className="p-4 text-sm opacity-60">Aucun événement enregistré.</div>
              )}
              {!loginHistoryLoading && loginHistory.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`text-left text-xs uppercase tracking-wide ${theme === "dark" ? "bg-white/5 text-white/50" : "bg-gray-50 text-gray-500"}`}>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Statut</th>
                        <th className="px-4 py-2">IP</th>
                        <th className="px-4 py-2">Navigateur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-current/5">
                      {loginHistory.map((ev) => (
                        <tr key={ev.id} className={`${!ev.success ? theme === "dark" ? "bg-red-500/5" : "bg-red-50" : ""}`}>
                          <td className="px-4 py-2 whitespace-nowrap opacity-70">
                            {new Date(ev.created_at).toLocaleString(language === "fr" ? "fr-FR" : "en-US")}
                          </td>
                          <td className="px-4 py-2">
                            {ev.success
                              ? <span className="text-green-500 font-medium">✓ Succès</span>
                              : <span className="text-red-400 font-medium">✗ Échec</span>
                            }
                          </td>
                          <td className="px-4 py-2 opacity-70">{ev.ip_address || "—"}</td>
                          <td className="px-4 py-2 opacity-60 truncate max-w-[200px]">
                            {ev.user_agent ? ev.user_agent.split(" ").slice(0, 3).join(" ") : "—"}
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
