/**
 * Page d'apprentissage d'une formation.
 * Route : /formation/:id/learn
 *
 * Layout :
 *  - Mobile  : sidebar accordéon en haut + contenu en dessous
 *  - Desktop : sidebar fixe gauche + contenu principal à droite
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { API_BASE, ensureCsrf } from "../lib/api";

// ── helpers ───────────────────────────────────────────────────────────────────

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

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ pct, thin = false }) {
  return (
    <div className={`w-full rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 ${thin ? "h-1.5" : "h-2"}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-green-500" : "bg-indigo-500"}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

// ── Icône de statut (rond coloré) ─────────────────────────────────────────────

function StatusDot({ done, accessible, small = false }) {
  const size = small ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs";
  if (done) return (
    <span className={`${size} rounded-full bg-green-500 text-white flex items-center justify-center shrink-0`} aria-label="Terminé">✓</span>
  );
  if (!accessible) return (
    <span className={`${size} rounded-full border-2 border-gray-300 dark:border-white/20 text-gray-300 dark:text-white/20 flex items-center justify-center shrink-0`} aria-label="Verrouillé">🔒</span>
  );
  return (
    <span className={`${size} rounded-full border-2 border-indigo-400 flex items-center justify-center shrink-0`} aria-label="Disponible" />
  );
}

// ── QCM Panel ─────────────────────────────────────────────────────────────────

function QCMPanel({ moduleId, onPassed, theme }) {
  const [qcm, setQcm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const muted = theme === "dark" ? "text-white/60" : "text-gray-500";
  const card = theme === "dark" ? "bg-[#1e1e1e] border-[#333]" : "bg-gray-50 border-gray-200";

  useEffect(() => {
    setLoading(true); setErr("");
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
      if (data.passed) onPassed?.();
    } catch (e) { setErr(e.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <p className={`text-sm ${muted} py-4`}>Chargement du QCM…</p>;
  if (err && !qcm) return <p className="text-sm text-amber-500 py-2">{err}</p>;
  if (!qcm) return null;

  if (qcm.already_passed) return (
    <div className={`rounded-xl border p-4 ${card}`}>
      <p className="text-green-500 font-medium text-sm">✓ QCM déjà validé — Score : {qcm.best_score}%</p>
    </div>
  );

  if (result) return (
    <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
      <div className={`text-center ${result.passed ? "text-green-500" : "text-red-400"}`}>
        <div className="text-4xl font-bold">{result.score}%</div>
        <div className="text-sm font-medium mt-1">
          {result.passed ? "🎉 Module validé !" : `Score insuffisant (min. ${qcm.passing_score}%)`}
        </div>
      </div>
      <div className="space-y-3">
        {result.questions?.map((q) => {
          const chosen = parseInt(answers[String(q.id)]);
          return (
            <div key={q.id}>
              <p className="text-sm font-medium mb-1">{q.question_text}</p>
              <ul className="space-y-0.5 ml-3">
                {q.choices.map((c) => {
                  const cls = c.is_correct ? "text-green-500" : c.id === chosen ? "text-red-400" : muted;
                  return (
                    <li key={c.id} className={`text-sm flex gap-1.5 ${cls}`}>
                      <span>{c.is_correct ? "✓" : c.id === chosen ? "✗" : "·"}</span>
                      {c.choice_text}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      {!result.passed && (
        <button onClick={() => { setResult(null); setAnswers({}); setErr(""); }}
          className="w-full py-2 rounded-lg border text-sm hover:opacity-80 transition">
          Réessayer
        </button>
      )}
    </div>
  );

  return (
    <div className={`rounded-xl border p-5 space-y-5 ${card}`}>
      <div>
        <h3 className="font-semibold">{qcm.title}</h3>
        {qcm.attempts_count > 0 && (
          <p className={`text-xs mt-0.5 ${muted}`}>
            {qcm.attempts_count} tentative{qcm.attempts_count > 1 ? "s" : ""} — Meilleur score : {qcm.best_score ?? 0}%
          </p>
        )}
      </div>
      {qcm.questions.map((q, qi) => (
        <div key={q.id}>
          <p className="text-sm font-medium mb-2">{qi + 1}. {q.question_text}</p>
          <ul className="space-y-1.5">
            {q.choices.map((c) => (
              <li key={c.id}>
                <label className={`flex items-center gap-2.5 cursor-pointer text-sm p-2 rounded-lg border transition ${
                  answers[String(q.id)] === c.id
                    ? "border-indigo-400 bg-indigo-500/10"
                    : theme === "dark" ? "border-[#333] hover:border-[#555]" : "border-gray-200 hover:border-gray-400"
                }`}>
                  <input type="radio" name={`q-${q.id}`} value={c.id}
                    checked={answers[String(q.id)] === c.id}
                    onChange={() => setAnswers((a) => ({ ...a, [String(q.id)]: c.id }))}
                    className="accent-indigo-500 shrink-0" />
                  {c.choice_text}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {err && <p className="text-xs text-red-400">{err}</p>}
      <button onClick={submit} disabled={submitting}
        className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50">
        {submitting ? "Envoi en cours…" : "Soumettre le QCM"}
      </button>
    </div>
  );
}

// ── Contenu d'un cours ─────────────────────────────────────────────────────────

function CoursContent({ cours, moduleId, theme, onCompleted }) {
  const [completing, setCompleting] = useState(false);
  const [err, setErr] = useState("");
  const muted = theme === "dark" ? "text-white/70" : "text-gray-600";

  const complete = async () => {
    setCompleting(true); setErr("");
    try {
      const data = await apiFetch(`${API_BASE}/courses/${cours.id}/complete/`, {
        method: "POST", body: { module_id: moduleId },
      });
      onCompleted?.(data);
    } catch (e) { setErr(e.message); }
    finally { setCompleting(false); }
  };

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold">{cours.title}</h2>
        {cours.is_completed && (
          <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-500 font-medium">
            <span>✓</span> Cours terminé
          </span>
        )}
      </div>

      {/* Vidéo */}
      {cours.video_url && (
        <div className={`rounded-xl border p-4 ${theme === "dark" ? "bg-[#1e1e1e] border-[#333]" : "bg-gray-50 border-gray-200"}`}>
          <a href={cours.video_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-indigo-500 hover:underline font-medium text-sm">
            <span className="text-lg">▶</span> Regarder la vidéo
          </a>
        </div>
      )}

      {/* Contenu texte */}
      {cours.content ? (
        <div className={`leading-relaxed whitespace-pre-wrap text-sm md:text-base ${muted}`}>
          {cours.content}
        </div>
      ) : (
        <p className={`text-sm ${muted} italic`}>Contenu à venir.</p>
      )}

      {/* Bouton complétion */}
      {!cours.is_completed && (
        <div className="pt-2">
          {err && <p className="text-xs text-red-400 mb-2">{err}</p>}
          <button onClick={complete} disabled={completing}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
            {completing && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Marquer comme terminé
          </button>
        </div>
      )}
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function FormationParcours() {
  const { id: formationId } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [formation, setFormation] = useState(null);
  const [modules, setModules] = useState([]); // chaque module a .coursList[]
  const [globalPct, setGlobalPct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Cours/module actif
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [activeCours, setActiveCours] = useState(null); // objet cours
  const [showQCM, setShowQCM] = useState(false);

  // Sidebar mobile ouverte/fermée
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  const bg = theme === "dark" ? "bg-background text-white" : "bg-light text-dark";
  const sidebar = theme === "dark" ? "bg-[#161616] border-[#2a2a2a]" : "bg-white border-gray-200";
  const muted = theme === "dark" ? "text-white/50" : "text-gray-400";

  // Déclaré tôt pour être disponible dans tous les handlers et calculs
  const safeModules = Array.isArray(modules) ? modules : [];

  // ── Chargement ──────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    if (!formationId) return;
    setLoading(true); setErr("");
    try {
      // Formation info + modules en parallèle
      const [fData, mData] = await Promise.all([
        apiFetch(`${API_BASE}/formations/${formationId}/`),
        apiFetch(`${API_BASE}/formations/${formationId}/modules/`),
      ]);
      setFormation(fData);

      const mods = extractList(mData);

      // Charger les cours de chaque module en parallèle
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

      // Progression globale
      if (user) {
        try {
          const prog = await apiFetch(`${API_BASE}/formations/${formationId}/progress/`);
          setGlobalPct(prog.progress_percent ?? 0);
        } catch { /* noop */ }
      }

      // Sélectionner automatiquement le premier cours accessible non terminé
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
      // Si tout est terminé, ouvrir le dernier cours
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

  // Scroll vers le haut du contenu à chaque changement de cours
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeCours?.id, showQCM]);

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
    // Mettre à jour le cours dans l'état
    setModules((prev) => prev.map((m) => {
      if (m.id !== activeModuleId) return m;
      const updatedCoursList = m.coursList.map((c, i, arr) => {
        if (c.id === activeCours.id) return { ...c, is_completed: true };
        // Déverrouiller le cours suivant
        if (i > 0 && arr[i - 1].id === activeCours.id) return { ...c, is_accessible: true };
        return c;
      });
      return {
        ...m,
        coursList: updatedCoursList,
        completed_cours: progressData.completed_cours ?? m.completed_cours,
      };
    }));

    // Mettre à jour l'activeCours
    setActiveCours((prev) => prev ? { ...prev, is_completed: true } : prev);

    // Progression globale
    if (progressData.all_cours_done) {
      setGlobalPct((prev) => Math.max(prev, Math.round((progressData.completed_cours / progressData.total_cours) * 100)));
      // Si module a QCM, proposer le QCM
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
    setGlobalPct((_prev) => {
      const doneModules = safeModules.filter((m) => m.id === activeModuleId ? true : m.is_completed).length;
      return Math.round((doneModules / (safeModules.length || 1)) * 100);
    });
  };

  // ── Navigation prev/next ────────────────────────────────────────────────────

  const allItems = safeModules.flatMap((m) => [
    ...m.coursList.map((c) => ({ type: "cours", data: c, moduleId: m.id })),
    ...(m.has_qcm ? [{ type: "qcm", moduleId: m.id, modTitle: m.title }] : []),
  ]);

  const currentIdx = allItems.findIndex((item) =>
    showQCM ? item.type === "qcm" && item.moduleId === activeModuleId
            : item.type === "cours" && item.data?.id === activeCours?.id
  );

  const goPrev = () => {
    if (currentIdx <= 0) return;
    const prev = allItems[currentIdx - 1];
    if (prev.type === "qcm") selectQCM(prev.moduleId);
    else selectCours(prev.data, prev.moduleId);
  };

  const goNext = () => {
    if (currentIdx >= allItems.length - 1) return;
    const next = allItems[currentIdx + 1];
    if (next.type === "qcm") selectQCM(next.moduleId);
    else selectCours(next.data, next.moduleId);
  };

  // ── Render helpers ──────────────────────────────────────────────────────────

  const totalCours = safeModules.reduce((s, m) => s + (m.total_cours || 0), 0);
  const doneCours = safeModules.reduce((s, m) => s + (m.completed_cours || 0), 0);

  // ── Sidebar ─────────────────────────────────────────────────────────────────

  const SidebarContent = () => (
    <nav aria-label="Plan de la formation" className="h-full overflow-y-auto py-4 px-3 space-y-1">
      {safeModules.map((m) => {
        const modPct = m.total_cours ? Math.round((m.completed_cours / m.total_cours) * 100) : 0;
        const isActiveMod = m.id === activeModuleId;

        return (
          <div key={m.id}>
            {/* Header module */}
            <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
              isActiveMod ? (theme === "dark" ? "bg-white/5" : "bg-indigo-50") : ""
            } ${!m.is_accessible ? "opacity-40" : ""}`}>
              <StatusDot done={m.is_completed} accessible={m.is_accessible} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${!m.is_accessible ? muted : ""}`}>{m.title}</p>
                {m.total_cours > 0 && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <ProgressBar pct={modPct} thin />
                    <span className={`text-[10px] shrink-0 ${muted}`}>{modPct}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cours du module */}
            <ul className="ml-5 mt-0.5 space-y-0.5">
              {m.coursList.map((c) => {
                const isActive = !showQCM && activeCours?.id === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => selectCours(c, m.id)}
                      disabled={!c.is_accessible}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition
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
              {m.has_qcm && (
                <li>
                  <button
                    type="button"
                    onClick={() => selectQCM(m.id)}
                    disabled={!m.is_accessible}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition
                      ${showQCM && activeModuleId === m.id
                        ? "bg-indigo-600 text-white"
                        : !m.is_accessible
                        ? `${muted} cursor-not-allowed opacity-50`
                        : theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"
                      }`}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] shrink-0 ${
                      m.qcm_passed ? "border-green-500 bg-green-500 text-white" : "border-amber-400 text-amber-400"
                    }`}>
                      {m.qcm_passed ? "✓" : "?"}
                    </span>
                    <span className="truncate">QCM {m.qcm_passed ? "(validé)" : "de validation"}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  // ── Rendu ────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="space-y-3 w-48">
          <div className={`h-3 rounded-full animate-pulse ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`} />
          <div className={`h-3 rounded-full animate-pulse w-3/4 ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`} />
          <div className={`h-3 rounded-full animate-pulse w-1/2 ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`} />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${bg}`}>
        <p className="text-red-400">{err}</p>
        <Link to="/formations" className="text-sm text-indigo-500 hover:underline">← Retour aux formations</Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-30 border-b px-4 py-3 flex items-center gap-3 ${
        theme === "dark" ? "bg-[#111]/90 backdrop-blur border-[#2a2a2a]" : "bg-white/90 backdrop-blur border-gray-200"
      }`}>
        <Link to="/formations" className={`text-sm hover:underline shrink-0 ${muted}`} aria-label="Retour aux formations">
          ← Formations
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{formation?.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 max-w-[120px]">
              <ProgressBar pct={globalPct} thin />
            </div>
            <span className={`text-[11px] shrink-0 ${muted}`}>
              {doneCours}/{totalCours} cours · {globalPct}%
            </span>
          </div>
        </div>

        {/* Bouton sidebar mobile */}
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className={`md:hidden p-2 rounded-lg border text-sm ${
            theme === "dark" ? "border-[#333] hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
          }`}
          aria-label="Plan du cours"
          aria-expanded={sidebarOpen}
        >
          ☰
        </button>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar desktop */}
        <aside className={`hidden md:flex flex-col w-72 shrink-0 border-r sticky top-[57px] self-start h-[calc(100vh-57px)] ${sidebar}`}>
          <SidebarContent />
        </aside>

        {/* Sidebar mobile (overlay) */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/40" />
            <aside
              className={`absolute left-0 top-0 h-full w-72 border-r overflow-hidden ${sidebar}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-inherit">
                <span className="font-semibold text-sm">Plan de la formation</span>
                <button onClick={() => setSidebarOpen(false)} className={`p-1 rounded ${muted}`}>✕</button>
              </div>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Contenu principal */}
        <main
          ref={contentRef}
          className="flex-1 overflow-y-auto"
          id="main-content"
        >
          <div className="max-w-3xl mx-auto px-4 py-8 pb-24">

            {/* Aucun cours sélectionné */}
            {!activeCours && !showQCM && (
              <div className={`text-center py-16 ${muted}`}>
                <p className="text-4xl mb-3">📚</p>
                <p className="text-sm">Sélectionnez un cours dans le menu pour commencer.</p>
              </div>
            )}

            {/* Cours actif */}
            {activeCours && !showQCM && (
              <CoursContent
                cours={activeCours}
                moduleId={activeModuleId}
                theme={theme}
                onCompleted={handleCoursCompleted}
              />
            )}

            {/* QCM actif */}
            {showQCM && activeModuleId && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">QCM de validation</h2>
                  <p className={`text-sm mt-1 ${muted}`}>
                    {safeModules.find((m) => m.id === activeModuleId)?.title}
                  </p>
                </div>
                <QCMPanel moduleId={activeModuleId} theme={theme} onPassed={handleQCMPassed} />
              </div>
            )}

            {/* Navigation précédent / suivant */}
            {(activeCours || showQCM) && (
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-inherit">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={currentIdx <= 0}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition disabled:opacity-30 ${
                    theme === "dark" ? "border-[#333] hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ← Précédent
                </button>

                <span className={`text-xs ${muted}`}>
                  {currentIdx + 1} / {allItems.length}
                </span>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={currentIdx >= allItems.length - 1}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition disabled:opacity-30 ${
                    theme === "dark" ? "border-[#333] hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
