/**
 * Page d'apprentissage d'une formation.
 * Route : /formation/:id/learn
 *
 * Layout :
 *  - Mobile  : sidebar drawer (slide-in, focus-trap) + contenu en dessous
 *  - Desktop : sidebar fixe gauche + contenu principal à droite
 *
 * Accessibilité :
 *  - Skip link vers le contenu principal
 *  - Focus trap dans le drawer mobile
 *  - aria-current sur l'élément actif de la sidebar
 *  - aria-live pour les changements d'état (complétion, score QCM)
 *  - prefers-reduced-motion respecté
 *  - Gestion du focus : h1 focusé lors du changement de cours
 *  - Échap ferme le drawer
 */
import React, {
  useCallback, useEffect, useRef, useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { API_BASE, ensureCsrf } from "../lib/api";

// ── Hook : prefers-reduced-motion ─────────────────────────────────────────────

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ── Helpers API ───────────────────────────────────────────────────────────────

async function apiFetch(url, opts = {}) {
  const csrf = opts.method && opts.method !== "GET" ? await ensureCsrf() : null;
  const r = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRFToken": csrf } : {}),
    },
    ...opts,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  if (r.status === 204) return null;
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.detail || `HTTP ${r.status}`);
  return data;
}

function extractList(data) {
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}

function getYoutubeEmbedUrl(url) {
  try {
    const u = new URL(url);
    let videoId = null;
    if (u.hostname.includes("youtube.com")) {
      videoId = u.searchParams.get("v");
      if (!videoId && u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.split("/embed/")[1];
      }
    } else if (u.hostname === "youtu.be") {
      videoId = u.pathname.slice(1);
    }
    if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch { /* noop */ }
  return null;
}

// ── Focus trap (drawer mobile) ────────────────────────────────────────────────

function useFocusTrap(ref, active) {
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    const focusable = el.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const trap = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    el.addEventListener("keydown", trap);
    return () => el.removeEventListener("keydown", trap);
  }, [active, ref]);
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ pct, thin = false, className = "", label }) {
  return (
    <div
      className={`w-full rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 ${thin ? "h-1.5" : "h-2"} ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-green-500" : "bg-indigo-500"}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Progression ${pct}%`}
      />
    </div>
  );
}

// ── Icône de statut ────────────────────────────────────────────────────────────

function StatusDot({ done, accessible, small = false }) {
  const size = small ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs";
  if (done) return (
    <span
      className={`${size} rounded-full bg-green-500 text-white flex items-center justify-center shrink-0`}
      aria-label="Terminé"
      role="img"
    >
      ✓
    </span>
  );
  if (!accessible) return (
    <span
      className={`${size} rounded-full border-2 border-gray-300 dark:border-white/20 flex items-center justify-center shrink-0`}
      aria-label="Verrouillé"
      role="img"
    >
      <svg className="w-2.5 h-2.5 text-gray-400 dark:text-white/30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
      </svg>
    </span>
  );
  return (
    <span
      className={`${size} rounded-full border-2 border-indigo-400 flex items-center justify-center shrink-0`}
      aria-label="Disponible"
      role="img"
    />
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton({ theme }) {
  const pulse = theme === "dark" ? "bg-white/10" : "bg-gray-200";
  const sidebarCls = theme === "dark" ? "bg-[#161616] border-[#2a2a2a]" : "bg-white border-gray-200";
  const bg = theme === "dark" ? "bg-background" : "bg-light";
  return (
    <div className={`min-h-screen flex flex-col ${bg}`} aria-busy="true" aria-label="Chargement de la formation…">
      <div className={`h-14 border-b px-4 flex items-center gap-3 ${sidebarCls}`}>
        <div className={`h-3 w-20 rounded-full animate-pulse ${pulse}`} />
        <div className="flex-1 space-y-1.5">
          <div className={`h-3 w-40 rounded-full animate-pulse ${pulse}`} />
          <div className={`h-1.5 w-32 rounded-full animate-pulse ${pulse}`} />
        </div>
      </div>
      <div className="flex flex-1">
        <aside className={`hidden md:block w-72 border-r p-4 space-y-3 ${sidebarCls}`} aria-hidden="true">
          {[80, 60, 90, 55, 70].map((w, i) => (
            <div key={i} className={`h-3 rounded-full animate-pulse ${pulse}`} style={{ width: `${w}%` }} />
          ))}
        </aside>
        <main className="flex-1 p-8 space-y-4 max-w-3xl" aria-hidden="true">
          <div className={`h-7 w-64 rounded-full animate-pulse ${pulse}`} />
          <div className={`h-4 w-full rounded-full animate-pulse ${pulse}`} />
          <div className={`h-4 w-5/6 rounded-full animate-pulse ${pulse}`} />
          <div className={`h-4 w-4/6 rounded-full animate-pulse ${pulse}`} />
          <div className={`h-36 w-full rounded-xl animate-pulse mt-4 ${pulse}`} />
        </main>
      </div>
    </div>
  );
}

// ── QCM Panel ─────────────────────────────────────────────────────────────────

function QCMPanel({ moduleId, onPassed, theme, onAnnounce }) {
  const [qcm, setQcm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const muted = theme === "dark" ? "text-white/60" : "text-gray-500";
  const card = theme === "dark" ? "bg-[#1e1e1e] border-[#333]" : "bg-gray-50 border-gray-200";

  useEffect(() => {
    setLoading(true); setErr(""); setResult(null); setAnswers({});
    apiFetch(`${API_BASE}/modules/${moduleId}/qcm/`)
      .then(setQcm)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [moduleId]);

  const submit = async () => {
    const total = qcm?.questions?.length ?? 0;
    if (Object.keys(answers).length < total) {
      setErr("Répondez à toutes les questions avant de soumettre."); return;
    }
    setSubmitting(true); setErr("");
    try {
      const data = await apiFetch(`${API_BASE}/modules/${moduleId}/qcm/submit/`, {
        method: "POST", body: { answers },
      });
      setResult(data);
      onAnnounce?.(data.passed
        ? `QCM validé ! Votre score : ${data.score}%.`
        : `Score insuffisant : ${data.score}%. Score minimum requis : ${qcm.passing_score}%.`
      );
      if (data.passed) onPassed?.();
    } catch (e) { setErr(e.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className={`rounded-xl border p-6 space-y-3 ${card}`} aria-busy="true" aria-label="Chargement du QCM…">
      {[80, 65, 90].map((w, i) => (
        <div key={i} className={`h-3 rounded-full animate-pulse ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`} style={{ width: `${w}%` }} />
      ))}
    </div>
  );
  if (err && !qcm) return (
    <p className="text-sm text-amber-500 py-2" role="alert">{err}</p>
  );
  if (!qcm) return null;

  if (qcm.already_passed) return (
    <div className={`rounded-xl border p-5 flex items-center gap-3 ${card}`} role="status">
      <span className="w-10 h-10 rounded-full bg-green-500/15 text-green-500 flex items-center justify-center text-xl shrink-0" aria-hidden="true">✓</span>
      <div>
        <p className="text-green-500 font-semibold text-sm">QCM déjà validé</p>
        <p className={`text-xs mt-0.5 ${muted}`}>Meilleur score : {qcm.best_score}%</p>
      </div>
    </div>
  );

  const answeredCount = Object.keys(answers).length;
  const totalQ = qcm.questions?.length ?? 0;
  const allAnswered = answeredCount === totalQ;

  if (result) return (
    <div className={`rounded-xl border p-5 space-y-5 ${card}`} role="region" aria-label="Résultats du QCM">
      <div className={`text-center py-4 ${result.passed ? "text-green-500" : "text-red-400"}`}>
        <div className="text-5xl font-bold tabular-nums" aria-label={`Score : ${result.score} pour cent`}>
          {result.score}%
        </div>
        <div className="text-base font-semibold mt-2">
          {result.passed ? "🎉 Module validé !" : `Score insuffisant — minimum requis : ${qcm.passing_score}%`}
        </div>
      </div>

      <div className="space-y-4" aria-label="Corrections">
        {result.questions?.map((q) => {
          const chosen = parseInt(answers[String(q.id)]);
          return (
            <div key={q.id} className={`rounded-lg p-3 border ${
              theme === "dark" ? "border-[#333] bg-[#161616]" : "border-gray-100 bg-white"
            }`}>
              <p className="text-sm font-medium mb-2">{q.question_text}</p>
              <ul className="space-y-1" aria-label="Choix">
                {q.choices.map((c) => {
                  const isCorrect = c.is_correct;
                  const isChosen = c.id === chosen;
                  const cls = isCorrect
                    ? "text-green-500 bg-green-500/10 border-green-500/30"
                    : isChosen
                    ? "text-red-400 bg-red-400/10 border-red-400/30"
                    : theme === "dark" ? "text-white/30 border-transparent" : "text-gray-400 border-transparent";
                  return (
                    <li key={c.id} className={`text-sm flex items-center gap-2 px-2 py-1 rounded border ${cls}`}>
                      <span className="shrink-0 w-4 text-center" aria-hidden="true">
                        {isCorrect ? "✓" : isChosen ? "✗" : "·"}
                      </span>
                      <span>
                        {c.choice_text}
                        {isCorrect && <span className="sr-only"> — bonne réponse</span>}
                        {!isCorrect && isChosen && <span className="sr-only"> — votre réponse, incorrecte</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {!result.passed && (
        <button
          onClick={() => { setResult(null); setAnswers({}); setErr(""); }}
          className="w-full py-2.5 rounded-lg border text-sm font-medium hover:opacity-80 transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          Réessayer le QCM
        </button>
      )}
    </div>
  );

  return (
    <div className={`rounded-xl border p-5 space-y-5 ${card}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-base">{qcm.title}</h2>
          {qcm.attempts_count > 0 && (
            <p className={`text-xs mt-0.5 ${muted}`}>
              {qcm.attempts_count} tentative{qcm.attempts_count > 1 ? "s" : ""} · Meilleur score : {qcm.best_score ?? 0}%
            </p>
          )}
        </div>
        <span
          className={`text-xs shrink-0 px-2 py-1 rounded-full border tabular-nums ${
            allAnswered
              ? "border-green-500/40 text-green-500 bg-green-500/10"
              : theme === "dark" ? "border-[#444] text-white/40" : "border-gray-200 text-gray-400"
          }`}
          aria-live="polite"
          aria-label={`${answeredCount} sur ${totalQ} questions répondues`}
        >
          {answeredCount}/{totalQ}
        </span>
      </div>

      {qcm.questions.map((q, qi) => (
        <fieldset key={q.id} className="border-0 p-0 m-0">
          <legend className="text-sm font-medium mb-2 flex items-start gap-2">
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-px ${
                theme === "dark" ? "bg-white/10" : "bg-gray-100"
              }`}
              aria-hidden="true"
            >
              {qi + 1}
            </span>
            <span>{q.question_text}</span>
          </legend>
          <ul className="space-y-1.5 ml-7" role="list">
            {q.choices.map((c) => {
              const selected = answers[String(q.id)] === c.id;
              return (
                <li key={c.id}>
                  <label className={`flex items-center gap-3 cursor-pointer text-sm p-2.5 rounded-lg border transition ${
                    selected
                      ? "border-indigo-400 bg-indigo-500/10"
                      : theme === "dark"
                      ? "border-[#333] hover:border-[#555]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={c.id}
                      checked={selected}
                      onChange={() => setAnswers((a) => ({ ...a, [String(q.id)]: c.id }))}
                      className="accent-indigo-500 shrink-0 w-4 h-4"
                    />
                    {c.choice_text}
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}

      {err && (
        <p className="text-xs text-red-400 flex items-center gap-1.5" role="alert">
          <span aria-hidden="true">⚠</span> {err}
        </p>
      )}

      <button
        onClick={submit}
        disabled={submitting || !allAnswered}
        aria-disabled={submitting || !allAnswered}
        className="w-full py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
      >
        {submitting && (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        )}
        {submitting ? "Envoi en cours…" : !allAnswered ? `Répondez à toutes les questions (${answeredCount}/${totalQ})` : "Soumettre le QCM"}
      </button>
    </div>
  );
}

// ── Contenu d'un cours ─────────────────────────────────────────────────────────

function CoursContent({ cours, moduleId, theme, onCompleted, onGoNext, hasNext, titleRef, onAnnounce }) {
  const [completing, setCompleting] = useState(false);
  const [err, setErr] = useState("");
  const [justCompleted, setJustCompleted] = useState(false);
  const muted = theme === "dark" ? "text-white/70" : "text-gray-600";
  const card = theme === "dark" ? "bg-[#1e1e1e] border-[#333]" : "bg-gray-50 border-gray-200";

  // Réinitialiser l'état justCompleted quand le cours change
  useEffect(() => {
    setJustCompleted(false);
    setErr("");
  }, [cours.id]);

  const complete = async () => {
    setCompleting(true); setErr("");
    try {
      const data = await apiFetch(`${API_BASE}/courses/${cours.id}/complete/`, {
        method: "POST", body: { module_id: moduleId },
      });
      setJustCompleted(true);
      onAnnounce?.(`Cours "${cours.title}" marqué comme terminé.`);
      onCompleted?.(data);
    } catch (e) { setErr(e.message); }
    finally { setCompleting(false); }
  };

  const embedUrl = cours.video_url ? getYoutubeEmbedUrl(cours.video_url) : null;
  const isMarkedDone = cours.is_completed || justCompleted;

  return (
    <article className="space-y-6">
      {/* Titre — ref pour gestion du focus */}
      <div>
        <h1
          ref={titleRef}
          tabIndex={-1}
          className="text-xl md:text-2xl font-bold leading-tight focus:outline-none"
          style={{ fontSize: undefined }} /* override global h1 au cas où */
        >
          {cours.title}
        </h1>
        {isMarkedDone && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-green-500 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">
            <span aria-hidden="true">✓</span> Cours terminé
          </span>
        )}
      </div>

      {/* Vidéo */}
      {cours.video_url && (
        embedUrl ? (
          <div className="rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={embedUrl}
              title={`Vidéo : ${cours.title}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className={`rounded-xl border p-4 flex items-center gap-3 ${card}`}>
            <span className="w-10 h-10 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center text-lg shrink-0" aria-hidden="true">▶</span>
            <div>
              <p className="text-sm font-medium">Vidéo du cours</p>
              <a
                href={cours.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-500 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 rounded"
              >
                Ouvrir dans un nouvel onglet
                <span className="sr-only"> (s'ouvre dans un nouvel onglet)</span>
                <span aria-hidden="true"> →</span>
              </a>
            </div>
          </div>
        )
      )}

      {/* Contenu texte */}
      {cours.content ? (
        <div
          className={`leading-relaxed text-sm md:text-base ${
            theme === "dark" ? "text-white/80" : "text-gray-700"
          }`}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {cours.content}
        </div>
      ) : !cours.video_url && (
        <p className={`text-sm ${muted} italic py-4`}>Contenu à venir.</p>
      )}

      {/* Zone action complétion */}
      <div className={`rounded-xl border p-4 ${card}`}>
        {isMarkedDone ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-green-500 text-sm font-semibold">
              <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs" aria-hidden="true">✓</span>
              Cours terminé
            </div>
            {hasNext && (
              <button
                type="button"
                onClick={onGoNext}
                className="sm:ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition min-h-[44px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                Cours suivant <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        ) : (
          <div>
            {err && (
              <p className="text-xs text-red-400 mb-2 flex items-center gap-1" role="alert">
                <span aria-hidden="true">⚠</span> {err}
              </p>
            )}
            <button
              onClick={complete}
              disabled={completing}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              {completing && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              )}
              {completing ? "Enregistrement…" : "Marquer comme terminé"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

// ── Bannière de fin de formation ──────────────────────────────────────────────

function CompletionBanner({ formationName, theme }) {
  const card = theme === "dark" ? "bg-[#1a2a1a] border-green-800/40" : "bg-green-50 border-green-200";
  return (
    <div className={`rounded-xl border p-6 text-center space-y-3 ${card}`} role="status" aria-label="Formation terminée">
      <div className="text-5xl" aria-hidden="true">🎉</div>
      <h2 className="text-xl font-bold text-green-500">Formation terminée !</h2>
      <p className={`text-sm ${theme === "dark" ? "text-white/60" : "text-gray-600"}`}>
        Félicitations, vous avez complété <strong>{formationName}</strong>.
      </p>
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition min-h-[44px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600 focus-visible:outline-none"
      >
        Voir mon profil <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function FormationParcours() {
  const { id: formationId } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const reducedMotion = usePrefersReducedMotion();

  const [formation, setFormation] = useState(null);
  const [modules, setModules] = useState([]);
  const [globalPct, setGlobalPct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [activeModuleId, setActiveModuleId] = useState(null);
  const [activeCours, setActiveCours] = useState(null);
  const [showQCM, setShowQCM] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Message annoncé aux lecteurs d'écran via aria-live
  const [announcement, setAnnouncement] = useState("");

  const contentRef = useRef(null);
  const titleRef = useRef(null);        // h1 du cours actif
  const drawerRef = useRef(null);       // drawer mobile (focus trap)
  const menuBtnRef = useRef(null);      // bouton ☰ pour restaurer le focus à la fermeture

  useFocusTrap(drawerRef, sidebarOpen);

  const bg = theme === "dark" ? "bg-background text-white" : "bg-light text-dark";
  const sidebarCls = theme === "dark" ? "bg-[#161616] border-[#2a2a2a]" : "bg-white border-gray-200";
  const muted = theme === "dark" ? "text-white/50" : "text-gray-400";

  const safeModules = Array.isArray(modules) ? modules : [];

  // ── Chargement ──────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    if (!formationId) return;
    setLoading(true); setErr("");
    try {
      const [fData, mData] = await Promise.all([
        apiFetch(`${API_BASE}/formations/${formationId}/`),
        apiFetch(`${API_BASE}/formations/${formationId}/modules/`),
      ]);
      setFormation(fData);

      const mods = extractList(mData);
      const modsWithCours = await Promise.all(
        mods.map(async (m) => {
          try {
            const cData = await apiFetch(`${API_BASE}/modules/${m.id}/courses/`);
            return { ...m, coursList: extractList(cData) };
          } catch {
            return { ...m, coursList: [] };
          }
        })
      );
      setModules(Array.isArray(modsWithCours) ? modsWithCours : []);

      if (user) {
        try {
          const prog = await apiFetch(`${API_BASE}/formations/${formationId}/progress/`);
          setGlobalPct(prog.progress_percent ?? 0);
        } catch { /* noop */ }
      }

      // Sélectionner le premier cours non terminé
      let found = false;
      for (const m of modsWithCours) {
        if (!m.is_accessible) continue;
        for (const c of m.coursList) {
          if (c.is_accessible && !c.is_completed) {
            setActiveModuleId(m.id);
            setActiveCours(c);
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found && modsWithCours.length > 0) {
        const lastMod = modsWithCours[modsWithCours.length - 1];
        if (lastMod.coursList.length > 0) {
          setActiveModuleId(lastMod.id);
          setActiveCours(lastMod.coursList[lastMod.coursList.length - 1]);
        }
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [formationId, user]);

  useEffect(() => { load(); }, [load]);

  // Focus vers le h1 du cours quand le contenu change
  const activeCourseId = activeCours?.id;
  useEffect(() => {
    if (!loading && (activeCours || showQCM)) {
      const t = setTimeout(() => titleRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCourseId, showQCM, loading]);

  // Scroll en haut du contenu lors du changement de cours
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
  }, [activeCours?.id, showQCM, reducedMotion]);

  // Fermer drawer si on passe en desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const close = () => { if (mq.matches) closeSidebar(); };
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  // Touche Échap ferme le drawer
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && sidebarOpen) closeSidebar();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [sidebarOpen]);

  // ── Gestion sidebar ──────────────────────────────────────────────────────────

  const closeSidebar = () => {
    setSidebarOpen(false);
    // Rendre le focus au bouton ☰
    setTimeout(() => menuBtnRef.current?.focus(), 50);
  };

  // ── Handlers ────────────────────────────────────────────────────────────────

  const selectCours = (cours, moduleId) => {
    if (!cours.is_accessible) return;
    setActiveCours(cours);
    setActiveModuleId(moduleId);
    setShowQCM(false);
    setSidebarOpen(false);
  };

  const selectQCM = (moduleId) => {
    setActiveCours(null);
    setActiveModuleId(moduleId);
    setShowQCM(true);
    setSidebarOpen(false);
  };

  const handleCoursCompleted = (progressData) => {
    setModules((prev) => prev.map((m) => {
      if (m.id !== activeModuleId) return m;
      const updatedCoursList = m.coursList.map((c, i, arr) => {
        if (c.id === activeCours.id) return { ...c, is_completed: true };
        if (i > 0 && arr[i - 1].id === activeCours.id) return { ...c, is_accessible: true };
        return c;
      });
      return { ...m, coursList: updatedCoursList, completed_cours: progressData.completed_cours ?? m.completed_cours };
    }));
    setActiveCours((prev) => prev ? { ...prev, is_completed: true } : prev);

    if (progressData.all_cours_done) {
      setGlobalPct((prev) => Math.max(prev, Math.round((progressData.completed_cours / progressData.total_cours) * 100)));
      const mod = safeModules.find((m) => m.id === activeModuleId);
      if (mod?.has_qcm && !mod.qcm_passed) {
        setTimeout(() => selectQCM(activeModuleId), 600);
      }
    }
  };

  const handleQCMPassed = () => {
    setModules((prev) => prev.map((m) => {
      if (m.id !== activeModuleId) return m;
      return { ...m, is_completed: true, qcm_passed: true };
    }));
    setGlobalPct(() => {
      const doneModules = safeModules.filter((m) => m.id === activeModuleId ? true : m.is_completed).length;
      return Math.round((doneModules / (safeModules.length || 1)) * 100);
    });
  };

  // ── Navigation prev/next ────────────────────────────────────────────────────

  const allItems = safeModules.flatMap((m) => [
    ...m.coursList.map((c) => ({ type: "cours", data: c, moduleId: m.id, label: c.title })),
    ...(m.has_qcm ? [{ type: "qcm", moduleId: m.id, label: `QCM — ${m.title}` }] : []),
  ]);

  const currentIdx = allItems.findIndex((item) =>
    showQCM
      ? item.type === "qcm" && item.moduleId === activeModuleId
      : item.type === "cours" && item.data?.id === activeCours?.id
  );

  const prevItem = currentIdx > 0 ? allItems[currentIdx - 1] : null;
  const nextItem = currentIdx < allItems.length - 1 ? allItems[currentIdx + 1] : null;

  const goPrev = () => {
    if (!prevItem) return;
    if (prevItem.type === "qcm") selectQCM(prevItem.moduleId);
    else selectCours(prevItem.data, prevItem.moduleId);
  };

  const goNext = () => {
    if (!nextItem) return;
    if (nextItem.type === "qcm") selectQCM(nextItem.moduleId);
    else selectCours(nextItem.data, nextItem.moduleId);
  };

  // ── Stats ────────────────────────────────────────────────────────────────────

  const totalCours = safeModules.reduce((s, m) => s + (m.total_cours || 0), 0);
  const doneCours = safeModules.reduce((s, m) => s + (m.completed_cours || 0), 0);
  const isAllDone = globalPct >= 100 && totalCours > 0 && doneCours >= totalCours;
  const activeModule = safeModules.find((m) => m.id === activeModuleId);

  // ── Sidebar content (partagé desktop + mobile) ────────────────────────────

  const SidebarContent = () => (
    <nav aria-label="Plan de la formation">
      <ul className="py-4 px-3 space-y-1" role="list">
        {safeModules.map((m, mi) => {
          const modPct = m.total_cours ? Math.round((m.completed_cours / m.total_cours) * 100) : 0;
          const isActiveMod = m.id === activeModuleId;

          return (
            <li key={m.id} className="mb-1">
              {/* En-tête module */}
              <div
                className={`flex items-center gap-2 px-2 py-2 rounded-lg ${
                  isActiveMod ? (theme === "dark" ? "bg-white/5" : "bg-indigo-50") : ""
                } ${!m.is_accessible ? "opacity-40" : ""}`}
                aria-label={`Module ${mi + 1} : ${m.title}${m.is_completed ? ", terminé" : ""}`}
              >
                <StatusDot done={m.is_completed} accessible={m.is_accessible} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${!m.is_accessible ? muted : ""}`}>
                    <span className={`mr-1 ${muted}`} aria-hidden="true">{mi + 1}.</span>
                    {m.title}
                  </p>
                  {m.total_cours > 0 && (
                    <div className="flex items-center gap-1.5 mt-1" aria-hidden="true">
                      <ProgressBar pct={modPct} thin className="max-w-[80px]" />
                      <span className={`text-[10px] shrink-0 tabular-nums ${muted}`}>{m.completed_cours}/{m.total_cours}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cours du module */}
              <ul className="ml-5 mt-0.5 space-y-0.5" role="list">
                {m.coursList.map((c) => {
                  const isActive = !showQCM && activeCours?.id === c.id;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => selectCours(c, m.id)}
                        disabled={!c.is_accessible}
                        aria-disabled={!c.is_accessible}
                        aria-current={isActive ? "true" : undefined}
                        aria-label={`${c.title}${c.is_completed ? ", terminé" : !c.is_accessible ? ", verrouillé" : ""}${isActive ? ", cours actuel" : ""}`}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition min-h-[36px] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none
                          ${isActive
                            ? "bg-indigo-600 text-white"
                            : !c.is_accessible
                            ? `${muted} cursor-not-allowed opacity-50`
                            : theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"
                          }`}
                      >
                        <StatusDot done={c.is_completed} accessible={c.is_accessible} small />
                        <span className="truncate">{c.title}</span>
                      </button>
                    </li>
                  );
                })}

                {/* QCM */}
                {m.has_qcm && (() => {
                  const isQcmActive = showQCM && activeModuleId === m.id;
                  return (
                    <li>
                      <button
                        type="button"
                        onClick={() => selectQCM(m.id)}
                        disabled={!m.is_accessible}
                        aria-disabled={!m.is_accessible}
                        aria-current={isQcmActive ? "true" : undefined}
                        aria-label={`QCM du module ${m.title}${m.qcm_passed ? ", validé" : !m.is_accessible ? ", verrouillé" : ""}${isQcmActive ? ", élément actuel" : ""}`}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition min-h-[36px] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none
                          ${isQcmActive
                            ? "bg-indigo-600 text-white"
                            : !m.is_accessible
                            ? `${muted} cursor-not-allowed opacity-50`
                            : theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"
                          }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] shrink-0 ${
                            m.qcm_passed ? "border-green-500 bg-green-500 text-white" : "border-amber-400 text-amber-400"
                          }`}
                          aria-hidden="true"
                        >
                          {m.qcm_passed ? "✓" : "?"}
                        </span>
                        <span className="truncate">QCM {m.qcm_passed ? "(validé)" : "de validation"}</span>
                      </button>
                    </li>
                  );
                })()}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  // ── Rendu ─────────────────────────────────────────────────────────────────────

  if (loading) return <PageSkeleton theme={theme} />;

  if (err) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 px-4 ${bg}`}>
        <p className="text-red-400 text-center" role="alert">{err}</p>
        <Link to="/formations" className="text-sm text-indigo-500 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 rounded">
          ← Retour aux formations
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>

      {/* ── Skip link ─────────────────────────────────────────────────────── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-indigo-600 focus:text-white focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Passer au contenu principal
      </a>

      {/* ── Zone aria-live pour les annonces ──────────────────────────────── */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-30 border-b px-4 py-3 flex items-center gap-3 min-h-[57px] ${
        theme === "dark" ? "bg-[#111]/90 backdrop-blur border-[#2a2a2a]" : "bg-white/90 backdrop-blur border-gray-200"
      }`}>
        <Link
          to="/formations"
          className={`text-sm hover:underline shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 rounded px-1 ${muted}`}
        >
          <span aria-hidden="true">←</span> <span>Formations</span>
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" aria-label={`Formation : ${formation?.name}`}>
            {formation?.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5" aria-hidden="true">
            <ProgressBar
              pct={globalPct}
              thin
              className="max-w-[100px]"
              label={`Progression globale : ${doneCours} cours sur ${totalCours} terminés, ${globalPct}%`}
            />
            <span className={`text-[11px] shrink-0 tabular-nums ${muted}`}>
              {doneCours}/{totalCours} · {globalPct}%
            </span>
          </div>
        </div>

        {/* Bouton sidebar mobile */}
        <button
          ref={menuBtnRef}
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className={`md:hidden p-2 rounded-lg border text-sm min-w-[44px] min-h-[44px] flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
            sidebarOpen
              ? theme === "dark" ? "bg-white/10 border-[#444]" : "bg-gray-100 border-gray-300"
              : theme === "dark" ? "border-[#333] hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
          }`}
          aria-label={sidebarOpen ? "Fermer le plan de la formation" : "Ouvrir le plan de la formation"}
          aria-expanded={sidebarOpen}
          aria-controls="mobile-sidebar"
          aria-haspopup="dialog"
        >
          <span aria-hidden="true">{sidebarOpen ? "✕" : "☰"}</span>
        </button>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar desktop */}
        <aside
          className={`hidden md:flex flex-col w-72 shrink-0 border-r sticky top-[57px] self-start h-[calc(100vh-57px)] overflow-y-auto ${sidebarCls}`}
          aria-label="Plan de la formation"
        >
          <SidebarContent />
        </aside>

        {/* Overlay drawer mobile */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Drawer mobile */}
        <aside
          ref={drawerRef}
          id="mobile-sidebar"
          role="dialog"
          aria-modal="true"
          aria-label="Plan de la formation"
          className={`md:hidden fixed left-0 top-0 h-full w-[280px] max-w-[85vw] z-50 border-r overflow-hidden flex flex-col ${sidebarCls} ${
            reducedMotion ? "" : "transition-transform duration-300 ease-in-out"
          } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-inherit shrink-0">
            <span className="font-semibold text-sm" id="drawer-title">Plan de la formation</span>
            <button
              onClick={closeSidebar}
              className={`p-1.5 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center ${muted} hover:opacity-70 transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none`}
              aria-label="Fermer le plan"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarContent />
          </div>
        </aside>

        {/* Contenu principal */}
        <main
          ref={contentRef}
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto focus:outline-none"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">

            {/* Breadcrumb */}
            {activeModule && (
              <nav aria-label="Fil d'Ariane" className="mb-4">
                <ol className={`flex flex-wrap items-center gap-1 text-xs ${muted}`}>
                  <li>
                    <Link to="/formations" className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 rounded">
                      Formations
                    </Link>
                  </li>
                  <li aria-hidden="true">›</li>
                  <li className="truncate max-w-[160px]">{activeModule.title}</li>
                  {activeCours && (
                    <>
                      <li aria-hidden="true">›</li>
                      <li className="font-medium truncate max-w-[160px]" aria-current="page">{activeCours.title}</li>
                    </>
                  )}
                  {showQCM && (
                    <>
                      <li aria-hidden="true">›</li>
                      <li className="font-medium text-amber-500" aria-current="page">QCM</li>
                    </>
                  )}
                </ol>
              </nav>
            )}

            {/* État vide */}
            {!activeCours && !showQCM && (
              <div className={`text-center py-20 ${muted}`}>
                <p className="text-5xl mb-4" aria-hidden="true">📚</p>
                <p className="font-medium mb-1">Prêt à apprendre ?</p>
                <p className="text-sm">Sélectionnez un cours dans le menu pour commencer.</p>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden mt-5 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition min-h-[44px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                  Voir le plan de la formation
                </button>
              </div>
            )}

            {/* Bannière formation terminée */}
            {isAllDone && !showQCM && (!activeCours || activeCours?.is_completed) && (
              <div className="mb-6">
                <CompletionBanner formationName={formation?.name} theme={theme} />
              </div>
            )}

            {/* Cours actif */}
            {activeCours && !showQCM && (
              <CoursContent
                key={activeCours.id}
                cours={activeCours}
                moduleId={activeModuleId}
                theme={theme}
                onCompleted={handleCoursCompleted}
                onGoNext={goNext}
                hasNext={!!nextItem}
                titleRef={titleRef}
                onAnnounce={setAnnouncement}
              />
            )}

            {/* QCM actif */}
            {showQCM && activeModuleId && (
              <section aria-label="QCM de validation" className="space-y-5">
                <div>
                  <h1
                    ref={titleRef}
                    tabIndex={-1}
                    className="text-xl md:text-2xl font-bold focus:outline-none"
                    style={{ fontSize: undefined }}
                  >
                    QCM de validation
                  </h1>
                  <p className={`text-sm mt-1 ${muted}`}>
                    {safeModules.find((m) => m.id === activeModuleId)?.title}
                  </p>
                </div>
                <QCMPanel
                  moduleId={activeModuleId}
                  theme={theme}
                  onPassed={handleQCMPassed}
                  onAnnounce={setAnnouncement}
                />
              </section>
            )}

            {/* Navigation précédent / suivant */}
            {(activeCours || showQCM) && (
              <nav
                aria-label="Navigation entre les leçons"
                className="flex justify-between items-center mt-10 pt-6 border-t border-inherit gap-2"
              >
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={!prevItem}
                  aria-disabled={!prevItem}
                  aria-label={prevItem ? `Précédent : ${prevItem.label}` : "Pas de leçon précédente"}
                  className={`flex flex-col items-start gap-0.5 px-4 py-2.5 rounded-lg border transition disabled:opacity-30 min-h-[44px] max-w-[45%] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                    theme === "dark" ? "border-[#333] hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className={`text-[11px] ${muted}`} aria-hidden="true">← Précédent</span>
                  {prevItem && (
                    <span className="text-xs font-medium truncate w-full" aria-hidden="true">{prevItem.label}</span>
                  )}
                </button>

                <span className={`text-xs shrink-0 tabular-nums ${muted}`} aria-label={`Leçon ${currentIdx + 1} sur ${allItems.length}`}>
                  {currentIdx + 1}/{allItems.length}
                </span>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={!nextItem}
                  aria-disabled={!nextItem}
                  aria-label={nextItem ? `Suivant : ${nextItem.label}` : "Pas de leçon suivante"}
                  className={`flex flex-col items-end gap-0.5 px-4 py-2.5 rounded-lg border transition disabled:opacity-30 min-h-[44px] max-w-[45%] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                    theme === "dark" ? "border-[#333] hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className={`text-[11px] ${muted}`} aria-hidden="true">Suivant →</span>
                  {nextItem && (
                    <span className="text-xs font-medium truncate w-full text-right" aria-hidden="true">{nextItem.label}</span>
                  )}
                </button>
              </nav>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
