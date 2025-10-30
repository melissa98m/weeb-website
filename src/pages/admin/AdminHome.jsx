import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { hasAnyStaffRole, hasAnyRedactionRole, hasPersonnelRole } from "../../utils/roles";
import AdminAccessFooter from "../../components/admin/AdminAccessFooter";

// Normalise toujours vers .../api
const API_BASE = (() => {
  const raw = (import.meta.env.VITE_API_URL ?? "http://localhost:8000") + "";
  const base = raw.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
})();

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

export default function AdminHome() {
  const { user } = useAuth();
  const { theme } = useTheme();

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
                  {fbPending !== null && <MiniBadge theme={theme === "dark" ? "dark" : "light"}>{fbPending}</MiniBadge>}
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
                  {msgPending !== null && <MiniBadge theme={theme === "dark" ? "dark" : "light"}>{msgPending}</MiniBadge>}
                </div>
                <div className="text-sm opacity-80">Traiter les demandes entrantes.</div>
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

      {/* Footer accès/roles */}
      <div className="mt-4">
        <AdminAccessFooter />
      </div>
    </main>
  );
}
