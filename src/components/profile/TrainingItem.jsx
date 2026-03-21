import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getEnv } from "../../lib/env";

const API_BASE = getEnv("VITE_API_URL", "http://localhost:8000/api");

export default function TrainingItem({ formation, existingFeedback, theme, t, onGiveFeedback }) {
  const card = theme === "dark" ? "bg-[#1c1c1c] border-[#333]" : "bg-white border-gray-200";
  const muted = theme === "dark" ? "text-white/60" : "text-gray-500";
  const innerCard = theme === "dark" ? "bg-[#262626] border-[#333]" : "bg-gray-50 border-gray-200";

  const [showModules, setShowModules] = useState(false);
  const [progressDetail, setProgressDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  // Charge la progression dès le montage
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/formations/${formation.id}/progress/`, { credentials: "include" });
        if (r.ok && alive) setProgressDetail(await r.json());
      } catch { /* noop */ }
    })();
    return () => { alive = false; };
  }, [formation.id]);

  const loadDetail = useCallback(async () => {
    if (progressDetail) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/formations/${formation.id}/progress/`, { credentials: "include" });
      if (r.ok) setProgressDetail(await r.json());
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [formation.id, progressDetail]);

  useEffect(() => {
    if (showModules) loadDetail();
  }, [showModules, loadDetail]);

  const progress = progressDetail?.progress_percent ?? formation.progress_percent ?? null;

  // Stats de cours
  const totalCours = progressDetail?.modules?.reduce((s, m) => s + (m.total_cours || 0), 0) ?? null;
  const doneCours = progressDetail?.modules?.reduce((s, m) => s + (m.completed_cours || 0), 0) ?? null;

  const isCompleted = progress === 100;
  const isStarted = progress > 0 && progress < 100;

  return (
    <div className={`rounded-xl border ${card} overflow-hidden`}>
      {/* Barre de progression colorée en haut */}
      <div className="h-1 w-full bg-gray-100 dark:bg-white/5">
        <div
          className={`h-full transition-all duration-500 ${isCompleted ? "bg-green-500" : "bg-indigo-500"}`}
          style={{ width: `${progress ?? 0}%` }}
        />
      </div>

      <div className="p-4">
        {/* ── Titre + badge statut ── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-base font-semibold leading-snug truncate">{formation.name || "—"}</p>
            {totalCours !== null && (
              <p className={`text-xs mt-0.5 ${muted}`}>
                {doneCours}/{totalCours} cours terminé{doneCours !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Badge statut */}
          {isCompleted ? (
            <span className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-500 font-semibold border border-green-500/30 whitespace-nowrap">
              <span className="text-[10px]">✓</span> Terminé
            </span>
          ) : isStarted ? (
            <span className={`shrink-0 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold border whitespace-nowrap ${
              theme === "dark"
                ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                : "bg-indigo-50 text-indigo-600 border-indigo-200"
            }`}>
              En cours
            </span>
          ) : null}
        </div>

        {/* ── Barre de progression ── */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex-1 h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-gray-100"}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-green-500" : "bg-indigo-500"}`}
                style={{ width: `${progress ?? 0}%` }}
                role="progressbar"
                aria-valuenow={progress ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progression : ${progress ?? 0}%`}
              />
            </div>
            <span className={`text-sm font-bold shrink-0 w-10 text-right tabular-nums ${
              isCompleted ? "text-green-500" : isStarted ? "text-indigo-500" : muted
            }`}>
              {progress ?? 0}%
            </span>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/formation/${formation.id}/learn`}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition min-h-[40px] ${
              isCompleted
                ? theme === "dark"
                  ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
                : isStarted
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : theme === "dark"
                ? "bg-white/10 text-white hover:bg-white/15"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            {isCompleted ? (
              <><span>↩</span> Revoir</>
            ) : isStarted ? (
              <>Continuer <span>→</span></>
            ) : (
              <>Commencer <span>→</span></>
            )}
          </Link>

          {/* Feedback (100% seulement) */}
          {isCompleted && (
            existingFeedback ? (
              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium ${
                theme === "dark" ? "border-[#444] text-white/50" : "border-gray-200 text-gray-500"
              }`}>
                ✓ {t.already_sent}
              </span>
            ) : (
              <button
                onClick={() => onGiveFeedback(formation)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold shadow hover:brightness-110 transition min-h-[40px] ${
                  theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
                }`}
              >
                {t.feedback}
              </button>
            )
          )}

          {/* Détail modules */}
          {progress !== null && (
            <button
              type="button"
              onClick={() => setShowModules((v) => !v)}
              className={`ml-auto text-xs hover:underline underline-offset-2 min-h-[40px] px-1 ${muted}`}
              aria-expanded={showModules}
              aria-controls={`modules-${formation.id}`}
            >
              {showModules ? "Masquer" : "Détails"}
            </button>
          )}
        </div>

        {/* ── Détail modules ── */}
        {showModules && (
          <div
            id={`modules-${formation.id}`}
            className="mt-4 space-y-2"
          >
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className={`h-14 rounded-lg animate-pulse ${theme === "dark" ? "bg-white/5" : "bg-gray-100"}`} />
                ))}
              </div>
            ) : progressDetail?.modules?.length > 0 ? (
              progressDetail.modules.map((m) => {
                const modPct = m.total_cours ? Math.round((m.completed_cours / m.total_cours) * 100) : 0;
                return (
                  <div key={m.id} className={`rounded-lg border p-3 ${innerCard}`}>
                    <div className="flex items-center gap-2">
                      {/* Indicateur statut */}
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0 transition ${
                        m.is_completed
                          ? "border-green-500 bg-green-500 text-white"
                          : modPct > 0
                          ? theme === "dark" ? "border-indigo-400 text-indigo-400" : "border-indigo-500 text-indigo-500"
                          : theme === "dark" ? "border-white/20 text-white/20" : "border-gray-300 text-gray-300"
                      }`} aria-hidden="true">
                        {m.is_completed ? "✓" : m.order + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold truncate flex-1">{m.title}</span>
                          {m.is_completed && (
                            <span className="text-[10px] text-green-500 font-semibold shrink-0">Validé</span>
                          )}
                        </div>

                        {m.total_cours > 0 && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className={`flex-1 h-1 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`}>
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${m.is_completed ? "bg-green-500" : "bg-indigo-400"}`}
                                style={{ width: `${modPct}%` }}
                              />
                            </div>
                            <span className={`text-[10px] shrink-0 tabular-nums ${muted}`}>
                              {m.completed_cours}/{m.total_cours}
                            </span>
                            {m.has_qcm && (
                              <span className={`text-[10px] shrink-0 ${m.qcm_passed ? "text-green-500" : muted}`}>
                                QCM {m.qcm_passed ? "✓" : "—"}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={`text-xs ${muted} py-1`}>Aucun module dans cette formation.</p>
            )}
          </div>
        )}

        {/* ── Feedback existant ── */}
        {existingFeedback && (
          <div className={`mt-4 rounded-lg border p-3 text-sm ${innerCard}`}>
            <p className={`text-xs font-semibold mb-1 ${muted}`}>{t.your_feedback}</p>
            <p className={`text-sm ${muted}`}>{existingFeedback.feedback_content || "—"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
