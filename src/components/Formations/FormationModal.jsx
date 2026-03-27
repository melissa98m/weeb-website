import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { getEnv } from "../../lib/env";
import { getCookie } from "../../lib/cookies";

const API_BASE = getEnv("VITE_API_URL", "http://localhost:8000/api");

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function ProgressBar({ value, max = 100, green = false }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 rounded-full overflow-hidden bg-white/10 dark:bg-white/10 bg-gray-100">
      <div
        className={`h-full rounded-full transition-all duration-500 ${green || pct === 100 ? "bg-green-500" : "bg-indigo-500"}`}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

/* ── QCM Component ───────────────────────────────────────────────────────── */
function QCMPanel({ moduleId, theme, onPassed }) {
  const [qcm, setQcm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const card = theme === "dark" ? "bg-surface-2 border-border" : "bg-gray-50 border-gray-200";
  const muted = theme === "dark" ? "text-white/60" : "text-gray-500";

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/modules/${moduleId}/qcm/`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 403 ? "Complétez tous les cours d'abord." : `Erreur ${r.status}`);
        return r.json();
      })
      .then(setQcm)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [moduleId]);

  const handleSubmit = async () => {
    if (Object.keys(answers).length < (qcm?.questions?.length ?? 0)) {
      setError("Répondez à toutes les questions avant de soumettre.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const csrf = getCookie("csrftoken");
      const res = await fetch(`${API_BASE}/modules/${moduleId}/qcm/submit/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(csrf ? { "X-CSRFToken": csrf } : {}) },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setResult(data);
      if (data.passed) onPassed(data.formation_progress);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={`text-sm ${muted}`}>Chargement du QCM…</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;
  if (!qcm) return null;

  if (result) {
    return (
      <div className={`rounded-xl border p-4 ${card}`}>
        <div className={`text-center mb-4 ${result.passed ? "text-green-500" : "text-red-500"}`}>
          <div className="text-3xl font-bold">{result.score}%</div>
          <div className="text-sm font-medium mt-1">
            {result.passed ? "✓ Module validé !" : `✗ Score insuffisant (min. ${qcm.passing_score}%)`}
          </div>
        </div>
        {/* Corrections */}
        <ul className="space-y-3 mt-4">
          {result.questions?.map((q) => {
            const chosen = parseInt(answers[String(q.id)]);
            return (
              <li key={q.id} className="text-sm">
                <p className="font-medium mb-1">{q.question_text}</p>
                <ul className="space-y-0.5 ml-3">
                  {q.choices.map((c) => {
                    const isChosen = c.id === chosen;
                    const cls = c.is_correct
                      ? "text-green-500"
                      : isChosen
                      ? "text-red-500"
                      : muted;
                    return (
                      <li key={c.id} className={`${cls} flex items-center gap-1`}>
                        <span>{c.is_correct ? "✓" : isChosen ? "✗" : "·"}</span>
                        {c.choice_text}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
        {!result.passed && (
          <button
            onClick={() => { setResult(null); setAnswers({}); }}
            className="mt-4 w-full py-2 rounded-lg border text-sm hover:opacity-80 transition"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  if (qcm.already_passed) {
    return (
      <div className={`rounded-xl border p-3 text-sm ${card}`}>
        <span className="text-green-500 font-medium">✓ QCM déjà validé</span>
        <span className={`ml-2 ${muted}`}>(score : {qcm.best_score}%)</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 space-y-4 ${card}`}>
      <h4 className="font-semibold text-sm">{qcm.title}</h4>
      {qcm.attempts_count > 0 && (
        <p className={`text-xs ${muted}`}>Tentatives : {qcm.attempts_count} — Meilleur score : {qcm.best_score}%</p>
      )}
      {qcm.questions.map((q, qi) => (
        <div key={q.id}>
          <p className="text-sm font-medium mb-2">{qi + 1}. {q.question_text}</p>
          <ul className="space-y-1">
            {q.choices.map((c) => (
              <li key={c.id}>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={c.id}
                    checked={answers[String(q.id)] === c.id}
                    onChange={() => setAnswers((a) => ({ ...a, [String(q.id)]: c.id }))}
                    className="accent-indigo-500"
                  />
                  {c.choice_text}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm hover:brightness-110 transition disabled:opacity-50"
      >
        {submitting ? "Envoi…" : "Soumettre le QCM"}
      </button>
    </div>
  );
}

/* ── Module Accordion ────────────────────────────────────────────────────── */
function ModuleAccordion({ module, theme, onProgressUpdate }) {
  const [open, setOpen] = useState(false);
  const [cours, setCours] = useState([]);
  const [coursLoading, setCoursLoading] = useState(false);
  const [activeCours, setActiveCours] = useState(null);
  const [showQCM, setShowQCM] = useState(false);
  const [localModule, setLocalModule] = useState(module);

  const muted = theme === "dark" ? "text-white/60" : "text-gray-500";
  const itemBase = theme === "dark" ? "border-border bg-surface" : "border-gray-200 bg-white";
  const lockedCls = theme === "dark" ? "opacity-40 cursor-not-allowed" : "opacity-40 cursor-not-allowed";

  useEffect(() => { setLocalModule(module); }, [module]);

  const loadCours = useCallback(async () => {
    if (cours.length > 0) return;
    setCoursLoading(true);
    try {
      const r = await fetch(`${API_BASE}/modules/${module.id}/courses/`, { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        setCours(Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []));
      }
    } catch { /* noop */ }
    finally { setCoursLoading(false); }
  }, [module.id, cours.length]);

  const handleOpen = () => {
    if (!localModule.is_accessible) return;
    setOpen((v) => !v);
    if (!open) loadCours();
  };

  const completeCours = async (c) => {
    if (!c.is_accessible || c.is_completed) return;
    const csrf = getCookie("csrftoken");
    try {
      const r = await fetch(`${API_BASE}/courses/${c.id}/complete/`, {
        method: "POST",
        credentials: "include",
        headers: csrf ? { "X-CSRFToken": csrf } : {},
      });
      if (!r.ok) return;
      const data = await r.json();
      setCours((prev) => prev.map((x) => {
        if (x.id !== c.id) return x;
        const updated = { ...x, is_completed: true };
        // Déverrouille le cours suivant
        return updated;
      }).map((x, i, arr) => {
        if (i === 0) return { ...x, is_accessible: true };
        return { ...x, is_accessible: arr[i - 1].is_completed };
      }));
      setLocalModule((m) => ({ ...m, completed_cours: data.completed_cours }));
      onProgressUpdate?.();
      // Si tous les cours terminés et QCM existe, proposer le QCM
      if (data.all_cours_done && localModule.has_qcm) setShowQCM(true);
    } catch { /* noop */ }
  };

  const handleQCMPassed = (formationProgress) => {
    setLocalModule((m) => ({ ...m, is_completed: true, qcm_passed: true }));
    setShowQCM(false);
    onProgressUpdate?.(formationProgress);
  };

  const allCoursDone = localModule.completed_cours >= localModule.total_cours && localModule.total_cours > 0;
  const moduleProgress = localModule.total_cours
    ? Math.round((localModule.completed_cours / localModule.total_cours) * 100)
    : 0;

  return (
    <div className={`rounded-xl border overflow-hidden ${itemBase}`}>
      {/* Header module */}
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
          !localModule.is_accessible ? lockedCls : "hover:opacity-80"
        }`}
        aria-expanded={open}
        disabled={!localModule.is_accessible}
      >
        {/* Icône statut */}
        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0 ${
          localModule.is_completed
            ? "border-green-500 bg-green-500 text-white"
            : !localModule.is_accessible
            ? (theme === "dark" ? "border-white/20 text-white/20" : "border-gray-300 text-gray-300")
            : "border-indigo-400 text-indigo-400"
        }`} aria-hidden="true">
          {localModule.is_completed ? "✓" : !localModule.is_accessible ? "🔒" : `${localModule.order + 1}`}
        </span>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{localModule.title}</div>
          <div className={`text-xs mt-0.5 ${muted}`}>
            {localModule.total_cours > 0
              ? `${localModule.completed_cours}/${localModule.total_cours} cours`
              : "Aucun cours"}
            {localModule.has_qcm && (
              <span className={`ml-2 ${localModule.qcm_passed ? "text-green-500" : ""}`}>
                · QCM {localModule.qcm_passed ? "✓" : "à passer"}
              </span>
            )}
          </div>
        </div>

        {localModule.total_cours > 0 && (
          <div className="w-16 shrink-0">
            <ProgressBar value={moduleProgress} />
          </div>
        )}

        <span className={`text-xs ${muted}`} aria-hidden="true">{open ? "▲" : "▼"}</span>
      </button>

      {/* Contenu accordéon */}
      {open && (
        <div className="px-4 pb-4 border-t border-inherit">
          {/* Cours list */}
          {coursLoading ? (
            <div className={`text-sm ${muted} py-3`}>Chargement…</div>
          ) : cours.length === 0 ? (
            <div className={`text-sm ${muted} py-3`}>Aucun cours dans ce module.</div>
          ) : (
            <ul className="mt-3 space-y-2">
              {cours.map((c) => (
                <li key={c.id}>
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveCours(activeCours?.id === c.id ? null : c)}
                      className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${
                        c.is_completed
                          ? (theme === "dark" ? "border-green-500/30 bg-green-500/10" : "border-green-200 bg-green-50")
                          : !c.is_accessible
                          ? (theme === "dark" ? "border-border opacity-40 cursor-not-allowed" : "border-gray-200 opacity-40 cursor-not-allowed")
                          : (theme === "dark" ? "border-border-2 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50")
                      }`}
                      disabled={!c.is_accessible}
                      aria-expanded={activeCours?.id === c.id}
                    >
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                        c.is_completed ? "border-green-500 bg-green-500 text-white" : "border-current"
                      }`} aria-hidden="true">
                        {c.is_completed ? "✓" : !c.is_accessible ? "🔒" : ""}
                      </span>
                      <span className="truncate">{c.title}</span>
                    </button>
                  </div>

                  {/* Contenu du cours */}
                  {activeCours?.id === c.id && c.is_accessible && (
                    <div className={`mt-2 ml-6 rounded-lg border p-3 text-sm ${
                      theme === "dark" ? "bg-surface-raised border-border" : "bg-gray-50 border-gray-200"
                    }`}>
                      {c.video_url && (
                        <div className="mb-3">
                          <a href={c.video_url} target="_blank" rel="noopener noreferrer"
                            className="text-indigo-500 hover:underline text-xs">
                            ▶ Voir la vidéo
                          </a>
                        </div>
                      )}
                      <div className={`whitespace-pre-wrap leading-relaxed ${muted}`}>
                        {c.content || "Contenu à venir."}
                      </div>
                      {!c.is_completed && (
                        <button
                          onClick={() => completeCours(c)}
                          className="mt-3 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs hover:brightness-110 transition"
                        >
                          Marquer comme terminé
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* QCM */}
          {(allCoursDone || showQCM) && localModule.has_qcm && !localModule.is_completed && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px flex-1 bg-current opacity-10" />
                <span className={`text-xs font-medium ${muted}`}>QCM de validation</span>
                <div className="h-px flex-1 bg-current opacity-10" />
              </div>
              <QCMPanel moduleId={module.id} theme={theme} onPassed={handleQCMPassed} />
            </div>
          )}
          {localModule.is_completed && localModule.has_qcm && (
            <div className={`mt-3 text-xs font-medium text-green-500`}>✓ Module validé — QCM passé</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Modal ──────────────────────────────────────────────────────────── */
export default function FormationModal({ open, onClose, formation, theme, t, user: userProp }) {
  const { user: authUser } = useAuth();
  const user = userProp ?? authUser;

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
  const [progress, setProgress] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledLoading, setEnrolledLoading] = useState(false);

  const fetchModules = useCallback(async () => {
    if (!formation?.id) return;
    setModulesLoading(true);
    try {
      const r = await fetch(`${API_BASE}/formations/${formation.id}/modules/`, { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        setModules(Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []);
      }
    } catch { /* noop */ }
    finally { setModulesLoading(false); }
  }, [formation?.id]);

  const fetchEnrollmentAndProgress = useCallback(async () => {
    if (!formation?.id || !user) return;
    setEnrolledLoading(true);
    try {
      const userId = user.id ?? user.pk ?? user.user_id;
      // Vérifie si cette formation est dans la liste des formations de l'utilisateur
      const r = await fetch(
        `${API_BASE}/formations/?user=${encodeURIComponent(userId)}`,
        { credentials: "include" }
      );
      if (!r.ok) { setIsEnrolled(false); return; }
      const data = await r.json();
      const list = Array.isArray(data) ? data : (data.results ?? []);
      const enrolled = list.some((f) => f.id === formation.id);
      setIsEnrolled(enrolled);
      if (!enrolled) return;
      // Si inscrit, charger la progression
      const rp = await fetch(`${API_BASE}/formations/${formation.id}/progress/`, { credentials: "include" });
      if (rp.ok) setProgress(await rp.json());
    } catch { /* noop */ }
    finally { setEnrolledLoading(false); }
  }, [formation?.id, user]);

  useEffect(() => {
    if (open) { fetchEnrollmentAndProgress(); }
    else { setModules([]); setProgress(null); setIsEnrolled(false); }
  }, [open, fetchEnrollmentAndProgress]);

  // Charge les modules seulement si inscrit
  useEffect(() => {
    if (isEnrolled) fetchModules();
  }, [isEnrolled, fetchModules]);

  const handleProgressUpdate = useCallback(() => {
    fetchEnrollmentAndProgress();
    fetchModules();
  }, [fetchEnrollmentAndProgress, fetchModules]);


  if (!open || !formation) return null;

  const card = theme === "dark" ? "bg-surface text-white border-border" : "bg-white text-gray-900 border-gray-200";
  const muted = theme === "dark" ? "text-white/70" : "text-gray-600";

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="formation-modal-title"
        className={`fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-[95%] max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border shadow-lg ${card}`}
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 id="formation-modal-title" className="text-xl md:text-2xl font-semibold">
              {formation.name}
            </h2>
            <Button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-md border text-sm shrink-0 ${
                theme === "dark"
                  ? "bg-surface-2 text-white border-border hover:bg-surface-3"
                  : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
              }`}
              aria-label={t?.close}
              autoFocus
            >
              ✕ {t?.close}
            </Button>
          </div>

          {formation.description && (
            <p className={`${muted} whitespace-pre-line mb-4`}>{formation.description}</p>
          )}

          {/* Vérification inscription en cours */}
          {user && enrolledLoading && (
            <div className={`h-8 rounded-lg animate-pulse mb-4 ${theme === "dark" ? "bg-white/5" : "bg-gray-100"}`} />
          )}

          {/* Progression + modules — uniquement si inscrit */}
          {user && isEnrolled && !enrolledLoading && (
            <>
              {/* Progression globale */}
              {progress && (
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={muted}>Progression globale</span>
                    <span className={`font-medium ${progress.progress_percent === 100 ? "text-green-500" : muted}`}>
                      {progress.completed_modules}/{progress.total_modules} modules — {progress.progress_percent}%
                    </span>
                  </div>
                  <ProgressBar value={progress.progress_percent} green={progress.progress_percent === 100} />
                  {progress.progress_percent === 100 && (
                    <p className="text-green-500 text-xs font-medium mt-1">🎉 Formation complétée !</p>
                  )}
                </div>
              )}

              {/* Modules */}
              <div className="space-y-2">
                {modulesLoading ? (
                  <div className="space-y-2 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-12 rounded-xl ${theme === "dark" ? "bg-white/5" : "bg-gray-100"}`} />
                    ))}
                  </div>
                ) : modules.length === 0 ? (
                  <p className={`text-sm ${muted}`}>Aucun module disponible pour cette formation.</p>
                ) : (
                  modules.map((m) => (
                    <ModuleAccordion
                      key={m.id}
                      module={m}
                      theme={theme}
                      onProgressUpdate={handleProgressUpdate}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {/* CTA Contact */}
          <div className={`mt-6 p-4 rounded-lg border ${
            theme === "dark" ? "border-primary/40 bg-surface-2" : "border-secondary/40 bg-white"
          }`}>
            <p className="mb-3">Pour vous inscrire ou avoir plus de détails, contactez-nous.</p>
            <Button
              to="/contact"
              className={`px-4 py-2 rounded-md shadow text-sm hover:brightness-110 ${
                theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
              }`}
            >
              {t?.contact_us}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
