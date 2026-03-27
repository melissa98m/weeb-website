import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { ensureCsrf } from "../../lib/api";
import RichTextEditor from "./RichTextEditor";

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

/**
 * Modal de création / édition d'un cours.
 *
 * Props :
 *   open           — boolean, affiche ou masque la modale
 *   onClose        — () => void
 *   cours          — null  → création  |  objet cours → édition
 *   createEndpoint — URL POST pour la création (ex: `${apiBase}/admin/courses/`)
 *   apiBase        — base de l'API (utilisé pour l'upload d'images et l'édition)
 *   onSaved        — (created|updated) => void
 */
export default function CoursEditorModal({
  open = false,
  onClose = () => {},
  cours = null,
  createEndpoint = "",
  apiBase = "",
  onSaved = () => {},
}) {
  const { theme } = useTheme();

  const isEdit = cours !== null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Sync fields when cours prop changes or modal opens
  useEffect(() => {
    if (open) {
      setTitle(cours?.title ?? "");
      setContent(cours?.content ?? "");
      setVideoUrl(cours?.video_url ?? "");
      setErr("");
    }
  }, [open, cours]);

  // Fermer sur Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async () => {
    if (!title.trim()) { setErr("Le titre est requis."); return; }
    setBusy(true);
    setErr("");
    try {
      const body = { title: title.trim(), content, video_url: videoUrl };
      const result = isEdit
        ? await apiFetch(`${apiBase}/courses/${cours.id}/`, { method: "PATCH", body })
        : await apiFetch(createEndpoint, { method: "POST", body });
      onSaved(result);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  /* ── Styles ── */
  const overlay = theme === "dark" ? "bg-black/70" : "bg-black/50";
  const panel = theme === "dark"
    ? "bg-surface text-white border-border"
    : "bg-white text-gray-900 border-gray-200";
  const inputCls = theme === "dark"
    ? "bg-surface-deep border-border-2 text-white placeholder-white/40 focus:ring-indigo-500/50"
    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-indigo-400/40";
  const ghostBtn = theme === "dark"
    ? "border-border-2 text-white hover:bg-surface-3"
    : "border-gray-300 text-gray-700 hover:bg-gray-100";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto ${overlay}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Éditer le cours" : "Créer un cours"}
    >
      <div
        className={`w-full rounded-2xl border shadow-2xl ${panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-current/10">
          <h2 className="text-base font-semibold">
            {isEdit ? `Éditer : ${cours.title}` : "Créer un cours"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-2 py-1 text-sm border transition ${ghostBtn}`}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Titre */}
          <div>
            <label
              htmlFor="cours-title"
              className="block text-sm font-medium mb-1 opacity-80"
            >
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              id="cours-title"
              autoFocus
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-2 ${inputCls}`}
              placeholder="Titre du cours"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">
              Contenu
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              theme={theme}
              uploadEndpoint={`${apiBase}/upload/image/`}
            />
          </div>

          {/* URL Vidéo */}
          <div>
            <label
              htmlFor="cours-video"
              className="block text-sm font-medium mb-1 opacity-80"
            >
              URL vidéo <span className="opacity-50 font-normal">(optionnel)</span>
            </label>
            <input
              id="cours-video"
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-2 ${inputCls}`}
              placeholder="https://..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          {/* Erreur */}
          {err && (
            <p className="text-sm text-red-500" role="alert">{err}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-current/10">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={`rounded-xl border px-4 py-2 text-sm transition disabled:opacity-50 ${ghostBtn}`}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {busy && (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isEdit ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
