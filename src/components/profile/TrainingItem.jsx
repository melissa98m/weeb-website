import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getEnv } from "../../lib/env";

const API_BASE = getEnv("VITE_API_URL", "http://localhost:8000/api");

export default function TrainingItem({ formation, existingFeedback, theme, t, onGiveFeedback }) {
  const isDark = theme === "dark";
  const card = isDark ? "bg-surface border-border" : "bg-white border-gray-200";
  const muted = isDark ? "text-white/60" : "text-gray-500";
  const innerCard = isDark ? "bg-surface-2 border-border/60" : "bg-gray-50 border-gray-100";

  const [showModules, setShowModules] = useState(false);
  const [progressDetail, setProgressDetail] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const totalCours = progressDetail?.modules?.reduce((s, m) => s + (m.total_cours || 0), 0) ?? null;
  const doneCours  = progressDetail?.modules?.reduce((s, m) => s + (m.completed_cours || 0), 0) ?? null;

  const isCompleted = progress === 100;
  const isStarted   = progress > 0 && progress < 100;

  return (
    <div className={`rounded-2xl border ${card} overflow-hidden`}>
      {/* Top progress bar */}
      <div className={`h-1 w-full ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
        <div
          className={`h-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-primary"}`}
          style={{ width: `${progress ?? 0}%` }}
        />
      </div>

      <div className="p-4 sm:p-5">
        {/* Title + status badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className={`text-base font-semibold leading-snug truncate ${isDark ? "text-white" : "text-dark"}`}>
              {formation.name || "—"}
            </p>
            {totalCours !== null && (
              <p className={`text-xs mt-0.5 ${muted}`}>
                {doneCours}/{totalCours} cours terminé{doneCours !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {isCompleted ? (
            <span className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold border border-emerald-500/30 whitespace-nowrap">
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Terminé
            </span>
          ) : isStarted ? (
            <span className={`shrink-0 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold border whitespace-nowrap ${
              isDark ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary/10 text-secondary border-secondary/25"
            }`}>
              En cours
            </span>
          ) : null}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-primary"}`}
                style={{ width: `${progress ?? 0}%` }}
                role="progressbar"
                aria-valuenow={progress ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progression : ${progress ?? 0}%`}
              />
            </div>
            <span className={`text-sm font-bold shrink-0 w-10 text-right tabular-nums ${
              isCompleted ? "text-emerald-500" : isStarted ? "text-primary" : muted
            }`}>
              {progress ?? 0}%
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/formation/${formation.id}/learn`}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition min-h-[40px] ${
              isCompleted
                ? isDark
                  ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : isStarted
                ? "bg-secondary text-white hover:brightness-110"
                : isDark
                ? "bg-white/10 text-white hover:bg-white/15"
                : "bg-dark text-white hover:brightness-110"
            }`}
          >
            {isCompleted ? (
              <>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.59"/></svg>
                Revoir
              </>
            ) : isStarted ? (
              <>
                Continuer
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </>
            ) : (
              <>
                Commencer
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </>
            )}
          </Link>

          {isCompleted && (
            existingFeedback ? (
              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium ${
                isDark ? "border-border/60 text-white/60" : "border-gray-200 text-gray-400"
              }`}>
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                {t.already_sent}
              </span>
            ) : (
              <button
                onClick={() => onGiveFeedback(formation)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold hover:brightness-110 transition min-h-[40px] ${
                  isDark ? "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25" : "bg-secondary text-white hover:brightness-110"
                }`}
              >
                {t.feedback}
              </button>
            )
          )}

          {progress !== null && (
            <button
              type="button"
              onClick={() => setShowModules((v) => !v)}
              className={`ml-auto text-xs transition-colors min-h-[40px] px-2 flex items-center gap-1 ${
                isDark ? "text-white/60 hover:text-white/70" : "text-gray-400 hover:text-gray-600"
              }`}
              aria-expanded={showModules}
              aria-controls={`modules-${formation.id}`}
            >
              <svg
                width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                className={`transition-transform ${showModules ? "rotate-90" : ""}`}
              >
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              {showModules ? "Masquer" : "Détails"}
            </button>
          )}
        </div>

        {/* Module details */}
        {showModules && (
          <div id={`modules-${formation.id}`} className="mt-4 space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className={`h-14 rounded-xl animate-pulse ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
                ))}
              </div>
            ) : progressDetail?.modules?.length > 0 ? (
              progressDetail.modules.map((m) => {
                const modPct = m.total_cours ? Math.round((m.completed_cours / m.total_cours) * 100) : 0;
                return (
                  <div key={m.id} className={`rounded-xl border p-3 ${innerCard}`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0 transition ${
                        m.is_completed
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : modPct > 0
                          ? isDark ? "border-primary/60 text-primary" : "border-secondary/60 text-secondary"
                          : isDark ? "border-white/15 text-white/60" : "border-gray-300 text-gray-300"
                      }`} aria-hidden="true">
                        {m.is_completed ? (
                          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : m.order + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold truncate flex-1 ${isDark ? "text-white" : "text-dark"}`}>{m.title}</span>
                          {m.is_completed && (
                            <span className="text-[10px] text-emerald-500 font-semibold shrink-0">Validé</span>
                          )}
                        </div>

                        {m.total_cours > 0 && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className={`flex-1 h-1 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-gray-200"}`}>
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${m.is_completed ? "bg-emerald-500" : "bg-primary"}`}
                                style={{ width: `${modPct}%` }}
                              />
                            </div>
                            <span className={`text-[10px] shrink-0 tabular-nums ${muted}`}>
                              {m.completed_cours}/{m.total_cours}
                            </span>
                            {m.has_qcm && (
                              <span className={`text-[10px] shrink-0 ${m.qcm_passed ? "text-emerald-500" : muted}`}>
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

        {/* Existing feedback */}
        {existingFeedback && (
          <div className={`mt-4 rounded-xl border p-3 ${innerCard}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${isDark ? "text-white/60" : "text-gray-400"}`}>
              {t.your_feedback}
            </p>
            <p className={`text-sm ${muted}`}>{existingFeedback.feedback_content || "—"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
