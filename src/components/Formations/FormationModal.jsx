import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Button from "../../components/Button";
import { getEnv } from "../../lib/env";
import { getCookie } from "../../lib/cookies";

const API_BASE = getEnv("VITE_API_URL", "http://localhost:8000/api");

export default function FormationModal({ open, onClose, formation, theme, t, user }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [progress, setProgress] = useState(null); // { progress_percent, total_modules, completed_modules }

  const fetchModules = useCallback(async () => {
    if (!formation?.id) return;
    setModulesLoading(true);
    try {
      const r = await fetch(`${API_BASE}/formations/${formation.id}/modules/`, { credentials: "include" });
      if (r.ok) setModules(await r.json());
    } catch { /* noop */ }
    finally { setModulesLoading(false); }
  }, [formation?.id]);

  const fetchProgress = useCallback(async () => {
    if (!formation?.id || !user) return;
    try {
      const r = await fetch(`${API_BASE}/formations/${formation.id}/progress/`, { credentials: "include" });
      if (r.ok) setProgress(await r.json());
    } catch { /* noop */ }
  }, [formation?.id, user]);

  useEffect(() => {
    if (open) { fetchModules(); fetchProgress(); }
    else { setModules([]); setProgress(null); }
  }, [open, fetchModules, fetchProgress]);

  const toggleModule = useCallback(async (module) => {
    const csrfToken = getCookie("csrftoken");
    const method = module.is_completed ? "DELETE" : "POST";
    try {
      const r = await fetch(`${API_BASE}/modules/${module.id}/complete/`, {
        method,
        credentials: "include",
        headers: csrfToken ? { "X-CSRFToken": csrfToken } : {},
      });
      if (r.ok) {
        const data = await r.json();
        setModules((prev) => prev.map((m) => m.id === module.id ? { ...m, is_completed: data.is_completed } : m));
        setProgress((prev) => prev ? { ...prev, progress_percent: data.progress_percent } : prev);
      }
    } catch { /* noop */ }
  }, []);

  if (!open || !formation) return null;

  const title = formation?.name || "";
  const description = formation?.description || "";

  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";
  const metaColor = theme === "dark" ? "text-white/80" : "text-gray-700";

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="formation-modal-title"
        className={`fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl rounded-xl border shadow-lg ${card}`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 id="formation-modal-title" className="text-xl md:text-2xl font-semibold">{title}</h2>
            <Button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-md border text-sm ${
                theme === "dark"
                  ? "bg-[#262626] text-white border-[#333] hover:bg-[#303030]"
                  : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
              }`}
              aria-label={t.close}
              title={t.close}
              autoFocus
            >
              ✕ {t.close}
            </Button>
          </div>

          {description ? (
            <p className={`${metaColor} whitespace-pre-line`}>{description}</p>
          ) : (
            <p className={metaColor}>—</p>
          )}

          {/* Progression + modules */}
          {user && (modules.length > 0 || modulesLoading) && (
            <div className="mt-5">
              {/* Barre de progression */}
              {progress !== null && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={metaColor}>Progression</span>
                    <span className={`font-medium ${progress.progress_percent === 100 ? "text-green-500" : metaColor}`}>
                      {progress.completed_modules}/{progress.total_modules} modules — {progress.progress_percent}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-gray-100"}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress.progress_percent === 100 ? "bg-green-500" : "bg-indigo-500"
                      }`}
                      style={{ width: `${progress.progress_percent}%` }}
                      role="progressbar"
                      aria-valuenow={progress.progress_percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              )}

              {/* Liste des modules */}
              {modulesLoading ? (
                <div className="space-y-2 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-10 rounded-lg ${theme === "dark" ? "bg-white/5" : "bg-gray-100"}`} />
                  ))}
                </div>
              ) : (
                <ul className="space-y-2">
                  {modules.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => toggleModule(m)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                          m.is_completed
                            ? theme === "dark"
                              ? "border-green-500/30 bg-green-500/10"
                              : "border-green-200 bg-green-50"
                            : theme === "dark"
                            ? "border-[#333] hover:bg-white/5"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        aria-pressed={m.is_completed}
                      >
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            m.is_completed
                              ? "border-green-500 bg-green-500 text-white"
                              : theme === "dark" ? "border-white/30" : "border-gray-300"
                          }`}
                          aria-hidden="true"
                        >
                          {m.is_completed && "✓"}
                        </span>
                        <span className="text-sm font-medium">{m.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Bloc CTA Contact */}
          <div
            className={`mt-6 p-4 rounded-lg border ${
              theme === "dark" ? "border-primary/40 bg-[#262626]" : "border-secondary/40 bg-white"
            }`}
          >
            <p className="mb-3">
              Pour vous inscrire ou avoir plus de details sur cette formation, contacter nous.
            </p>
            <Button
              to="/contact"
              className={`px-4 py-2 rounded-md shadow text-sm hover:brightness-110 ${
                theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
              }`}
            >
              {t.contact_us}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
