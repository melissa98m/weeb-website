import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { ensureCsrf } from "../../lib/api";
import GenrePicker from "./GenrePicker"; // <- votre composant

/* --- Helpers d’URL --- */
const ARTICLE_ENDPOINTS = (apiBase) => [`${apiBase}/articles/`];
const ASSOC_CANDIDATES = (apiBase) => [
  `${apiBase}/article-genres/`,
  `${apiBase}/articles-genres/`,
  `${apiBase}/articlesgenres/`,
  `${apiBase}/articlegenre/`,
  `${apiBase}/article-genres-links/`,
];

/* --- fetch JSON robuste --- */
async function fetchJSON(url, { signal } = {}) {
  const r = await fetch(url, { credentials: "include", signal });
  const ct = r.headers.get("content-type") || "";
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  if (!ct.includes("application/json")) {
    try {
      return await r.json();
    } catch {
      const txt = await r.text();
      throw new Error(`Réponse non-JSON (ct=${ct}). ${txt.slice(0, 160)}`);
    }
  }
  return r.json();
}

async function formatApiError(r, fallbackLabel) {
  const ct = r.headers.get("content-type") || "";
  let detail = "";
  if (ct.includes("application/json")) {
    try {
      const data = await r.json();
      if (data) {
        if (typeof data === "string") detail = data;
        else if (data.detail) detail = data.detail;
        else detail = JSON.stringify(data);
      }
    } catch {}
  } else {
    try {
      detail = (await r.text()).trim();
    } catch {}
  }
  const base = `${r.status} ${r.statusText}`.trim();
  const msg = detail ? `${base} - ${detail}` : base;
  return fallbackLabel ? `${fallbackLabel} (${msg})` : msg;
}

export default function ArticleEditorModal({
  open = false,
  onClose = () => {},
  apiBase,
  userId = null,
  article = null,             // null => création ; sinon objet article
  onSaved = () => {},
  onDeleted = () => {},
}) {
  const { theme } = useTheme();

  /* ---------- UI styles ---------- */
  const card = theme === "dark"
    ? "bg-[#1c1c1c] text-white border-[#333]"
    : "bg-white text-gray-900 border-gray-200";
  const inputCls = theme === "dark"
    ? "bg-[#1c1c1c] text-white border-[#333] placeholder-white/60"
    : "bg-white text-gray-900 border-gray-200 placeholder-gray-400";
  const ghostBtn = theme === "dark"
    ? "bg-[#1c1c1c] text-white border-[#333] hover:bg-[#222]"
    : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50";
  const cta = theme === "dark"
    ? "bg-secondary text-white border-secondary hover:brightness-110"
    : "bg-primary text-dark border-primary hover:brightness-110";

  /* ---------- State formulaire ---------- */
  const isEditing = !!(article && (article.id != null || article.pk != null));
  const artId = isEditing ? (article.id ?? article.pk) : null;

  const [title, setTitle] = useState(article?.title ?? "");
  const [content, setContent] = useState(article?.article_content ?? "");
  const [imageUrl, setImageUrl] = useState(article?.link_image ?? "");

  // genres sélectionnés : [{id,name,color?}]
  const initialGenres = useMemo(() => {
    const g = Array.isArray(article?.genres) ? article.genres : [];
    return g.map((x) => (typeof x === "object" ? x : { id: x }));
  }, [article]);
  const [genres, setGenres] = useState(initialGenres);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  /* ---------- Abort controller commun ---------- */
  const ctrlRef = useRef(null);
  const startTask = useCallback((ms = 20000) => {
    try { ctrlRef.current?.abort(); } catch {}
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    const t = setTimeout(() => { try { ctrl.abort(); } catch {} }, ms);
    const isAbortError = (e) =>
      ctrl.signal.aborted ||
      e?.name === "AbortError" ||
      /aborted|AbortError|Failed to fetch|NetworkError|signal is aborted/i.test(String(e?.message || ""));
    return {
      signal: ctrl.signal,
      isAbortError,
      done: () => { clearTimeout(t); if (ctrlRef.current === ctrl) ctrlRef.current = null; },
    };
  }, []);

  useEffect(() => {
    return () => { try { ctrlRef.current?.abort(); } catch {} };
  }, []);

  /* ---------- (Ré)initialisation quand on ouvre/ferme ---------- */
  useEffect(() => {
    if (!open) return;
    setErr("");
    setTitle(article?.title ?? "");
    setContent(article?.article_content ?? "");
    setImageUrl(article?.link_image ?? "");
    const g = Array.isArray(article?.genres) ? article.genres : [];
    setGenres(g.map((x) => (typeof x === "object" ? x : { id: x })));
  }, [open, article]);

  /* ---------- CRUD Article ---------- */
  const postArticle = useCallback(async (payload, signal) => {
    const csrf = await ensureCsrf();
    let lastError = "";
    for (const base of ARTICLE_ENDPOINTS(apiBase)) {
      const r = await fetch(base, {
        method: "POST",
        credentials: "include",
        signal,
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        body: JSON.stringify(payload),
      });
      if (r.ok) return r.json();
      lastError = await formatApiError(r, `POST ${base} a échoué`);
    }
    throw new Error(lastError || "Impossible de créer l’article (endpoints indisponibles).");
  }, [apiBase]);

  const patchArticle = useCallback(async (id, payload, signal) => {
    const csrf = await ensureCsrf();
    let lastError = "";
    for (const base of ARTICLE_ENDPOINTS(apiBase)) {
      const r = await fetch(`${base}${id}/`, {
        method: "PATCH",
        credentials: "include",
        signal,
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        body: JSON.stringify(payload),
      });
      if (r.ok) return r.json();
      lastError = await formatApiError(r, `PATCH ${base}${id}/ a échoué`);
    }
    throw new Error(lastError || `Impossible de mettre à jour l’article #${id}.`);
  }, [apiBase]);

  const deleteArticle = useCallback(async (id, signal) => {
    const csrf = await ensureCsrf();
    let lastError = "";
    for (const base of ARTICLE_ENDPOINTS(apiBase)) {
      const r = await fetch(`${base}${id}/`, {
        method: "DELETE",
        credentials: "include",
        signal,
        headers: { "X-CSRFToken": csrf },
      });
      if (r.ok || r.status === 204) return true;
      lastError = await formatApiError(r, `DELETE ${base}${id}/ a échoué`);
    }
    throw new Error(lastError || `Impossible de supprimer l’article #${id}.`);
  }, [apiBase]);

  /* ---------- Synchro associations article-genre (ultra-safe) ---------- */
  const getAssocEndpointAndList = useCallback(async (articleId, signal) => {
    for (const base of ASSOC_CANDIDATES(apiBase)) {
      try {
        const data = await fetchJSON(`${base}?article=${articleId}&page_size=1000`, { signal });
        const raw = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        return { assocBase: base, rawList: raw };
      } catch {
        /* continue */
      }
    }
    // fallback: on tente de relire l’article pour récupérer ses genres
    try {
      const detail = await fetchJSON(`${apiBase}/articles/${articleId}/`, { signal });
      const g = Array.isArray(detail?.genres) ? detail.genres : [];
      const mapped = g.map((x) =>
        typeof x === "object" ? { id: x.id, article: articleId, genre: x.id } : { id: null, article: articleId, genre: x }
      );
      return { assocBase: null, rawList: mapped };
    } catch {
      return { assocBase: null, rawList: [] };
    }
  }, [apiBase]);

  const syncArticleGenres = useCallback(async (articleId, desiredIds, signal) => {
    const csrf = await ensureCsrf();
    const { assocBase, rawList } = await getAssocEndpointAndList(articleId, signal);

    // Normalise lignes renvoyées
    const rows = (rawList || []).map((row) => ({
      id: row?.id ?? row?.pk ?? null,
      article: (() => {
        const a = row?.article;
        if (typeof a === "number") return a;
        if (a && typeof a === "object") return a.id ?? a.pk ?? null;
        return row?.article_id ?? row?.articleId ?? null;
      })(),
      genre: (() => {
        const g = row?.genre;
        if (typeof g === "number") return g;
        if (g && typeof g === "object") return g.id ?? g.pk ?? null;
        return row?.genre_id ?? row?.genreId ?? null;
      })(),
    }));

    // On n’agit QUE sur les lignes qui appartiennent bien à cet article
    const current = rows.filter((r) => Number(r.article) === Number(articleId) && r.genre != null);

    const wantIds = new Set((desiredIds || []).map(Number));
    const currentIds = new Set(current.map((r) => Number(r.genre)));

    const toAdd = [...wantIds].filter((gid) => !currentIds.has(gid));

    // Ultra-safe: on ne supprime que si on VOIT au moins une ligne de CET article
    const canDelete = current.length > 0 || rawList.length === 0;
    const toRemove = canDelete ? current.filter((r) => !wantIds.has(Number(r.genre))) : [];

    // Ajouts
    if (assocBase) {
      for (const gid of toAdd) {
        await fetch(assocBase, {
          method: "POST",
          credentials: "include",
          signal,
          headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
          body: JSON.stringify({ article: articleId, genre: gid }),
        });
      }
    } else {
      // Pas d’endpoint dédié => on tente un PATCH direct (genres M2M sur article)
      try {
        await fetch(`${apiBase}/articles/${articleId}/`, {
          method: "PATCH",
          credentials: "include",
          signal,
          headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
          body: JSON.stringify({ genres: [...wantIds] }),
        });
        return;
      } catch {
        /* ignore */
      }
    }

    // Suppressions (précises)
    if (assocBase && canDelete) {
      for (const rec of toRemove) {
        if (rec.id != null) {
          await fetch(`${assocBase}${rec.id}/`, {
            method: "DELETE",
            credentials: "include",
            signal,
            headers: { "X-CSRFToken": csrf },
          });
        } else {
          // Si on n’a pas d’ID d’association, recherche ciblée
          try {
            const data = await fetchJSON(`${assocBase}?article=${articleId}&genre=${rec.genre}`, { signal });
            const found = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
            const assocId = found[0]?.id ?? found[0]?.pk ?? null;
            if (assocId != null) {
              await fetch(`${assocBase}${assocId}/`, {
                method: "DELETE",
                credentials: "include",
                signal,
                headers: { "X-CSRFToken": csrf },
              });
            }
          } catch {
            // on s’abstient si on ne peut pas cibler précisément
          }
        }
      }
    }
  }, [apiBase, getAssocEndpointAndList]);

  /* ---------- Actions ---------- */
  const save = useCallback(async (e) => {
    e.preventDefault();
    if (saving) return;

    setErr("");
    setSaving(true);
    const task = startTask(30000);

    try {
      const payload = {
        title: title.trim(),
        article_content: content,
        link_image: imageUrl.trim() || null,
      };
      if (!isEditing && userId != null) payload.user = userId;

      let saved;
      if (isEditing) {
        saved = await patchArticle(artId, payload, task.signal);
      } else {
        saved = await postArticle(payload, task.signal);
      }

      // genres -> IDs
      const desiredIds = genres
        .map((g) => (typeof g === "object" ? g.id : g))
        .filter((v) => v != null)
        .map(Number);

      await syncArticleGenres(saved.id ?? saved.pk, desiredIds, task.signal);

      // Renvoie à l’appelant : on “force” genres = ce que l’utilisateur a choisi
      onSaved({
        ...saved,
        genres: genres,
      });

      onClose();
    } catch (e2) {
      if (!task.isAbortError(e2)) setErr(String(e2?.message || e2));
    } finally {
      task.done();
      setSaving(false);
    }
  }, [saving, startTask, isEditing, artId, title, content, imageUrl, genres, postArticle, patchArticle, syncArticleGenres, onSaved, onClose]);

  const doDelete = useCallback(async () => {
    if (!isEditing || !artId) return;
    if (!window.confirm("Supprimer cet article ?")) return;

    setErr("");
    setSaving(true);
    const task = startTask(20000);
    try {
      await deleteArticle(artId, task.signal);
      onDeleted(artId);
      onClose();
    } catch (e2) {
      if (!task.isAbortError(e2)) setErr(String(e2?.message || e2));
    } finally {
      task.done();
      setSaving(false);
    }
  }, [isEditing, artId, startTask, deleteArticle, onDeleted, onClose]);

  /* ---------- Rendu ---------- */
  if (!open) return null;

  return (
    <div>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={saving ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-6 overflow-auto" data-testid="article-modal">
        <div className={`w-full max-w-3xl rounded-2xl border shadow ${card}`}>
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 border-b">
            <div className="font-semibold">
              {isEditing ? `Éditer l’article #${artId}` : "Nouvel article"}
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-lg border px-2 py-1 ${ghostBtn}`}
              disabled={saving}
              aria-label="Fermer"
            >
              ✕
            </button>
          </header>

          {/* Formulaire (unique) */}
          <form onSubmit={save} className="p-4 space-y-4">
            {err && (
              <div className="rounded-lg border border-red-300 bg-red-50 text-red-800 text-sm p-2">
                {err}
              </div>
            )}

            <div>
              <label className="block text-sm mb-1">Titre</label>
              <input
                className={`w-full rounded-lg border px-3 py-2 ${inputCls}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Contenu</label>
              <textarea
                className={`w-full rounded-lg border px-3 py-2 ${inputCls}`}
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Image (URL)</label>
              <input
                className={`w-full rounded-lg border px-3 py-2 ${inputCls}`}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>

            {/* Sélection des genres (aucun <form> à l’intérieur) */}
            <div>
              <label className="block text-sm mb-2">Genres</label>
              <GenrePicker
                apiBase={apiBase}
                value={genres}
                onChange={setGenres}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              {isEditing ? (
                <button
                  type="button"
                  onClick={doDelete}
                  className={`rounded-xl border px-3 py-2 ${ghostBtn}`}
                  disabled={saving}
                >
                  Supprimer
                </button>
              ) : <span />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={`rounded-xl border px-3 py-2 ${ghostBtn}`}
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`rounded-xl border px-4 py-2 ${cta}`}
                  disabled={saving}
                >
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
