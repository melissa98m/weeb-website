import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { hasAnyStaffRole, hasAnyRedactionRole, hasPersonnelRole } from "../../utils/roles";
import AdminAccessFooter from "../../components/admin/AdminAccessFooter";
import ExportCSVButton from "../../components/admin/ExportCSVButton";
import AnalyticsCharts from "../../components/admin/AnalyticsCharts";
import { API_BASE } from "../../lib/api";

/* ==== Icônes (SVG inline, zéro dépendance) ==== */
function IconLink({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 7h2a4 4 0 0 1 0 8H8" />
      <path d="M16 17h-2a4 4 0 0 1 0-8h2" />
      <path d="M9 12h6" />
    </svg>
  );
}
function IconCap({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4l9 5-9 5-9-5 9-5z" />
      <path d="M4 10v4l8 4 8-4v-4" />
    </svg>
  );
}
function IconMail({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconMessage({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="14" rx="3" />
      <path d="M3 9l9 4 9-4" />
    </svg>
  );
}
function IconInbox({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 13h5l2 3h4l2-3h5" />
    </svg>
  );
}
function IconPen({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

/* ==== Mini badge ==== */
function MiniBadge({ children, theme = "light", title = "À traiter" }) {
  const base = "px-2 py-0.5 rounded-full text-xs leading-none font-semibold border";
  const light = "bg-amber-200 text-amber-800 border-amber-200";
  const dark = "bg-amber-600/20 text-amber-300 border-amber-700/40";
  return (
    <span className={`${base} ${theme === "dark" ? dark : light}`} title={title}>
      {children}
    </span>
  );
}


function ExportSection({ card, ghostBtn, theme, canStaff, canPersonnel }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const inputClass = `rounded-lg border px-2 py-1 text-sm ${
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333] placeholder:text-white/40"
      : "bg-white text-gray-900 border-gray-200"
  }`;

  return (
    <div className="space-y-3">
      {/* Filtres de date */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          Du&nbsp;:
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={inputClass}
            aria-label="Date de début"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          Au&nbsp;:
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={inputClass}
            aria-label="Date de fin"
          />
        </label>
      </div>

      {/* Boutons d'export */}
      <div className="flex flex-wrap gap-2">
        {canPersonnel && (
          <ExportCSVButton
            type="inscrits"
            dateFrom={dateFrom}
            dateTo={dateTo}
            className={ghostBtn}
          />
        )}
        {canStaff && (
          <>
            <ExportCSVButton
              type="feedbacks"
              dateFrom={dateFrom}
              dateTo={dateTo}
              className={ghostBtn}
            />
            <ExportCSVButton
              type="messages"
              dateFrom={dateFrom}
              dateTo={dateTo}
              className={ghostBtn}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminHome() {
  const { user } = useAuth();
  const { theme } = useTheme();

  // SEO : les pages admin ne doivent jamais être indexées
  useEffect(() => {
    const prev = document.title;
    document.title = "Administration | Weeb";
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.name = "robots";
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = "noindex, nofollow";
    return () => { document.title = prev; };
  }, []);

  // Visibilités par rôle
  const canStaff = hasAnyStaffRole(user);       // ex: Commercial / Personnel
  const canPersonnel = hasPersonnelRole(user);  // permissions “Personnel”
  const canRedact = hasAnyRedactionRole(user);  // Rédaction

  const card =
    theme === "dark" ? "bg-[#262626] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200";
  const ghostBtn =
    theme === "dark" ? "bg-[#1c1c1c] text-white border-[#333] hover:bg-[#222]" : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50";

  // Compteurs “à traiter”
  const [fbPending, setFbPending] = useState(null);
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
    try {
      // Feedbacks “à traiter”
      const c1 = await fetchCount(`${API_BASE}/feedbacks/?to_process=false`, ac.signal);
      setFbPending(c1);
    } catch { setFbPending(null); }
    try {
      // Messages “à traiter”
      const c2 = await fetchCount(`${API_BASE}/messages/?is_processed=false`, ac.signal);
      setMsgPending(c2);
    } catch { setMsgPending(null); }
  }, [fetchCount]);

  useEffect(() => {
    loadCounts();
    const id = setInterval(loadCounts, 30000);
    return () => { clearInterval(id); ctrlRef.current?.abort(); };
  }, [loadCounts]);

  return (
    <main className="px-4 md:px-6 py-6">
      {/* Titre + bonjour */}
      <header className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Espace d’administration</h1>
        <p className={theme === "dark" ? "text-white/70" : "text-gray-600"}>
          Bonjour{user?.username ? `, ${user.username}` : ""}. Choisissez une section.
        </p>
      </header>

      {/* Grille de raccourcis (affichés selon rôles) */}
      <section className={`rounded-2xl border p-3 ${card}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Affectations (Personnel / Staff) */}
          {(canPersonnel || canStaff) && (
            <Link to="/admin/user-formations" className={`rounded-xl border p-4 flex items-start gap-3 hover:brightness-105 transition ${card}`}>
              <div className="mt-0.5"><IconLink /></div>
              <div className="min-w-0">
                <div className="font-semibold">Affectations</div>
                <div className="text-sm opacity-80">Gérer l’appartenance des utilisateurs aux formations.</div>
              </div>
            </Link>
          )}

          {/* Formations (Personnel) */}
          {canPersonnel && (
            <Link to="/admin/formations" className={`rounded-xl border p-4 flex items-start gap-3 hover:brightness-105 transition ${card}`}>
              <div className="mt-0.5"><IconCap /></div>
              <div className="min-w-0">
                <div className="font-semibold">Formations</div>
                <div className="text-sm opacity-80">Créer, lister, supprimer des formations.</div>
              </div>
            </Link>
          )}

          {/* Articles (Rédaction) */}
          {canRedact && (
            <Link to="/admin/articles" className={`rounded-xl border p-4 flex items-start gap-3 hover:brightness-105 transition ${card}`}>
              <div className="mt-0.5"><IconPen /></div>
              <div className="min-w-0">
                <div className="font-semibold">Articles</div>
                <div className="text-sm opacity-80">Rédiger, éditer et taguer par genres.</div>
              </div>
            </Link>
          )}

          {/* Feedbacks (Staff) */}
          {canStaff && (
            <Link to="/admin/feedbacks" className={`rounded-xl border p-4 flex items-start gap-3 hover:brightness-105 transition ${card}`}>
              <div className="mt-0.5"><IconMessage /></div>
              <div className="min-w-0">
                <div className="font-semibold flex items-center gap-2">
                  Feedbacks
                  {fbPending !== null && <MiniBadge theme={theme === "dark" ? "dark" : "light"} title={`${fbPending} feedback${fbPending !== 1 ? "s" : ""} à traiter`}>{fbPending}</MiniBadge>}
                </div>
                <div className="text-sm opacity-80">Suivre la satisfaction et traiter les retours.</div>
              </div>
            </Link>
          )}

          {/* Messages (Staff) */}
          {canStaff && (
            <Link to="/admin/messages" className={`rounded-xl border p-4 flex items-start gap-3 hover:brightness-105 transition ${card}`}>
              <div className="mt-0.5"><IconInbox /></div>
              <div className="min-w-0">
                <div className="font-semibold flex items-center gap-2">
                  Messages
                  {msgPending !== null && <MiniBadge theme={theme === "dark" ? "dark" : "light"} title={`${msgPending} message${msgPending !== 1 ? "s" : ""} à traiter`}>{msgPending}</MiniBadge>}
                </div>
                <div className="text-sm opacity-80">Traiter les demandes entrantes.</div>
              </div>
            </Link>
          )}

          {/* Newsletter (Admin) */}
          {(user?.is_staff || user?.is_superuser) && (
            <Link to="/admin/newsletter" className={`rounded-xl border p-4 flex items-start gap-3 hover:brightness-105 transition ${card}`}>
              <div className="mt-0.5"><IconMail /></div>
              <div className="min-w-0">
                <div className="font-semibold">Newsletter</div>
                <div className="text-sm opacity-80">Composer et envoyer des campagnes aux abonnés.</div>
              </div>
            </Link>
          )}
        </div>

        {/* Actions utilitaires */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={loadCounts} className={`rounded-lg border px-3 py-1.5 text-sm ${ghostBtn}`}>
            Recharger les compteurs
          </button>
        </div>
      </section>

      {/* Dashboard analytique (admins uniquement) */}
      {(user?.is_staff || user?.is_superuser) && (
        <section className={`mt-4 rounded-2xl border p-4 ${card}`}>
          <h2 className="text-base font-semibold">Analytiques</h2>
          <AnalyticsCharts theme={theme} />
        </section>
      )}

      {/* Exports CSV (admins uniquement) */}
      {(canStaff || canPersonnel || canRedact) && (
        <section className={`mt-4 rounded-2xl border p-4 ${card}`}>
          <h2 className="text-base font-semibold mb-3">Exports CSV</h2>
          <ExportSection card={card} ghostBtn={ghostBtn} theme={theme} canStaff={canStaff} canPersonnel={canPersonnel} />
        </section>
      )}

      {/* Footer accès/roles */}
      <div className="mt-4">
        <AdminAccessFooter />
      </div>
    </main>
  );
}
