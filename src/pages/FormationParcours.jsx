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
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { API_BASE, ensureCsrf } from "../lib/api";
import formationsFr from "../../locales/fr/formations.json";
import formationsEn from "../../locales/en/formations.json";

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
  if (!r.ok) {
    const err = new Error(data?.detail || `HTTP ${r.status}`);
    err.status = r.status;
    throw err;
  }
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
      className={`w-full rounded-full overflow-hidden bg-gray-200 dark:bg-white/15 ${thin ? "h-1.5" : "h-2.5"} ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${pct >= 100 ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-indigo-600 to-indigo-400"}`}
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
  const { language } = useLanguage();
  const t = language === "fr" ? formationsFr : formationsEn;
  const size = small ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs";
  if (done) return (
    <span
      className={`${size} rounded-full bg-green-500 text-white flex items-center justify-center shrink-0`}
      aria-label={t.status_done}
      role="img"
    >
      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
  if (!accessible) return (
    <span
      className={`${size} rounded-full border-2 border-gray-300 dark:border-white/20 flex items-center justify-center shrink-0`}
      aria-label={t.status_locked}
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
      aria-label={t.status_available}
      role="img"
    />
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton({ theme }) {
  const { language } = useLanguage();
  const t = language === "fr" ? formationsFr : formationsEn;
  const pulse = theme === "dark" ? "bg-white/10" : "bg-gray-200";
  const sidebarCls = theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200";
  const bg = theme === "dark" ? "bg-background" : "bg-light";
  return (
    <div className={`min-h-screen flex flex-col ${bg}`} aria-busy="true" aria-label={t.loading_formation}>
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

function QCMPanel({ moduleId, onPassed, theme, onAnnounce, onAuthError }) {
  const [qcm, setQcm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const { language } = useLanguage();
  const t = language === "fr" ? formationsFr : formationsEn;
  const muted = theme === "dark" ? "text-white/60" : "text-gray-500";
  const card = theme === "dark" ? "bg-zinc-800/60 border-zinc-700" : "bg-gray-50 border-gray-200";

  useEffect(() => {
    setLoading(true); setErr(""); setResult(null); setAnswers({});
    apiFetch(`${API_BASE}/modules/${moduleId}/qcm/`)
      .then(setQcm)
      .catch((e) => { if (e.status === 401) onAuthError?.(); else setErr(e.message); })
      .finally(() => setLoading(false));
  }, [moduleId]);

  const submit = async () => {
    const total = qcm?.questions?.length ?? 0;
    if (Object.keys(answers).length < total) {
      setErr(t.qcm_answer_all); return;
    }
    setSubmitting(true); setErr("");
    try {
      const data = await apiFetch(`${API_BASE}/modules/${moduleId}/qcm/submit/`, {
        method: "POST", body: { answers },
      });
      setResult(data);
      onAnnounce?.(data.passed
        ? (language === "fr" ? `QCM validé ! Votre score : ${data.score}%.` : `Quiz validated! Your score: ${data.score}%.`)
        : (language === "fr" ? `Score insuffisant : ${data.score}%. Score minimum requis : ${qcm.passing_score}%.` : `Insufficient score: ${data.score}%. Minimum required: ${qcm.passing_score}%.`)
      );
      if (data.passed) onPassed?.();
    } catch (e) { if (e.status === 401) onAuthError?.(); else setErr(e.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className={`rounded-xl border p-6 space-y-3 ${card}`} aria-busy="true" aria-label={t.loading_qcm}>
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
        <p className="text-green-500 font-semibold text-sm">{t.qcm_already_passed}</p>
        <p className={`text-xs mt-0.5 ${muted}`}>{t.qcm_best_score_label} : {qcm.best_score}%</p>
      </div>
    </div>
  );

  const answeredCount = Object.keys(answers).length;
  const totalQ = qcm.questions?.length ?? 0;
  const allAnswered = answeredCount === totalQ;

  if (result) return (
    <div className={`rounded-xl border p-5 space-y-5 ${card}`} role="region" aria-label={t.qcm_results_label}>
      <div className={`text-center py-4 ${result.passed ? "text-green-500" : "text-red-400"}`}>
        <div className="text-5xl font-bold tabular-nums" aria-label={`${t.qcm_score_label} : ${result.score} ${t.qcm_score_suffix}`}>
          {result.score}%
        </div>
        <div className="text-base font-semibold mt-2">
          {result.passed ? t.qcm_module_validated : `${t.qcm_insufficient_prefix} ${qcm.passing_score}%`}
        </div>
      </div>

      <div className="space-y-4" aria-label={t.qcm_corrections_label}>
        {result.questions?.map((q) => {
          const chosen = parseInt(answers[String(q.id)]);
          return (
            <div key={q.id} className={`rounded-lg p-3 border ${
              theme === "dark" ? "border-zinc-700 bg-zinc-900" : "border-gray-100 bg-white"
            }`}>
              <p className="text-sm font-medium mb-2">{q.question_text}</p>
              <ul className="space-y-1" aria-label={t.qcm_choices_label}>
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
                        {isCorrect && <span className="sr-only"> {t.qcm_correct_sr}</span>}
                        {!isCorrect && isChosen && <span className="sr-only"> {t.qcm_wrong_sr}</span>}
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
          {t.qcm_retry}
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
              {qcm.attempts_count} {qcm.attempts_count > 1 ? t.qcm_attempts_plural : t.qcm_attempt} · {t.qcm_best_score_label} : {qcm.best_score ?? 0}%
            </p>
          )}
        </div>
        <span
          className={`text-xs shrink-0 px-2 py-1 rounded-full border tabular-nums ${
            allAnswered
              ? "border-green-500/40 text-green-500 bg-green-500/10"
              : theme === "dark" ? "border-zinc-600 text-white/40" : "border-gray-200 text-gray-400"
          }`}
          aria-live="polite"
          aria-label={language === "fr" ? `${answeredCount} sur ${totalQ} questions répondues` : `${answeredCount} of ${totalQ} questions answered`}
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
                      ? "border-zinc-700 hover:border-zinc-500 hover:bg-white/5"
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
        {submitting ? t.qcm_submitting : !allAnswered ? (language === "fr" ? `Répondez à toutes les questions (${answeredCount}/${totalQ})` : `Answer all questions (${answeredCount}/${totalQ})`) : t.qcm_submit}
      </button>
    </div>
  );
}

// ── Contenu d'un cours ─────────────────────────────────────────────────────────

function CoursContent({ cours, moduleId, formationId, theme, onCompleted, onGoNext, hasNext, titleRef, onAnnounce, onAuthError }) {
  const [completing, setCompleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [err, setErr] = useState("");
  const [downloadErr, setDownloadErr] = useState("");
  const [justCompleted, setJustCompleted] = useState(false);
  const { language } = useLanguage();
  const t = language === "fr" ? formationsFr : formationsEn;
  const muted = theme === "dark" ? "text-white/70" : "text-gray-600";
  const card = theme === "dark" ? "bg-zinc-800/60 border-zinc-700" : "bg-gray-50 border-gray-200";

  // Réinitialiser les états quand le cours change
  useEffect(() => {
    setJustCompleted(false);
    setErr("");
    setDownloadErr("");
  }, [cours.id]);

  const complete = async () => {
    setCompleting(true); setErr("");
    try {
      const data = await apiFetch(`${API_BASE}/courses/${cours.id}/complete/`, {
        method: "POST", body: { module_id: moduleId },
      });
      setJustCompleted(true);
      onAnnounce?.(language === "fr" ? `Cours "${cours.title}" marqué comme terminé.` : `Course "${cours.title}" marked as completed.`);
      onCompleted?.(data);
    } catch (e) { if (e.status === 401) onAuthError?.(); else setErr(e.message); }
    finally { setCompleting(false); }
  };

  const downloadPdf = async () => {
    setDownloading(true);
    setDownloadErr("");
    try {
      const url = `${API_BASE}/formations/${formationId}/modules/${moduleId}/courses/${cours.id}/download/`;
      const r = await fetch(url, { credentials: "include" });
      if (!r.ok) {
        if (r.status === 401) { onAuthError?.(); return; }
        const contentType = r.headers.get("Content-Type") || "";
        let detail = `HTTP ${r.status}`;
        if (contentType.includes("application/json")) {
          const data = await r.json().catch(() => ({}));
          detail = data?.detail || detail;
        }
        throw new Error(detail);
      }
      const blob = await r.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      const disposition = r.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      a.download = match ? match[1] : `cours-${cours.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      setDownloadErr(e.message);
    } finally {
      setDownloading(false);
    }
  };

  const embedUrl = cours.video_url ? getYoutubeEmbedUrl(cours.video_url) : null;
  const isMarkedDone = cours.is_completed || justCompleted;

  return (
    <article className={`space-y-6 rounded-2xl border p-4 sm:p-6 overflow-hidden ${
      theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100 shadow-sm"
    }`}>
      {/* Titre — ref pour gestion du focus */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1
            ref={titleRef}
            tabIndex={-1}
            className="text-xl md:text-2xl font-bold leading-tight focus:outline-none"
          >
            {cours.title}
          </h1>
          {isMarkedDone && (
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs text-green-500 font-semibold bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
              <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {t.course_done}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <button
            type="button"
            onClick={downloadPdf}
            disabled={downloading}
            aria-label={downloading ? t.downloading_label : t.download_pdf_label}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition min-h-[36px] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none disabled:opacity-50 ${
              theme === "dark"
                ? "border-zinc-700 text-white/70 hover:bg-white/5"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {downloading ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            ) : (
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M8 12l4 4 4-4M12 4v12" />
              </svg>
            )}
            <span>{downloading ? t.downloading : t.download_pdf}</span>
          </button>
          {downloadErr && (
            <p className="text-[11px] text-red-400 text-right max-w-[200px]" role="alert">
              {downloadErr}
            </p>
          )}
        </div>
      </div>

      {/* Vidéo */}
      {cours.video_url && (
        embedUrl ? (
          <div className="rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={embedUrl}
              title={`${t.video_title} : ${cours.title}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <div className={`rounded-xl border p-4 flex items-center gap-3 ${card}`}>
            <span className="w-10 h-10 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center text-lg shrink-0" aria-hidden="true">▶</span>
            <div>
              <p className="text-sm font-medium">{t.video_title}</p>
              <a
                href={cours.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-500 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 rounded"
              >
                {t.open_new_tab}
                <span className="sr-only"> {t.open_new_tab_sr}</span>
                <span aria-hidden="true"> →</span>
              </a>
            </div>
          </div>
        )
      )}

      {/* Contenu texte — HTML sanitisé par bleach côté serveur */}
      {cours.content ? (
        <div
          className={`prose prose-sm max-w-none leading-relaxed
            [&_img]:max-w-full [&_img]:rounded [&_img]:my-2
            [&_a]:text-blue-500 [&_a]:underline
            [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:max-w-full
            [&_table]:w-full [&_table]:table-fixed
            [&_code]:break-words [&_code]:whitespace-pre-wrap
${theme === "dark" ? "prose-invert" : "text-gray-700"}
          `}
          dangerouslySetInnerHTML={{ __html: cours.content }}
        />
      ) : !cours.video_url && (
        <p className={`text-sm ${muted} italic py-4`}>{t.content_coming}</p>
      )}

      {/* Zone action complétion */}
      <div className={`rounded-xl border p-4 ${card}`}>
        {isMarkedDone ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-green-500 text-sm font-semibold">
              <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0" aria-hidden="true">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {t.course_done}
            </div>
            {hasNext && (
              <button
                type="button"
                onClick={onGoNext}
                className="sm:ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition min-h-[44px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                {t.next_course} <span aria-hidden="true">→</span>
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
              {completing ? t.saving : t.mark_done}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

// ── Bannière de fin de formation ──────────────────────────────────────────────

function CompletionBanner({ formationName, theme }) {
  const { language } = useLanguage();
  const t = language === "fr" ? formationsFr : formationsEn;
  const card = theme === "dark" ? "bg-emerald-950/60 border-emerald-800/50" : "bg-green-50 border-green-200";
  return (
    <div className={`rounded-xl border p-6 text-center space-y-3 ${card}`} role="status" aria-label={t.formation_done_aria}>
      <div className="text-5xl" aria-hidden="true">🎉</div>
      <h2 className="text-xl font-bold text-green-500">{t.formation_done}</h2>
      <p className={`text-sm ${theme === "dark" ? "text-white/60" : "text-gray-600"}`}>
        {t.congrats_prefix} <strong>{formationName}</strong>.
      </p>
      <Link
        to="/profile#formations"
        className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition min-h-[44px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600 focus-visible:outline-none"
      >
        {t.view_profile} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function FormationParcours() {
  const { id: formationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();

  const handleAuthError = useCallback(() => {
    navigate("/login", { state: { from: location }, replace: true });
  }, [navigate, location]);
  const t = language === "fr" ? formationsFr : formationsEn;
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
  const sidebarCls = theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200";
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
        } catch (e) {
          if (e.status === 401) handleAuthError();
        }
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
      if (e.status === 401) handleAuthError();
      else setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [formationId, user, handleAuthError]);

  useEffect(() => { load(); }, [load]);

  // ── SEO : titre dynamique formation → module → cours ─────────────────────
  useEffect(() => {
    if (!formation) return;
    const parts = ["weeb"];
    if (formation.name) parts.unshift(formation.name);
    if (activeCours?.title) parts.unshift(activeCours.title);
    const prev = document.title;
    document.title = parts.join(" | ");
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && formation.description) metaDesc.setAttribute("content", formation.description);
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute("content", "noindex, follow");
    return () => { document.title = prev; };
  }, [formation, activeCours?.title]);

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

  const allItems = useMemo(() => safeModules.flatMap((m) => [
    ...m.coursList.map((c) => ({ type: "cours", data: c, moduleId: m.id, label: c.title })),
    ...(m.has_qcm ? [{ type: "qcm", moduleId: m.id, label: `QCM — ${m.title}` }] : []),
  ]), [safeModules]);

  const currentIdx = useMemo(() => allItems.findIndex((item) =>
    showQCM
      ? item.type === "qcm" && item.moduleId === activeModuleId
      : item.type === "cours" && item.data?.id === activeCours?.id
  ), [allItems, showQCM, activeModuleId, activeCours?.id]);

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
    <nav aria-label={t.sidebar_label}>
      <ul className="py-4 px-3 space-y-1" role="list">
        {safeModules.map((m, mi) => {
          const modPct = m.total_cours ? Math.round((m.completed_cours / m.total_cours) * 100) : 0;
          const isActiveMod = m.id === activeModuleId;

          return (
            <li key={m.id} className="mb-1">
              {/* En-tête module */}
              <div
                className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                  isActiveMod
                    ? (theme === "dark" ? "bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/20" : "bg-indigo-50 ring-1 ring-inset ring-indigo-200")
                    : ""
                } ${!m.is_accessible ? "opacity-40" : ""}`}
                aria-label={`Module ${mi + 1} : ${m.title}${m.is_completed ? t.done_suffix : ""}`}
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
                        aria-label={`${c.title}${c.is_completed ? t.done_suffix : !c.is_accessible ? t.locked_suffix : ""}${isActive ? t.current_course_suffix : ""}`}
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
                        aria-label={`${t.qcm_of_module_prefix} ${m.title}${m.qcm_passed ? t.qcm_validated_suffix : !m.is_accessible ? t.locked_suffix : ""}${isQcmActive ? t.qcm_current_suffix : ""}`}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition min-h-[36px] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none
                          ${isQcmActive
                            ? "bg-amber-500 text-white"
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
                        <span className="truncate">{t.qcm} {m.qcm_passed ? t.qcm_validated_text : t.qcm_validation_text}</span>
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
        <Link to="/profile#formations" className="text-sm text-indigo-500 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 rounded">
          {t.back_to_formations}
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
        {t.skip_to_content}
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
        theme === "dark" ? "bg-zinc-950/90 backdrop-blur border-zinc-800" : "bg-white/90 backdrop-blur border-gray-200"
      }`}>
        <Link
          to="/profile#formations"
          className={`flex items-center gap-1.5 text-sm shrink-0 px-2 py-1.5 rounded-lg transition hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${muted}`}
        >
          <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">{t.my_formations}</span>
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" aria-label={language === "fr" ? `Formation : ${formation?.name}` : `Training: ${formation?.name}`}>
            {formation?.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <ProgressBar
              pct={globalPct}
              thin
              className="flex-1 max-w-[180px]"
              label={language === "fr" ? `Progression globale : ${doneCours} cours sur ${totalCours} terminés, ${globalPct}%` : `Overall progress: ${doneCours} of ${totalCours} courses completed, ${globalPct}%`}
            />
            <span className={`text-[11px] shrink-0 tabular-nums font-medium transition-colors ${globalPct >= 100 ? "text-green-500" : muted}`}>
              {globalPct}%
            </span>
          </div>
        </div>

        {/* Bouton sidebar mobile */}
        <button
          ref={menuBtnRef}
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className={`md:hidden p-2 rounded-lg border min-w-[44px] min-h-[44px] flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
            sidebarOpen
              ? theme === "dark" ? "bg-white/10 border-zinc-600" : "bg-gray-100 border-gray-300"
              : theme === "dark" ? "border-zinc-700 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
          }`}
          aria-label={sidebarOpen ? t.sidebar_close_full : t.sidebar_open}
          aria-expanded={sidebarOpen}
          aria-controls="mobile-sidebar"
          aria-haspopup="dialog"
        >
          {sidebarOpen ? (
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar desktop */}
        <aside
          className={`hidden md:flex flex-col w-72 shrink-0 border-r sticky top-[57px] self-start h-[calc(100vh-57px)] overflow-y-auto ${sidebarCls}`}
          aria-label={t.sidebar_label}
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
          aria-label={t.sidebar_label}
          className={`md:hidden fixed left-0 top-0 h-full w-[280px] max-w-[85vw] z-50 border-r overflow-hidden flex flex-col ${sidebarCls} ${
            reducedMotion ? "" : "transition-transform duration-300 ease-in-out"
          } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-inherit shrink-0">
            <span className="font-semibold text-sm" id="drawer-title">{t.sidebar_label}</span>
            <button
              onClick={closeSidebar}
              className={`p-1.5 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center ${muted} hover:opacity-70 transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none`}
              aria-label={t.sidebar_close}
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
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
          <div className="w-full px-4 sm:px-6 py-8 pb-24">

            {/* Breadcrumb */}
            {activeModule && (
              <nav aria-label={t.breadcrumb_label} className="mb-4">
                <ol className={`flex flex-wrap items-center gap-1 text-xs ${muted}`}>
                  <li>
                    <Link to="/profile#formations" className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 rounded">
                      {t.my_formations}
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
                      <li className="font-medium text-amber-500" aria-current="page">{t.qcm}</li>
                    </>
                  )}
                </ol>
              </nav>
            )}

            {/* État vide */}
            {!activeCours && !showQCM && (
              <div className={`text-center py-20 ${muted}`}>
                <p className="text-5xl mb-4" aria-hidden="true">📚</p>
                <p className="font-medium mb-1">{t.ready_to_learn}</p>
                <p className="text-sm">{t.select_course_hint}</p>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden mt-5 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition min-h-[44px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                  {t.view_plan}
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
                formationId={formationId}
                theme={theme}
                onCompleted={handleCoursCompleted}
                onGoNext={goNext}
                hasNext={!!nextItem}
                titleRef={titleRef}
                onAnnounce={setAnnouncement}
                onAuthError={handleAuthError}
              />
            )}

            {/* QCM actif */}
            {showQCM && activeModuleId && (
              <section aria-label={t.qcm_validation_title} className={`space-y-5 rounded-2xl border p-4 sm:p-6 overflow-hidden ${
                theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100 shadow-sm"
              }`}>
                <div>
                  <h1
                    ref={titleRef}
                    tabIndex={-1}
                    className="text-xl md:text-2xl font-bold focus:outline-none"
                  >
                    {t.qcm_validation_title}
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
                  onAuthError={handleAuthError}
                />
              </section>
            )}

            {/* Navigation précédent / suivant */}
            {(activeCours || showQCM) && (
              <nav
                aria-label={t.nav_lessons_label}
                className="flex justify-between items-center mt-10 pt-6 border-t border-inherit gap-2"
              >
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={!prevItem}
                  aria-disabled={!prevItem}
                  aria-label={prevItem ? `${t.nav_prev.replace("← ", "")} : ${prevItem.label}` : t.no_prev_lesson}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition disabled:opacity-30 min-h-[44px] max-w-[45%] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                    theme === "dark" ? "border-zinc-700 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="flex flex-col items-start gap-0.5 min-w-0">
                    <span className={`text-[11px] ${muted}`} aria-hidden="true">{t.nav_prev}</span>
                    {prevItem && (
                      <span className="text-xs font-medium truncate w-full" aria-hidden="true">{prevItem.label}</span>
                    )}
                  </span>
                </button>

                <span className={`text-xs shrink-0 tabular-nums ${muted}`} aria-label={language === "fr" ? `Leçon ${currentIdx + 1} sur ${allItems.length}` : `Lesson ${currentIdx + 1} of ${allItems.length}`}>
                  {currentIdx + 1}/{allItems.length}
                </span>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={!nextItem}
                  aria-disabled={!nextItem}
                  aria-label={nextItem ? `${t.nav_next.replace(" →", "")} : ${nextItem.label}` : t.no_next_lesson}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition disabled:opacity-30 min-h-[44px] max-w-[45%] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                    theme === "dark" ? "border-zinc-700 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex flex-col items-end gap-0.5 min-w-0">
                    <span className={`text-[11px] ${muted}`} aria-hidden="true">{t.nav_next}</span>
                    {nextItem && (
                      <span className="text-xs font-medium truncate w-full text-right" aria-hidden="true">{nextItem.label}</span>
                    )}
                  </span>
                  <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
