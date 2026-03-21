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

  // Utilise la progression chargée, ou le champ du parent si disponible
  const progress = progressDetail?.progress_percent ?? formation.progress_percent ?? null;

  return (
    <div className={`rounded-lg border p-4 ${card}`}>

      {/* ── Titre + bouton feedback (100% seulement) ── */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-medium leading-snug">{formation.name || "—"}</p>
        {progress === 100 && (
          existingFeedback ? (
            <span className="shrink-0 text-xs px-2 py-1 rounded border border-green-500 text-green-500 font-medium whitespace-nowrap">
              ✓ {t.already_sent}
            </span>
          ) : (
            <button
              onClick={() => onGiveFeedback(formation)}
              className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium shadow hover:brightness-110 transition ${
                theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
              }`}
            >
              {t.feedback}
            </button>
          )
        )}
      </div>

      {/* ── Progression + bouton Continuer ── */}
      <div className="mt-3 space-y-2">
        {/* Barre + pourcentage */}
        <div className="flex items-center gap-3">
          <div className={`flex-1 h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-gray-100"}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? "bg-green-500" : "bg-indigo-500"}`}
              style={{ width: `${progress ?? 0}%` }}
              role="progressbar"
              aria-valuenow={progress ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className={`text-sm font-bold shrink-0 w-10 text-right tabular-nums ${
            progress === 100 ? "text-green-500" : progress > 0 ? "text-indigo-500" : muted
          }`}>
            {progress ?? 0}%
          </span>
        </div>

        {/* Bouton Continuer / Commencer / Revoir */}
        <div className="flex items-center gap-3">
          <Link
            to={`/formation/${formation.id}/learn`}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              progress === 100
                ? theme === "dark" ? "bg-green-600/20 text-green-400 hover:bg-green-600/30" : "bg-green-100 text-green-700 hover:bg-green-200"
                : progress > 0
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : theme === "dark" ? "bg-white/10 text-white hover:bg-white/15" : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            {progress === 100 ? "✓ Revoir" : progress > 0 ? "Continuer →" : "Commencer →"}
          </Link>

          {progress !== null && (
            <button
              type="button"
              onClick={() => setShowModules((v) => !v)}
              className={`text-xs hover:underline underline-offset-2 ${muted}`}
            >
              {showModules ? "Masquer le détail" : "Voir le détail"}
            </button>
          )}
        </div>
      </div>

      {/* Détail modules */}
      {showModules && (
        <div className="mt-3 space-y-2">
          {loading ? (
            <div className={`text-xs ${muted}`}>Chargement…</div>
          ) : progressDetail?.modules?.length > 0 ? (
            progressDetail.modules.map((m) => (
              <div key={m.id} className={`rounded-lg border p-3 ${innerCard}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                    m.is_completed
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-current opacity-40"
                  }`} aria-hidden="true">
                    {m.is_completed ? "✓" : m.order + 1}
                  </span>
                  <span className="text-sm font-medium flex-1 truncate">{m.title}</span>
                  {m.is_completed && (
                    <span className="text-xs text-green-500 shrink-0">Validé</span>
                  )}
                </div>

                {/* Cours progress */}
                {m.total_cours > 0 && (
                  <div className="mt-2 ml-7">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={muted}>{m.completed_cours}/{m.total_cours} cours</span>
                      {m.has_qcm && (
                        <span className={m.qcm_passed ? "text-green-500" : muted}>
                          QCM {m.qcm_passed ? "✓" : "à passer"}
                        </span>
                      )}
                    </div>
                    <div className={`h-1 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          m.is_completed ? "bg-green-500" : "bg-indigo-400"
                        }`}
                        style={{ width: `${m.total_cours ? Math.round(m.completed_cours / m.total_cours * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={`text-xs ${muted}`}>Aucun module dans cette formation.</div>
          )}
        </div>
      )}

      {/* Feedback existant */}
      {existingFeedback && (
        <div className={`mt-3 rounded-md border p-3 text-sm ${innerCard}`}>
          <div className="font-medium mb-1">{t.your_feedback}</div>
          <p className={muted}>{existingFeedback.feedback_content || "—"}</p>
        </div>
      )}
    </div>
  );
}
