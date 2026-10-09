import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { API_BASE, ensureCsrf } from "../../lib/api";
import AdminAccessFooter from "../../components/admin/AdminAccessFooter";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import Pagination from "../../components/ui/Pagination";
import PageSizer from "../../components/ui/PageSizer";
import { QCMEditor } from "../../components/admin/FormationContentEditor";
import CoursEditorModal from "../../components/admin/CoursEditorModal";
import adminEn from "../../../locales/en/admin.json";
import adminFr from "../../../locales/fr/admin.json";

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

// ── Modules tab ───────────────────────────────────────────────────────────────

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
  const panel = theme === "dark" ? "bg-surface text-white border-border" : "bg-white text-gray-900 border-gray-200";
  const inputCls = theme === "dark"
    ? "bg-surface-deep border-border-2 text-white placeholder-white/40"
    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400";
  const rowHover = theme === "dark" ? "hover:bg-surface-3" : "hover:bg-gray-50";
  const muted = theme === "dark" ? "text-white/70" : "text-gray-400";

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlay}`} onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-2xl border p-4 space-y-3 shadow-2xl ${panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Rattacher un cours existant</h3>
          <button type="button" onClick={onClose} className={`text-sm px-2 py-1 rounded ${theme === "dark" ? "hover:bg-border" : "hover:bg-gray-100"}`}>✕</button>
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

function ModuleAccordion({ apiBase, module: initialModule, allCours, theme, t, onUpdated, onDeleted }) {
  const muted = theme === "dark" ? "text-white/70" : "text-gray-400";
  const block = theme === "dark" ? "bg-surface border-border" : "bg-white border-gray-200";
  const inputCls = theme === "dark"
    ? "bg-surface-deep border-border-2 text-white"
    : "bg-white border-gray-300 text-gray-900";
  const inputBase = `w-full rounded-lg border px-2 py-1.5 text-sm outline-none transition focus:ring-1 ${inputCls}`;

  const [module, setModule] = useState(initialModule);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);
  const [showQCM, setShowQCM] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [coursModalOpen, setCoursModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

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
    if (!window.confirm(t.content_confirm_delete_module.replace("{title}", module.title))) return;
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

  const handleCoursCreated = (created) => {
    setModule((prev) => ({
      ...prev,
      cours: [...prev.cours, { id: created.id, title: created.title, order: prev.cours.length, video_url: created.video_url }],
      total_cours: prev.total_cours + 1,
    }));
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
    if (variant === "ghost") return `${base} ${theme === "dark" ? "border-border-2 hover:bg-border" : "border-gray-200 hover:bg-gray-100"}`;
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
      <CoursEditorModal
        open={coursModalOpen}
        onClose={() => setCoursModalOpen(false)}
        cours={null}
        createEndpoint={`${apiBase}/modules/${module.id}/courses/`}
        apiBase={apiBase}
        onSaved={handleCoursCreated}
      />

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
              {module.has_qcm && <span className="text-xs px-1.5 py-0.5 rounded bg-primary/15 text-primary shrink-0">QCM</span>}
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
          <div className={`border-t px-3 py-2 space-y-1 ${theme === "dark" ? "border-surface-3" : "border-gray-100"}`}>

            {/* Liste cours */}
            {module.cours.length === 0 && (
              <p className={`text-xs ${muted} py-1`}>Aucun cours rattaché à ce module.</p>
            )}
            {module.cours.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2 py-0.5">
                <span className={`text-xs w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${muted} border-current`}>{i + 1}</span>
                <span className="text-sm flex-1 truncate">{c.title}</span>
                {c.video_url && <span className={`text-xs ${muted}`} title="Vidéo">▶</span>}
                <button type="button" onClick={() => detachCours(c.id)} disabled={busy} className={btnSm("danger")} title={t.content_btn_detach}>
                  {t.content_btn_detach}
                </button>
              </div>
            ))}

            {/* Create a new course */}
            <div className="flex gap-3 mt-1 pt-1">
              <button type="button" onClick={() => setCoursModalOpen(true)} className={`text-xs ${muted} hover:underline`}>{t.content_btn_add_course}</button>
              <button type="button" onClick={() => setShowAttach(true)} className={`text-xs ${muted} hover:underline`}>+ rattacher un cours existant</button>
            </div>

            {/* QCM */}
            <div className={`border-t mt-2 pt-2 ${theme === "dark" ? "border-surface-3" : "border-gray-100"}`}>
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
                  {module.has_qcm ? t.content_btn_edit_qcm : t.content_btn_add_qcm}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ModulesTab({ apiBase, modules, allCours, theme, t, onModuleCreated, onModuleUpdated, onModuleDeleted }) {
  const muted = theme === "dark" ? "text-white/70" : "text-gray-400";
  const inputCls = theme === "dark" ? "bg-surface-deep border-border-2 text-white" : "bg-white border-gray-300 text-gray-900";
  const inputBase = `w-full rounded-lg border px-2 py-1.5 text-sm outline-none transition ${inputCls}`;

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [addErr, setAddErr] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = modules.filter((m) => m.title.toLowerCase().includes(q.toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );
  useEffect(() => { setPage(1); }, [q, pageSize]);

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
      {/* Search bar + create button */}
      <div className="flex gap-2 items-center">
        <input
          className={`flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none ${inputCls}`}
          placeholder="Rechercher un module…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <PageSizer pageSize={pageSize} onChange={(n) => { setPageSize(n); setPage(1); }} />
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="shrink-0 text-sm px-4 py-1.5 rounded-lg bg-secondary text-white hover:brightness-110 transition"
        >
          + Module
        </button>
      </div>

      {/* Create form */}
      {adding && (
        <div className={`rounded-xl border p-3 space-y-2 ${theme === "dark" ? "bg-surface border-border" : "bg-gray-50 border-gray-200"}`}>
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
            <button type="button" onClick={() => { setAdding(false); setNewTitle(""); setAddErr(""); }} className={`text-sm px-3 py-1.5 rounded-lg border ${theme === "dark" ? "border-border-2 hover:bg-border" : "border-gray-300 hover:bg-gray-100"}`}>{t.common_cancel}</button>
            <button type="button" onClick={createModule} disabled={busy} className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg bg-secondary text-white hover:brightness-110 disabled:opacity-50">
              {busy ? <Spinner /> : null}{t.common_create}
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {filtered.length === 0 && !adding && (
        <p className={`text-sm ${muted} py-4 text-center`}>{q ? "Aucun module trouvé." : "Aucun module. Créez-en un ci-dessus."}</p>
      )}
      {paged.map((m) => (
        <ModuleAccordion
          key={m.id}
          apiBase={apiBase}
          module={m}
          allCours={allCours}
          theme={theme}
          t={t}
          onUpdated={onModuleUpdated}
          onDeleted={onModuleDeleted}
        />
      ))}
      <div className="mt-2">
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} theme={theme} />
      </div>
    </div>
  );
}

// ── Onglet Cours ──────────────────────────────────────────────────────────────

function CoursRow({ apiBase, cours, theme, t, onEdit, onUpdated: _onUpdated, onDeleted }) {
  const muted = theme === "dark" ? "text-white/70" : "text-gray-400";
  const block = theme === "dark" ? "bg-surface border-border" : "bg-white border-gray-200";

  const [busy, setBusy] = useState(false);

  const remove = async () => {
    if (!window.confirm(t.content_confirm_delete_course.replace("{title}", cours.title))) return;
    setBusy(true);
    try {
      await apiFetch(`${apiBase}/courses/${cours.id}/`, { method: "DELETE" });
      onDeleted(cours.id);
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  };

  const btnSm = (variant) => {
    const base = "text-xs px-2 py-0.5 rounded border transition disabled:opacity-50";
    if (variant === "ghost") return `${base} ${theme === "dark" ? "border-border-2 hover:bg-border" : "border-gray-200 hover:bg-gray-100"}`;
    if (variant === "danger") return `${base} ${theme === "dark" ? "border-red-800 text-red-400 hover:bg-red-900/20" : "border-red-200 text-red-600 hover:bg-red-50"}`;
    return base;
  };

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
        <button type="button" onClick={() => onEdit(cours)} disabled={busy} className={btnSm("ghost")}>Éditer</button>
        <button type="button" onClick={remove} disabled={busy} className={btnSm("danger")}>✕</button>
      </div>
    </div>
  );
}

function CoursTab({ apiBase, cours, theme, t, onCoursCreated, onCoursUpdated, onCoursDeleted }) {
  const muted = theme === "dark" ? "text-white/70" : "text-gray-400";
  const inputCls = theme === "dark" ? "bg-surface-deep border-border-2 text-white" : "bg-white border-gray-300 text-gray-900";

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCours, setEditingCours] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = cours.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );
  useEffect(() => { setPage(1); }, [q, pageSize]);

  const openCreate = () => { setEditingCours(null); setModalOpen(true); };
  const openEdit = (c) => { setEditingCours(c); setModalOpen(true); };

  const handleSaved = (result) => {
    if (editingCours) onCoursUpdated(result);
    else onCoursCreated(result);
  };

  return (
    <div className="space-y-2">
      <CoursEditorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cours={editingCours}
        createEndpoint={`${apiBase}/admin/courses/`}
        apiBase={apiBase}
        onSaved={handleSaved}
      />

      <div className="flex gap-2 items-center">
        <input
          className={`flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none ${inputCls}`}
          placeholder="Rechercher un cours…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <PageSizer pageSize={pageSize} onChange={(n) => { setPageSize(n); setPage(1); }} />
        <button type="button" onClick={openCreate} className="shrink-0 text-sm px-4 py-1.5 rounded-lg bg-secondary text-white hover:brightness-110 transition">
          {t.content_btn_add_course_module}
        </button>
      </div>

      {filtered.length === 0 && (
        <p className={`text-sm ${muted} py-4 text-center`}>{q ? "Aucun cours trouvé." : "Aucun cours. Créez-en un ci-dessus."}</p>
      )}
      {paged.map((c) => (
        <CoursRow
          key={c.id}
          apiBase={apiBase}
          cours={c}
          theme={theme}
          t={t}
          onEdit={openEdit}
          onUpdated={onCoursUpdated}
          onDeleted={onCoursDeleted}
        />
      ))}
      <div className="mt-2">
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} theme={theme} />
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function ContenuManager() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? adminFr : adminEn;
  const apiBase = API_BASE;

  useEffect(() => {
    const prev = document.title;
    document.title = t.page_title_content;
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

  const isDark = theme === "dark";
  const card = isDark ? "bg-surface border-surface-3" : "bg-white border-gray-200";
  const muted = isDark ? "text-white/70" : "text-gray-400";

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
          ? isDark ? "border-primary text-primary" : "border-secondary text-secondary"
          : `border-transparent ${isDark ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-gray-800"}`
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="space-y-6">

        <AdminPageHeader
          title={t.content_title}
          subtitle="Gérer les modules, les cours et les QCM."
          icon={() => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
          iconBg={isDark ? "bg-violet-500/10 text-violet-400" : "bg-violet-100 text-violet-600"}
          isDark={isDark}
        />

        {/* Card principale */}
        <div className={`rounded-2xl border ${card} overflow-hidden`}>
          {/* Onglets */}
          <div className={`px-4 flex gap-0 border-b ${theme === "dark" ? "border-surface-3" : "border-gray-200"}`}>
            {tabBtn("modules", `${t.content_tab_modules} (${modules.length})`)}
            {tabBtn("cours", `${t.content_tab_courses} (${cours.length})`)}
          </div>

          {/* Corps */}
          <div className="p-4">
            {loading && (
              <div className={`flex items-center gap-2 text-sm ${muted} py-6 justify-center`}>
                <Spinner /> {t.common_loading}
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
                t={t}
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
                t={t}
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
