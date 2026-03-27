import React, { useCallback, useEffect, useState } from "react";
import { ensureCsrf } from "../../lib/api";
import RichTextEditor from "./RichTextEditor";

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
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (r.status === 204) return null;
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = data?.detail || data?.non_field_errors?.[0] || `HTTP ${r.status}`;
    throw new Error(String(msg));
  }
  return data;
}

// ── sous-composants ───────────────────────────────────────────────────────────

function Spinner() {
  return <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />;
}

function ErrMsg({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

/** Éditeur QCM inline — crée ou remplace le QCM d'un module */
export function QCMEditor({ apiBase, moduleId, theme, onClose }) {
  const muted = theme === "dark" ? "text-white/60" : "text-gray-500";
  const input = `w-full rounded-lg border px-2 py-1.5 text-sm outline-none transition ${
    theme === "dark"
      ? "bg-surface-deep border-border-2 text-white focus:border-white/40"
      : "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
  }`;
  const card = theme === "dark" ? "bg-surface border-border" : "bg-gray-50 border-gray-200";

  const [title, setTitle] = useState("QCM du module");
  const [passing, setPassing] = useState(70);
  const [questions, setQuestions] = useState([
    { question_text: "", order: 0, choices: [{ choice_text: "", is_correct: true }, { choice_text: "", is_correct: false }] },
  ]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Charger le QCM existant
  useEffect(() => {
    apiFetch(`${apiBase}/modules/${moduleId}/qcm/`)
      .then((d) => {
        if (!d) return;
        setTitle(d.title || "QCM du module");
        setPassing(d.passing_score ?? 70);
        if (d.questions?.length) {
          setQuestions(
            d.questions.map((q) => ({
              question_text: q.question_text,
              order: q.order,
              choices: q.choices.map((c) => ({ choice_text: c.choice_text, is_correct: c.is_correct ?? false })),
            }))
          );
        }
      })
      .catch(() => {/* pas de QCM existant */});
  }, [apiBase, moduleId]);

  const addQuestion = () =>
    setQuestions((prev) => [
      ...prev,
      {
        question_text: "",
        order: prev.length,
        choices: [{ choice_text: "", is_correct: true }, { choice_text: "", is_correct: false }],
      },
    ]);

  const removeQuestion = (qi) => setQuestions((prev) => prev.filter((_, i) => i !== qi));

  const updateQuestion = (qi, text) =>
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, question_text: text } : q)));

  const addChoice = (qi) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, choices: [...q.choices, { choice_text: "", is_correct: false }] } : q
      )
    );

  const removeChoice = (qi, ci) =>
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, choices: q.choices.filter((_, j) => j !== ci) } : q))
    );

  const updateChoice = (qi, ci, field, value) =>
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const choices = q.choices.map((c, j) => {
          if (field === "is_correct") {
            // radio : une seule bonne réponse
            return { ...c, is_correct: j === ci };
          }
          return j === ci ? { ...c, [field]: value } : c;
        });
        return { ...q, choices };
      })
    );

  const save = async () => {
    setErr("");
    for (const q of questions) {
      if (!q.question_text.trim()) { setErr("Toutes les questions doivent avoir un texte."); return; }
      if (q.choices.length < 2) { setErr("Chaque question doit avoir au moins 2 choix."); return; }
      if (!q.choices.some((c) => c.is_correct)) { setErr("Chaque question doit avoir une bonne réponse."); return; }
      for (const c of q.choices) {
        if (!c.choice_text.trim()) { setErr("Tous les choix doivent avoir un texte."); return; }
      }
    }
    setBusy(true);
    try {
      await apiFetch(`${apiBase}/modules/${moduleId}/qcm/`, {
        method: "POST",
        body: {
          title,
          passing_score: Number(passing),
          questions: questions.map((q, qi) => ({ ...q, order: qi })),
        },
      });
      onClose?.("saved");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteQCM = async () => {
    if (!window.confirm("Supprimer le QCM de ce module ?")) return;
    setBusy(true);
    try {
      await apiFetch(`${apiBase}/modules/${moduleId}/qcm/`, { method: "DELETE" });
      onClose?.("deleted");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`mt-2 rounded-xl border p-3 space-y-3 ${card}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className={`text-xs font-medium ${muted}`}>Titre du QCM</label>
          <input className={`${input} mt-0.5`} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="w-24">
          <label className={`text-xs font-medium ${muted}`}>Seuil (%)</label>
          <input
            type="number" min={0} max={100}
            className={`${input} mt-0.5`}
            value={passing}
            onChange={(e) => setPassing(e.target.value)}
          />
        </div>
      </div>

      {questions.map((q, qi) => (
        <div key={qi} className={`rounded-lg border p-2.5 space-y-2 ${theme === "dark" ? "border-border-2 bg-surface-deep" : "border-gray-300 bg-white"}`}>
          <div className="flex items-start gap-2">
            <span className={`text-xs font-bold mt-2 shrink-0 ${muted}`}>Q{qi + 1}</span>
            <input
              className={`${input} flex-1`}
              placeholder={`Question ${qi + 1}`}
              value={q.question_text}
              onChange={(e) => updateQuestion(qi, e.target.value)}
            />
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(qi)}
                className={`shrink-0 text-xs px-2 py-1 rounded border ${theme === "dark" ? "border-red-700 text-red-400 hover:bg-red-900/30" : "border-red-200 text-red-600 hover:bg-red-50"}`}
              >✕</button>
            )}
          </div>

          <div className="ml-5 space-y-1">
            {q.choices.map((c, ci) => (
              <div key={ci} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  checked={c.is_correct}
                  onChange={() => updateChoice(qi, ci, "is_correct", true)}
                  aria-label={`Bonne réponse pour Q${qi + 1}`}
                  className="shrink-0"
                />
                <input
                  className={`${input} flex-1`}
                  placeholder={`Choix ${ci + 1}`}
                  value={c.choice_text}
                  onChange={(e) => updateChoice(qi, ci, "choice_text", e.target.value)}
                />
                {q.choices.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeChoice(qi, ci)}
                    className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${muted} hover:text-red-500`}
                  >✕</button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addChoice(qi)}
              className={`text-xs ${muted} hover:underline`}
            >+ choix</button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className={`text-xs ${muted} hover:underline`}
      >+ ajouter une question</button>

      <ErrMsg msg={err} />

      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={deleteQCM}
          disabled={busy}
          className={`text-xs px-2 py-1 rounded border ${theme === "dark" ? "border-red-700 text-red-400 hover:bg-red-900/30" : "border-red-200 text-red-600 hover:bg-red-50"} disabled:opacity-50`}
        >Supprimer le QCM</button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onClose?.()}
            disabled={busy}
            className={`text-xs px-3 py-1.5 rounded-lg border ${theme === "dark" ? "border-border-2 hover:bg-border" : "border-gray-300 hover:bg-gray-100"}`}
          >Annuler</button>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >{busy ? <Spinner /> : null}Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

/** Ligne de cours avec édition inline */
function CoursRow({ apiBase, cours, theme, onUpdated, onDeleted }) {
  const muted = theme === "dark" ? "text-white/60" : "text-gray-500";
  const input = `w-full rounded-lg border px-2 py-1.5 text-sm outline-none transition ${
    theme === "dark"
      ? "bg-surface-deep border-border-2 text-white focus:border-white/40"
      : "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
  }`;

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(cours.title);
  const [content, setContent] = useState(cours.content || "");
  const [videoUrl, setVideoUrl] = useState(cours.video_url || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    if (!title.trim()) { setErr("Le titre est requis."); return; }
    setBusy(true);
    setErr("");
    try {
      const updated = await apiFetch(`${apiBase}/courses/${cours.id}/`, {
        method: "PATCH",
        body: { title: title.trim(), content, video_url: videoUrl },
      });
      onUpdated?.(updated);
      setEditing(false);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Supprimer le cours "${cours.title}" ?`)) return;
    setBusy(true);
    try {
      await apiFetch(`${apiBase}/courses/${cours.id}/`, { method: "DELETE" });
      onDeleted?.(cours.id);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <div className={`rounded-lg border p-2.5 space-y-2 ${theme === "dark" ? "border-border-2 bg-surface-deep" : "border-gray-200 bg-white"}`}>
        <input className={input} placeholder="Titre du cours *" value={title} onChange={(e) => setTitle(e.target.value)} />
        <RichTextEditor
          value={content}
          onChange={setContent}
          theme={theme}
          uploadEndpoint={`${apiBase}/upload/image/`}
        />
        <input className={input} placeholder="URL vidéo (optionnel)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
        <ErrMsg msg={err} />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => { setEditing(false); setErr(""); }} disabled={busy}
            className={`text-xs px-2 py-1 rounded border ${theme === "dark" ? "border-border-2 hover:bg-border" : "border-gray-300 hover:bg-gray-100"}`}>
            Annuler
          </button>
          <button type="button" onClick={save} disabled={busy}
            className="flex items-center gap-1 text-xs px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
            {busy ? <Spinner /> : null}Sauvegarder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1">
      <span className={`text-xs w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${muted} border-current`}>
        {cours.order + 1}
      </span>
      <span className="text-sm flex-1 truncate">{cours.title}</span>
      {cours.video_url && <span className={`text-xs ${muted}`} title="Vidéo">▶</span>}
      <button type="button" onClick={() => setEditing(true)} disabled={busy}
        className={`text-xs px-2 py-0.5 rounded border ${theme === "dark" ? "border-border-2 hover:bg-border" : "border-gray-200 hover:bg-gray-100"}`}>
        Éditer
      </button>
      <button type="button" onClick={remove} disabled={busy}
        className={`text-xs px-2 py-0.5 rounded border ${theme === "dark" ? "border-red-800 text-red-400 hover:bg-red-900/30" : "border-red-200 text-red-600 hover:bg-red-50"}`}>
        ✕
      </button>
    </div>
  );
}

/** Module avec ses cours et son QCM */
function ModuleBlock({ apiBase, module, theme, onUpdated, onDeleted }) {
  const muted = theme === "dark" ? "text-white/60" : "text-gray-500";
  const input = `w-full rounded-lg border px-2 py-1.5 text-sm outline-none transition ${
    theme === "dark"
      ? "bg-surface-deep border-border-2 text-white focus:border-white/40"
      : "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
  }`;
  const block = theme === "dark" ? "bg-surface border-border" : "bg-white border-gray-200";

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [cours, setCours] = useState([]);
  const [coursLoaded, setCoursLoaded] = useState(false);
  const [showQCM, setShowQCM] = useState(false);
  const [hasQCM, setHasQCM] = useState(module.has_qcm ?? false);
  const [addingCours, setAddingCours] = useState(false);
  const [newCoursTitle, setNewCoursTitle] = useState("");
  const [newCoursContent, setNewCoursContent] = useState("");
  const [newCoursVideo, setNewCoursVideo] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [addErr, setAddErr] = useState("");

  const loadCours = useCallback(async () => {
    if (coursLoaded) return;
    try {
      const data = await apiFetch(`${apiBase}/modules/${module.id}/courses/`);
      const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      setCours(list);
      setCoursLoaded(true);
    } catch { /* noop */ }
  }, [apiBase, module.id, coursLoaded]);

  useEffect(() => {
    if (open) loadCours();
  }, [open, loadCours]);

  const saveModule = async () => {
    if (!title.trim()) { setErr("Le titre est requis."); return; }
    setBusy(true);
    setErr("");
    try {
      const updated = await apiFetch(`${apiBase}/modules/${module.id}/`, {
        method: "PATCH",
        body: { title: title.trim() },
      });
      onUpdated?.(updated);
      setEditing(false);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteModule = async () => {
    if (!window.confirm(`Supprimer le module "${module.title}" et tout son contenu ?`)) return;
    setBusy(true);
    try {
      await apiFetch(`${apiBase}/modules/${module.id}/`, { method: "DELETE" });
      onDeleted?.(module.id);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const addCours = async () => {
    if (!newCoursTitle.trim()) { setAddErr("Le titre est requis."); return; }
    setBusy(true);
    setAddErr("");
    try {
      const created = await apiFetch(`${apiBase}/modules/${module.id}/courses/`, {
        method: "POST",
        body: { title: newCoursTitle.trim(), content: newCoursContent, video_url: newCoursVideo, order: cours.length },
      });
      setCours((prev) => [...prev, created]);
      setNewCoursTitle("");
      setNewCoursContent("");
      setNewCoursVideo("");
      setAddingCours(false);
    } catch (e) {
      setAddErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`rounded-xl border ${block}`}>
      {/* Header module */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`text-sm font-medium ${muted} shrink-0`}
          aria-expanded={open}
        >
          {open ? "▾" : "▸"}
        </button>

        {editing ? (
          <>
            <input
              className={`${input} flex-1`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={saveModule} disabled={busy}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
              {busy ? <Spinner /> : null}OK
            </button>
            <button type="button" onClick={() => { setEditing(false); setErr(""); setTitle(module.title); }}
              className={`text-xs px-2 py-1 rounded border ${theme === "dark" ? "border-border-2" : "border-gray-300"}`}>
              ✕
            </button>
          </>
        ) : (
          <>
            <span className="text-sm font-medium flex-1 truncate">{module.title}</span>
            <span className={`text-xs ${muted}`}>ordre {module.order}</span>
            {hasQCM && <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">QCM</span>}
            <button type="button" onClick={() => setEditing(true)} disabled={busy}
              className={`text-xs px-2 py-0.5 rounded border ${theme === "dark" ? "border-border-2 hover:bg-border" : "border-gray-200 hover:bg-gray-100"}`}>
              Éditer
            </button>
            <button type="button" onClick={deleteModule} disabled={busy}
              className={`text-xs px-2 py-0.5 rounded border ${theme === "dark" ? "border-red-800 text-red-400 hover:bg-red-900/30" : "border-red-200 text-red-600 hover:bg-red-50"}`}>
              ✕
            </button>
          </>
        )}
      </div>
      <ErrMsg msg={err} />

      {/* Contenu (cours + QCM) */}
      {open && (
        <div className={`border-t px-3 py-2 space-y-1 ${theme === "dark" ? "border-border" : "border-gray-100"}`}>

          {/* Cours list */}
          {cours.map((c) => (
            <CoursRow
              key={c.id}
              apiBase={apiBase}
              cours={c}
              moduleId={module.id}
              theme={theme}
              onUpdated={(updated) => setCours((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))}
              onDeleted={(id) => setCours((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}

          {/* Ajouter un cours */}
          {addingCours ? (
            <div className={`rounded-lg border p-2.5 space-y-2 mt-1 ${theme === "dark" ? "border-border-2 bg-surface-deep" : "border-gray-200 bg-gray-50"}`}>
              <input
                className={input}
                placeholder="Titre du cours *"
                value={newCoursTitle}
                onChange={(e) => setNewCoursTitle(e.target.value)}
                autoFocus
              />
              <RichTextEditor
                value={newCoursContent}
                onChange={setNewCoursContent}
                theme={theme}
                uploadEndpoint={`${apiBase}/upload/image/`}
              />
              <input
                className={input}
                placeholder="URL vidéo (optionnel)"
                value={newCoursVideo}
                onChange={(e) => setNewCoursVideo(e.target.value)}
              />
              <ErrMsg msg={addErr} />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setAddingCours(false); setAddErr(""); }} disabled={busy}
                  className={`text-xs px-2 py-1 rounded border ${theme === "dark" ? "border-border-2" : "border-gray-300"}`}>
                  Annuler
                </button>
                <button type="button" onClick={addCours} disabled={busy}
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                  {busy ? <Spinner /> : null}Ajouter
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingCours(true)}
              className={`text-xs ${muted} hover:underline mt-1`}
            >+ ajouter un cours</button>
          )}

          {/* QCM section */}
          <div className={`border-t mt-2 pt-2 ${theme === "dark" ? "border-border" : "border-gray-100"}`}>
            {showQCM ? (
              <QCMEditor
                apiBase={apiBase}
                moduleId={module.id}
                theme={theme}
                onClose={(action) => {
                  setShowQCM(false);
                  if (action === "saved") setHasQCM(true);
                  if (action === "deleted") setHasQCM(false);
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowQCM(true)}
                className={`text-xs ${muted} hover:underline`}
              >
                {hasQCM ? "✎ Modifier le QCM" : "+ ajouter un QCM"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Rattacher un module existant ──────────────────────────────────────────────

function AttachModulePanel({ apiBase, formationId, linkedModuleIds, theme, onAttached, onCancel }) {
  const muted = theme === "dark" ? "text-white/60" : "text-gray-500";
  const input = `w-full rounded-lg border px-2 py-1.5 text-sm outline-none transition ${
    theme === "dark"
      ? "bg-surface-deep border-border-2 text-white focus:border-white/40"
      : "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
  }`;
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const url = `${apiBase}/admin/modules/${q.trim() ? `?search=${encodeURIComponent(q.trim())}` : ""}`;
        const data = await apiFetch(url);
        const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        setResults(list.filter((m) => !linkedModuleIds.includes(m.id)));
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [q, apiBase, linkedModuleIds]);

  const attach = async (module) => {
    setBusy(true); setErr("");
    try {
      await apiFetch(`${apiBase}/formations/${formationId}/modules/${module.id}/link/`, { method: "POST" });
      onAttached(module);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className={`rounded-xl border p-3 space-y-2 ${theme === "dark" ? "bg-surface border-border-2" : "bg-gray-50 border-gray-200"}`}>
      <p className={`text-xs font-medium ${muted}`}>Rechercher un module existant</p>
      <input
        className={input}
        placeholder="Titre du module…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      {searching && <p className={`text-xs ${muted}`}>Recherche…</p>}
      {!searching && results.length === 0 && q && (
        <p className={`text-xs ${muted}`}>Aucun module trouvé.</p>
      )}
      <ul className="space-y-1 max-h-40 overflow-y-auto">
        {results.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => attach(m)}
              disabled={busy}
              className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition ${
                theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"
              } disabled:opacity-50`}
            >
              <span className="font-medium">{m.title}</span>
              {m.formations?.length > 0 && (
                <span className={`ml-2 text-xs ${muted}`}>({m.formations.length} formation{m.formations.length > 1 ? "s" : ""})</span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <ErrMsg msg={err} />
      <div className="flex justify-end">
        <button type="button" onClick={onCancel} disabled={busy}
          className={`text-xs px-3 py-1.5 rounded-lg border ${theme === "dark" ? "border-border-2 hover:bg-border" : "border-gray-300 hover:bg-gray-100"}`}>
          Annuler
        </button>
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function FormationContentEditor({ apiBase, formationId, theme }) {
  const muted = theme === "dark" ? "text-white/60" : "text-gray-500";
  const input = `w-full rounded-lg border px-2 py-1.5 text-sm outline-none transition ${
    theme === "dark"
      ? "bg-surface-deep border-border-2 text-white focus:border-white/40"
      : "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
  }`;

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [attachingModule, setAttachingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [addErr, setAddErr] = useState("");

  const loadModules = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await apiFetch(`${apiBase}/formations/${formationId}/modules/`);
      const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      setModules(list);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase, formationId]);

  useEffect(() => {
    if (formationId) loadModules();
  }, [formationId, loadModules]);

  const addModule = async () => {
    if (!newModuleTitle.trim()) { setAddErr("Le titre est requis."); return; }
    setBusy(true);
    setAddErr("");
    try {
      const created = await apiFetch(`${apiBase}/formations/${formationId}/modules/`, {
        method: "POST",
        body: { title: newModuleTitle.trim(), order: modules.length },
      });
      setModules((prev) => [...prev, created]);
      setNewModuleTitle("");
      setAddingModule(false);
    } catch (e) {
      setAddErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2 mt-2">
      {loading && (
        <div className={`flex items-center gap-2 text-sm ${muted}`}>
          <Spinner /> Chargement des modules…
        </div>
      )}
      {err && <p className="text-sm text-red-500">{err}</p>}

      {!loading && modules.length === 0 && !err && (
        <p className={`text-sm ${muted}`}>Aucun module. Ajoutez-en un ci-dessous.</p>
      )}

      {modules.map((m) => (
        <ModuleBlock
          key={m.id}
          apiBase={apiBase}
          module={m}
          theme={theme}
          onUpdated={(updated) => setModules((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))}
          onDeleted={(id) => setModules((prev) => prev.filter((x) => x.id !== id))}
        />
      ))}

      {/* Rattacher un module existant */}
      {attachingModule && (
        <AttachModulePanel
          apiBase={apiBase}
          formationId={formationId}
          linkedModuleIds={modules.map((m) => m.id)}
          theme={theme}
          onAttached={(m) => {
            setModules((prev) => [...prev, { ...m, order: prev.length }]);
            setAttachingModule(false);
          }}
          onCancel={() => setAttachingModule(false)}
        />
      )}

      {/* Ajouter un nouveau module */}
      {addingModule ? (
        <div className={`rounded-xl border p-3 space-y-2 ${theme === "dark" ? "bg-surface border-border" : "bg-gray-50 border-gray-200"}`}>
          <input
            className={input}
            placeholder="Titre du module *"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            autoFocus
          />
          <ErrMsg msg={addErr} />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setAddingModule(false); setAddErr(""); }} disabled={busy}
              className={`text-sm px-3 py-1.5 rounded-lg border ${theme === "dark" ? "border-border-2 hover:bg-border" : "border-gray-300 hover:bg-gray-100"}`}>
              Annuler
            </button>
            <button type="button" onClick={addModule} disabled={busy}
              className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
              {busy ? <Spinner /> : null}Ajouter
            </button>
          </div>
        </div>
      ) : !attachingModule && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAddingModule(true)}
            className="flex-1 rounded-xl border border-dashed py-2.5 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition text-indigo-600 dark:text-indigo-400"
          >
            + Nouveau module
          </button>
          <button
            type="button"
            onClick={() => setAttachingModule(true)}
            className={`flex-1 rounded-xl border border-dashed py-2.5 text-sm transition ${
              theme === "dark"
                ? "text-white/50 hover:bg-white/5 border-border-2"
                : "text-gray-500 hover:bg-gray-50 border-gray-300"
            }`}
          >
            ⊕ Rattacher un module existant
          </button>
        </div>
      )}
    </div>
  );
}
