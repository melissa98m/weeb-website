import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { API_BASE, ensureCsrf } from "../../lib/api";
import AdminAccessFooter from "../../components/admin/AdminAccessFooter";
import { QCMEditor } from "../../components/admin/FormationContentEditor";
import RichTextEditor from "../../components/admin/RichTextEditor";

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
  if (!r.ok) {
    const msg = data?.detail || data?.title?.[0] || `HTTP ${r.status}`;
    throw new Error(String(msg));
  }
  return data;
}

function Spinner() {
  return <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />;
}

function ErrMsg({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

// ── Onglet Modules ────────────────────────────────────────────────────────────

function AttachCoursModal({ apiBase, moduleId, allCours, attached, theme, onAttached, onClose }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const attachedIds = new Set(attached.map((c) => c.id));

  const filtered = allCours.filter(
    (c) => !attachedIds.has(c.id) && c.title.toLowerCase().includes(q.toLowerCase())
  );

  const attach = async (cours) => {
    setBusy(true);
    setErr("");
    try {
      await apiFetch(`${apiBase}/modules/${moduleId}/courses/${cours.id}/link/`, { method: "POST" });
      onAttached(cours);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const overlay = theme === "dark" ? "bg-black/60" : "bg-black/40";
  const panel = theme === "dark" ? "bg-[#1c1c1c] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200";
  const inputCls = theme === "dark"
    ? "bg-[#111] border-[#444] text-white placeholder-white/40"
    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400";
  const rowHover = theme === "dark" ? "hover:bg-[#2a2a2a]" : "hover:bg-gray-50";
  const muted = theme === "dark" ? "text-white/50" : "text-gray-400";

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlay}`} onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-2xl border p-4 space-y-3 shadow-2xl ${panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Rattacher un cours existant</h3>
          <button type="button" onClick={onClose} className={`text-sm px-2 py-1 rounded ${theme === "dark" ? "hover:bg-[#333]" : "hover:bg-gray-100"}`}>✕</button>
        </div>
        <input
          autoFocus
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`}
          placeholder="Rechercher par titre…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="max-h-60 overflow-y-auto space-y-0.5">
          {filtered.length === 0 && (
            <p className={`text-sm py-4 text-center ${muted}`}>Aucun cours disponible à rattacher.</p>
          )}
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={busy}
              onClick={() => attach(c)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${rowHover} disabled:opacity-50`}
            >
              <span className="font-medium">{c.title}</span>
              {c.modules.length > 0 && (
                <span className={`ml-2 text-xs ${muted}`}>
                  ({c.modules.map((m) => m.title).join(", ")})
                </span>
              )}
            </button>
          ))}
        </div>
        <ErrMsg msg={err} />
      </div>
    </div>
  );
}

function ModuleAccordion({ apiBase, module: initialModule, allCours, theme, onUpdated, onDeleted }) {
  const muted = theme === "dark" ? "text-white/50" : "text-gray-400";
  const block = theme === "dark" ? "bg-[#1c1c1c] border-[#333]" : "bg-white border-gray-200";
  const inputCls = theme === "dark"
    ? "bg-[#111] border-[#444] text-white"
    : "bg-white border-gray-300 text-gray-900";
  const inputBase = `w-full rounded-lg border px-2 py-1.5 text-sm outline-none transition focus:ring-1 ${inputCls}`;

  const [module, setModule] = useState(initialModule);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);
  const [showQCM, setShowQCM] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [addingCours, setAddingCours] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newVideo, setNewVideo] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [addErr, setAddErr] = useState("");

  const saveTitle = async () => {
    if (!editTitle.trim()) { setErr("Titre requis."); return; }
    setBusy(true); setErr("");
    try {
      const updated = await apiFetch(`${apiBase}/modules/${module.id}/`, { method: "PATCH", body: { title: editTitle.trim() } });
      const next = { ...module, title: updated.title };
      setModule(next);
      onUpdated(next);
      setEditing(false);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const deleteModule = async () => {
    if (!window.confirm(`Supprimer le module "${module.title}" et tout son contenu ?`)) return;
    setBusy(true);
    try {
      await apiFetch(`${apiBase}/modules/${module.id}/`, { method: "DELETE" });
      onDeleted(module.id);
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  };

  const detachCours = async (coursId) => {
    setBusy(true);
    try {
      await apiFetch(`${apiBase}/modules/${module.id}/courses/${coursId}/link/`, { method: "DELETE" });
      setModule((prev) => ({ ...prev, cours: prev.cours.filter((c) => c.id !== coursId), total_cours: prev.total_cours - 1 }));
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  };

  const createCours = async () => {
    if (!newTitle.trim()) { setAddErr("Titre requis."); return; }
    setBusy(true); setAddErr("");
    try {
      const created = await apiFetch(`${apiBase}/modules/${module.id}/courses/`, {
        method: "POST",
        body: { title: newTitle.trim(), content: newContent, video_url: newVideo },
      });
      setModule((prev) => ({
        ...prev,
        cours: [...prev.cours, { id: created.id, title: created.title, order: prev.cours.length, video_url: created.video_url }],
        total_cours: prev.total_cours + 1,
      }));
      setNewTitle(""); setNewContent(""); setNewVideo(""); setAddingCours(false);
    } catch (e) { setAddErr(e.message); }
    finally { setBusy(false); }
  };

  const handleAttached = (cours) => {
    setModule((prev) => ({
      ...prev,
      cours: [...prev.cours, { id: cours.id, title: cours.title, order: prev.cours.length, video_url: cours.video_url || "" }],
      total_cours: prev.total_cours + 1,
    }));
  };

  const btnSm = (variant) => {
    const base = "text-xs px-2 py-0.5 rounded border transition disabled:opacity-50";
    if (variant === "ghost") return `${base} ${theme === "dark" ? "border-[#444] hover:bg-[#333]" : "border-gray-200 hover:bg-gray-100"}`;
    if (variant === "danger") return `${base} ${theme === "dark" ? "border-red-800 text-red-400 hover:bg-red-900/20" : "border-red-200 text-red-600 hover:bg-red-50"}`;
    if (variant === "primary") return `${base} bg-indigo-600 text-white border-transparent hover:bg-indigo-700`;
    return base;
  };

  return (
    <>
      {showAttach && (
        <AttachCoursModal
          apiBase={apiBase}
          moduleId={module.id}
          allCours={allCours}
          attached={module.cours}
          theme={theme}
          onAttached={handleAttached}
          onClose={() => setShowAttach(false)}
        />
      )}

      <div className={`rounded-xl border ${block}`}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 min-h-[44px]">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`text-sm shrink-0 w-5 ${muted}`}
            aria-expanded={open}
            aria-label={open ? "Réduire" : "Ouvrir"}
          >
            {open ? "▾" : "▸"}
          </button>

          {editing ? (
            <>
              <input
                className={`${inputBase} flex-1`}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setEditing(false); setEditTitle(module.title); } }}
                autoFocus
              />
              <button type="button" onClick={saveTitle} disabled={busy} className={btnSm("primary")}>
                {busy ? <Spinner /> : "OK"}
              </button>
              <button type="button" onClick={() => { setEditing(false); setEditTitle(module.title); setErr(""); }} className={btnSm("ghost")}>✕</button>
            </>
          ) : (
            <>
              <span className="text-sm font-medium flex-1 truncate">{module.title}</span>
              <span className={`text-xs ${muted} shrink-0`}>{module.total_cours} cours</span>
              {module.has_qcm && <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 shrink-0">QCM</span>}
              {module.formations.length > 0 && (
                <span className={`hidden sm:inline text-xs ${muted} shrink-0 truncate max-w-[120px]`} title={module.formations.map((f) => f.name).join(", ")}>
                  {module.formations.map((f) => f.name).join(", ")}
                </span>
              )}
              <button type="button" onClick={() => setEditing(true)} disabled={busy} className={btnSm("ghost")}>Éditer</button>
              <button type="button" onClick={deleteModule} disabled={busy} className={btnSm("danger")}>✕</button>
            </>
          )}
        </div>
        <ErrMsg msg={err} />

        {/* Body */}
        {open && (
          <div className={`border-t px-3 py-2 space-y-1 ${theme === "dark" ? "border-[#2a2a2a]" : "border-gray-100"}`}>

            {/* Liste cours */}
            {module.cours.length === 0 && !addingCours && (
              <p className={`text-xs ${muted} py-1`}>Aucun cours rattaché à ce module.</p>
            )}
            {module.cours.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2 py-0.5">
                <span className={`text-xs w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${muted} border-current`}>{i + 1}</span>
                <span className="text-sm flex-1 truncate">{c.title}</span>
                {c.video_url && <span className={`text-xs ${muted}`} title="Vidéo">▶</span>}
                <button type="button" onClick={() => detachCours(c.id)} disabled={busy} className={btnSm("danger")} title="Détacher">
                  Détacher
                </button>
              </div>
            ))}

            {/* Créer un cours */}
            {addingCours ? (
              <div className={`rounded-lg border p-2.5 space-y-2 mt-1 ${theme === "dark" ? "border-[#444] bg-[#111]" : "border-gray-200 bg-gray-50"}`}>
                <input className={inputBase} placeholder="Titre du cours *" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus />
                <RichTextEditor value={newContent} onChange={setNewContent} theme={theme} uploadEndpoint={`${apiBase}/upload/image/`} />
                <input className={inputBase} placeholder="URL vidéo (optionnel)" value={newVideo} onChange={(e) => setNewVideo(e.target.value)} />
                <ErrMsg msg={addErr} />
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => { setAddingCours(false); setAddErr(""); }} disabled={busy} className={btnSm("ghost")}>Annuler</button>
                  <button type="button" onClick={createCours} disabled={busy} className="flex items-center gap-1 text-xs px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                    {busy ? <Spinner /> : null}Créer et rattacher
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 mt-1 pt-1">
                <button type="button" onClick={() => setAddingCours(true)} className={`text-xs ${muted} hover:underline`}>+ créer un cours</button>
                <button type="button" onClick={() => setShowAttach(true)} className={`text-xs ${muted} hover:underline`}>+ rattacher un cours existant</button>
              </div>
            )}

            {/* QCM */}
            <div className={`border-t mt-2 pt-2 ${theme === "dark" ? "border-[#2a2a2a]" : "border-gray-100"}`}>
              {showQCM ? (
                <QCMEditor
                  apiBase={apiBase}
                  moduleId={module.id}
                  theme={theme}
                  onClose={(action) => {
                    setShowQCM(false);
                    if (action === "saved") setModule((prev) => ({ ...prev, has_qcm: true }));
                    if (action === "deleted") setModule((prev) => ({ ...prev, has_qcm: false }));
                  }}
                />
              ) : (
                <button type="button" onClick={() => setShowQCM(true)} className={`text-xs ${muted} hover:underline`}>
                  {module.has_qcm ? "✎ Modifier le QCM" : "+ ajouter un QCM"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ModulesTab({ apiBase, modules, allCours, theme, onModuleCreated, onModuleUpdated, onModuleDeleted }) {
  const muted = theme === "dark" ? "text-white/50" : "text-gray-400";
  const inputCls = theme === "dark" ? "bg-[#111] border-[#444] text-white" : "bg-white border-gray-300 text-gray-900";
  const inputBase = `w-full rounded-lg border px-2 py-1.5 text-sm outline-none transition ${inputCls}`;

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [addErr, setAddErr] = useState("");
  const [q, setQ] = useState("");

  const filtered = modules.filter((m) => m.title.toLowerCase().includes(q.toLowerCase()));

  const createModule = async () => {
    if (!newTitle.trim()) { setAddErr("Titre requis."); return; }
    setBusy(true); setAddErr("");
    try {
      const created = await apiFetch(`${apiBase}/admin/modules/`, { method: "POST", body: { title: newTitle.trim() } });
      onModuleCreated(created);
      setNewTitle(""); setAdding(false);
    } catch (e) { setAddErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-2">
      {/* Barre de recherche + bouton créer */}
      <div className="flex gap-2 items-center">
        <input
          className={`flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none ${inputCls}`}
          placeholder="Rechercher un module…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="shrink-0 text-sm px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          + Module
        </button>
      </div>

      {/* Formulaire création */}
      {adding && (
        <div className={`rounded-xl border p-3 space-y-2 ${theme === "dark" ? "bg-[#1c1c1c] border-[#333]" : "bg-gray-50 border-gray-200"}`}>
          <input
            autoFocus
            className={inputBase}
            placeholder="Titre du module *"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") createModule(); if (e.key === "Escape") { setAdding(false); setNewTitle(""); } }}
          />
          <ErrMsg msg={addErr} />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setAdding(false); setNewTitle(""); setAddErr(""); }} className={`text-sm px-3 py-1.5 rounded-lg border ${theme === "dark" ? "border-[#444] hover:bg-[#333]" : "border-gray-300 hover:bg-gray-100"}`}>Annuler</button>
            <button type="button" onClick={createModule} disabled={busy} className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
              {busy ? <Spinner /> : null}Créer
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {filtered.length === 0 && !adding && (
        <p className={`text-sm ${muted} py-4 text-center`}>{q ? "Aucun module trouvé." : "Aucun module. Créez-en un ci-dessus."}</p>
      )}
      {filtered.map((m) => (
        <ModuleAccordion
          key={m.id}
          apiBase={apiBase}
          module={m}
          allCours={allCours}
          theme={theme}
          onUpdated={onModuleUpdated}
          onDeleted={onModuleDeleted}
        />
      ))}
    </div>
  );
}

// ── Onglet Cours ──────────────────────────────────────────────────────────────

function CoursRow({ apiBase, cours: initialCours, theme, onUpdated, onDeleted }) {
  const muted = theme === "dark" ? "text-white/50" : "text-gray-400";
  const inputCls = theme === "dark" ? "bg-[#111] border-[#444] text-white" : "bg-white border-gray-300 text-gray-900";
  const inputBase = `w-full rounded-lg border px-2 py-1.5 text-sm outline-none transition ${inputCls}`;
  const block = theme === "dark" ? "bg-[#1c1c1c] border-[#333]" : "bg-white border-gray-200";

  const [cours, setCours] = useState(initialCours);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(cours.title);
  const [content, setContent] = useState(cours.content || "");
  const [videoUrl, setVideoUrl] = useState(cours.video_url || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    if (!title.trim()) { setErr("Titre requis."); return; }
    setBusy(true); setErr("");
    try {
      const updated = await apiFetch(`${apiBase}/courses/${cours.id}/`, { method: "PATCH", body: { title: title.trim(), content, video_url: videoUrl } });
      const next = { ...cours, title: updated.title, content: updated.content, video_url: updated.video_url };
      setCours(next);
      onUpdated(next);
      setEditing(false);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!window.confirm(`Supprimer le cours "${cours.title}" ?`)) return;
    setBusy(true);
    try {
      await apiFetch(`${apiBase}/courses/${cours.id}/`, { method: "DELETE" });
      onDeleted(cours.id);
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  };

  const btnSm = (variant) => {
    const base = "text-xs px-2 py-0.5 rounded border transition disabled:opacity-50";
    if (variant === "ghost") return `${base} ${theme === "dark" ? "border-[#444] hover:bg-[#333]" : "border-gray-200 hover:bg-gray-100"}`;
    if (variant === "danger") return `${base} ${theme === "dark" ? "border-red-800 text-red-400 hover:bg-red-900/20" : "border-red-200 text-red-600 hover:bg-red-50"}`;
    return base;
  };

  if (editing) {
    return (
      <div className={`rounded-xl border p-3 space-y-2 ${block}`}>
        <input className={inputBase} placeholder="Titre *" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        <RichTextEditor value={content} onChange={setContent} theme={theme} uploadEndpoint={`${apiBase}/upload/image/`} />
        <input className={inputBase} placeholder="URL vidéo (optionnel)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
        <ErrMsg msg={err} />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => { setEditing(false); setErr(""); setTitle(cours.title); setContent(cours.content || ""); setVideoUrl(cours.video_url || ""); }} disabled={busy} className={btnSm("ghost")}>Annuler</button>
          <button type="button" onClick={save} disabled={busy} className="flex items-center gap-1 text-xs px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
            {busy ? <Spinner /> : null}Sauvegarder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border px-3 py-2.5 flex items-start gap-3 min-h-[44px] ${block}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{cours.title}</p>
        {cours.modules.length > 0 ? (
          <p className={`text-xs mt-0.5 truncate ${muted}`}>
            Modules : {cours.modules.map((m) => m.title).join(", ")}
          </p>
        ) : (
          <p className={`text-xs mt-0.5 ${muted}`}>Non rattaché à un module</p>
        )}
      </div>
      {cours.video_url && <span className={`text-xs shrink-0 mt-1 ${muted}`} title="Vidéo">▶</span>}
      <div className="flex gap-1.5 shrink-0 mt-0.5">
        <button type="button" onClick={() => setEditing(true)} disabled={busy} className={btnSm("ghost")}>Éditer</button>
        <button type="button" onClick={remove} disabled={busy} className={btnSm("danger")}>✕</button>
      </div>
    </div>
  );
}

function CoursTab({ apiBase, cours, theme, onCoursCreated, onCoursUpdated, onCoursDeleted }) {
  const muted = theme === "dark" ? "text-white/50" : "text-gray-400";
  const inputCls = theme === "dark" ? "bg-[#111] border-[#444] text-white" : "bg-white border-gray-300 text-gray-900";
  const inputBase = `w-full rounded-lg border px-2 py-1.5 text-sm outline-none transition ${inputCls}`;

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newVideo, setNewVideo] = useState("");
  const [busy, setBusy] = useState(false);
  const [addErr, setAddErr] = useState("");
  const [q, setQ] = useState("");

  const filtered = cours.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));

  const createCours = async () => {
    if (!newTitle.trim()) { setAddErr("Titre requis."); return; }
    setBusy(true); setAddErr("");
    try {
      const created = await apiFetch(`${apiBase}/admin/courses/`, {
        method: "POST",
        body: { title: newTitle.trim(), content: newContent, video_url: newVideo },
      });
      onCoursCreated(created);
      setNewTitle(""); setNewContent(""); setNewVideo(""); setAdding(false);
    } catch (e) { setAddErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input
          className={`flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none ${inputCls}`}
          placeholder="Rechercher un cours…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="button" onClick={() => setAdding(true)} className="shrink-0 text-sm px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
          + Cours
        </button>
      </div>

      {adding && (
        <div className={`rounded-xl border p-3 space-y-2 ${theme === "dark" ? "bg-[#1c1c1c] border-[#333]" : "bg-gray-50 border-gray-200"}`}>
          <input autoFocus className={inputBase} placeholder="Titre du cours *" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") createCours(); if (e.key === "Escape") setAdding(false); }} />
          <RichTextEditor value={newContent} onChange={setNewContent} theme={theme} uploadEndpoint={`${apiBase}/upload/image/`} />
          <input className={inputBase} placeholder="URL vidéo (optionnel)" value={newVideo} onChange={(e) => setNewVideo(e.target.value)} />
          <ErrMsg msg={addErr} />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setAdding(false); setAddErr(""); }} className={`text-sm px-3 py-1.5 rounded-lg border ${theme === "dark" ? "border-[#444] hover:bg-[#333]" : "border-gray-300 hover:bg-gray-100"}`}>Annuler</button>
            <button type="button" onClick={createCours} disabled={busy} className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
              {busy ? <Spinner /> : null}Créer
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 && !adding && (
        <p className={`text-sm ${muted} py-4 text-center`}>{q ? "Aucun cours trouvé." : "Aucun cours. Créez-en un ci-dessus."}</p>
      )}
      {filtered.map((c) => (
        <CoursRow
          key={c.id}
          apiBase={apiBase}
          cours={c}
          theme={theme}
          onUpdated={onCoursUpdated}
          onDeleted={onCoursDeleted}
        />
      ))}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function ContenuManager() {
  const { theme } = useTheme();
  const apiBase = API_BASE;

  useEffect(() => {
    const prev = document.title;
    document.title = "Contenu — Admin | Weeb";
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute("content", "noindex, nofollow");
    return () => {
      document.title = prev;
      if (metaRobots) metaRobots.setAttribute("content", "index, follow");
    };
  }, []);

  const [tab, setTab] = useState("modules"); // "modules" | "cours"
  const [modules, setModules] = useState([]);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const ctrlRef = useRef(null);

  const bg = theme === "dark" ? "bg-background text-white" : "bg-light text-dark";
  const card = theme === "dark" ? "bg-[#1c1c1c] border-[#2a2a2a]" : "bg-white border-gray-200";
  const muted = theme === "dark" ? "text-white/50" : "text-gray-400";

  const load = useCallback(async () => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setLoading(true); setErr("");
    try {
      const [mods, crs] = await Promise.all([
        apiFetch(`${apiBase}/admin/modules/`),
        apiFetch(`${apiBase}/admin/courses/`),
      ]);
      setModules(Array.isArray(mods) ? mods : []);
      setCours(Array.isArray(crs) ? crs : []);
    } catch (e) {
      if (e.name !== "AbortError") setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    load();
    return () => ctrlRef.current?.abort();
  }, [load]);

  const tabBtn = (key, label) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
        tab === key
          ? "border-indigo-500 text-indigo-500"
          : `border-transparent ${theme === "dark" ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-800"}`
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`min-h-screen px-4 py-8 ${bg}`}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Contenu pédagogique</h1>
          <p className={`text-sm mt-1 ${muted}`}>Gérer les modules, les cours et les QCM.</p>
        </div>

        {/* Card principale */}
        <div className={`rounded-2xl border ${card} overflow-hidden`}>
          {/* Onglets */}
          <div className={`px-4 flex gap-0 border-b ${theme === "dark" ? "border-[#2a2a2a]" : "border-gray-200"}`}>
            {tabBtn("modules", `Modules (${modules.length})`)}
            {tabBtn("cours", `Cours (${cours.length})`)}
          </div>

          {/* Corps */}
          <div className="p-4">
            {loading && (
              <div className={`flex items-center gap-2 text-sm ${muted} py-6 justify-center`}>
                <Spinner /> Chargement…
              </div>
            )}
            {!loading && err && (
              <div className="text-sm text-red-500 py-4 text-center">{err}</div>
            )}
            {!loading && !err && tab === "modules" && (
              <ModulesTab
                apiBase={apiBase}
                modules={modules}
                allCours={cours}
                theme={theme}
                onModuleCreated={(m) => setModules((prev) => [...prev, m])}
                onModuleUpdated={(m) => setModules((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...m } : x)))}
                onModuleDeleted={(id) => setModules((prev) => prev.filter((x) => x.id !== id))}
              />
            )}
            {!loading && !err && tab === "cours" && (
              <CoursTab
                apiBase={apiBase}
                cours={cours}
                theme={theme}
                onCoursCreated={(c) => setCours((prev) => [...prev, c])}
                onCoursUpdated={(c) => setCours((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...c } : x)))}
                onCoursDeleted={(id) => setCours((prev) => prev.filter((x) => x.id !== id))}
              />
            )}
          </div>
        </div>

        <AdminAccessFooter />
      </div>
    </div>
  );
}
