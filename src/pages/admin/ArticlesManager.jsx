import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { hasAnyRedactionRole } from "../../utils/roles";
import PageSizer from "../../components/ui/PageSizer";
import Pagination from "../../components/ui/Pagination";
import ArticleEditorModal from "../../components/admin/ArticleEditorModal";
import GenreChips from "../../components/Blog/GenreChips";

const API_BASE = (() => {
  const raw = (import.meta.env.VITE_API_URL ?? "http://localhost:8000") + "";
  const base = raw.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
})();

export default function ArticlesManager() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const canRedact = hasAnyRedactionRole(user);
  if (!user) return <div className="p-6">Veuillez vous connecter.</div>;
  if (!canRedact) return <div className="p-6 text-red-600">Accès refusé. Réservé aux Rédacteurs.</div>;

  const card = theme === "dark" ? "bg-[#262626] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200";
  const inputCls = theme === "dark"
    ? "bg-[#1c1c1c] text-white border-[#333] placeholder-white/60"
    : "bg-white text-gray-900 border-gray-200 placeholder-gray-400";
  const ghostBtn = theme === "dark"
    ? "bg-[#1c1c1c] text-white border-[#333] hover:bg-[#222]"
    : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50";
  const cta = theme === "dark"
    ? "bg-secondary text-white border-secondary hover:brightness-110"
    : "bg-primary text-dark border-primary hover:brightness-110";

  // Liste affichée
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Recherche
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Genres
  const [genres, setGenres] = useState([]); // [{id,name,color}]
  const [selectedGenreId, setSelectedGenreId] = useState(null);

  // Modale
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  // Deux contrôleurs distincts
  const genresCtrlRef = useRef(null);
  const listCtrlRef = useRef(null);

  const startTask = useCallback((ref, ms = 15000) => {
    ref.current?.abort();
    const ctrl = new AbortController();
    ref.current = ctrl;
    const t = setTimeout(() => { try { ctrl.abort(); } catch {} }, ms);
    const isAbortError = (e) =>
      ctrl.signal.aborted ||
      e?.name === "AbortError" ||
      /aborted|AbortError|Failed to fetch|NetworkError/i.test(String(e?.message || ""));
    return {
      signal: ctrl.signal,
      isAbortError,
      done: () => { clearTimeout(t); if (ref.current === ctrl) ref.current = null; }
    };
  }, []);

  const fetchJSON = useCallback(async (url, signal) => {
    const r = await fetch(url, { credentials: "include", signal });
    const ct = r.headers.get("content-type") || "";
    if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
    if (!ct.includes("application/json")) {
      const snippet = (await r.text()).slice(0, 120);
      throw new Error(`Réponse non-JSON (ct=${ct}). ${snippet}`);
    }
    return r.json();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const loadGenres = useCallback(async () => {
    const task = startTask(genresCtrlRef, 12000);
    try {
      const data = await fetchJSON(`${API_BASE}/genres/?page_size=200&ordering=name`, task.signal);
      const list = Array.isArray(data) ? data : (data.results || []);
      setGenres(list.map(g => ({ id: g.id, name: g.name, color: g.color || null })));
    } catch {/* silence si abort */}
    finally { task.done(); }
  }, [fetchJSON, startTask]);

  const genresForChips = useMemo(
    () => [{ id: null, name: "Tous", color: null }, ...genres],
    [genres]
  );

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setErr("");
    const task = startTask(listCtrlRef, 15000);
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("page_size", String(pageSize));
      params.set("ordering", "-created_at");
      if (debouncedQ) params.set("search", debouncedQ);
      if (selectedGenreId != null) params.set("genres", String(selectedGenreId)); // si support API

      const data = await fetchJSON(`${API_BASE}/articles/?${params.toString()}`, task.signal);
      const list = Array.isArray(data) ? data : (data.results || []);
      const normalized = list.map(a => ({
        id: a.id ?? a.pk,
        title: a.title ?? `article#${a.id ?? a.pk}`,
        content: a.article_content ?? "",
        image: a.link_image || a.cover || a.image || "",
        genres: Array.isArray(a.genres)
          ? a.genres.map(g => (typeof g === "object" ? g : { id: g }))
          : [],
        raw: a,
      }));

      // Filtre local (genre + recherche) comme Blog
      const localFiltered = normalized.filter((it) => {
        const genreOk =
          selectedGenreId == null
            ? true
            : it.genres.some((g) => Number(g.id) === Number(selectedGenreId));
        if (!debouncedQ) return genreOk;
        const text = `${it.title} ${it.content}`.toLowerCase();
        return genreOk && text.includes(debouncedQ);
      });

      setItems(localFiltered);

      const total = typeof data?.count === "number"
        ? data.count
        : (data?.next || data?.previous)
          ? (p + (data?.next ? 1 : 0)) * pageSize
          : localFiltered.length;
      setPageCount(Math.max(1, Math.ceil(total / pageSize)));
    } catch (e) {
      if (!task.isAbortError(e)) setErr(String(e?.message || e));
      setItems([]); setPageCount(1);
    } finally { task.done(); setLoading(false); }
  }, [fetchJSON, startTask, debouncedQ, pageSize, selectedGenreId]);

  useEffect(() => {
    loadGenres();
    return () => { try { genresCtrlRef.current?.abort(); } catch {} };
  }, [loadGenres]);

  useEffect(() => { setPage(1); }, [pageSize, debouncedQ, selectedGenreId]);

  useEffect(() => {
    load(page);
    return () => { try { listCtrlRef.current?.abort(); } catch {} };
  }, [page, load]);

  const openCreate = () => { setCurrent(null); setOpen(true); };
  const openEdit = (a) => { setCurrent(a.raw); setOpen(true); };

  const onSaved = (saved) => {
    setItems(prev => {
      const idx = prev.findIndex(x => Number(x.id) === Number(saved.id));
      const next = {
        id: saved.id,
        title: saved.title ?? "",
        content: saved.article_content ?? "",
        image: saved.link_image || "",
        genres: Array.isArray(saved.genres) ? saved.genres : [],
        raw: saved,
      };
      if (idx === -1) return [next, ...prev];
      const arr = [...prev]; arr[idx] = next; return arr;
    });
  };
  const onDeleted = (id) => setItems(prev => prev.filter(x => Number(x.id) !== Number(id)));

  return (
    <main className="px-4 md:px-6 py-4 md:py-6">
      {/* Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold leading-tight">Gérer les articles</h1>
          <p className="text-xs mt-1 opacity-80">Recherche, filtre par genre, création/édition.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className={`w-64 rounded-xl border px-3 py-2 ${inputCls}`}
            placeholder="Rechercher un article"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <PageSizer pageSize={pageSize} onChange={setPageSize} />
          <button type="button" onClick={openCreate} className={`rounded-xl border px-3 py-2 ${cta}`}>
            + Nouvel article
          </button>
        </div>
      </header>

      {/* Filtres genres (chips comme blog) */}
      <section className={`mt-3 rounded-2xl border p-3 ${card}`}>
        <div className="text-sm opacity-80 mb-2">Filtrer par genre</div>
        <GenreChips
          genres={genresForChips}
          selectedId={selectedGenreId}
          onChange={(id) => setSelectedGenreId(id)} // id peut être null (“Tous”)
          theme={theme}
        />
      </section>

      {/* Liste */}
      <section className={`mt-3 rounded-2xl border p-3 ${card}`}>
        {loading && <div className="p-4 text-sm opacity-80">Chargement…</div>}
        {!loading && err && (
          <div className="p-4 text-sm text-red-600 dark:text-red-400">
            Erreur : {err}
            <div className="mt-2">
              <button className={`rounded-xl border px-3 py-1 text-sm ${ghostBtn}`} onClick={() => load(page)}>
                Recharger
              </button>
            </div>
          </div>
        )}
        {!loading && !err && items.length === 0 && (
          <div className="p-4 text-sm opacity-80">Aucun article.</div>
        )}

        {!loading && !err && items.length > 0 && (
          <ul className="grid gap-3 p-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((a) => (
              <li key={a.id} className="rounded-xl border overflow-hidden">
                <button
                  type="button"
                  onClick={() => openEdit(a)}
                  className="block w-full text-left hover:brightness-105 transition"
                >
                  {a.image ? (
                    <img
                      src={a.image}
                      alt={a.title}
                      className="w-full h-40 object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                      loading="lazy"
                    />
                  ) : null}
                  <div className="p-3">
                    <div className="font-semibold truncate">{a.title}</div>
                    {a.genres?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {a.genres.slice(0, 4).map((g) => (
                          <span
                            key={g.id}
                            className="px-2 py-0.5 rounded-full border text-xs"
                            style={{
                              backgroundColor: "transparent",
                              borderColor: g.color || (theme === "dark" ? "#333333" : "#e5e7eb"),
                              color: g.color || (theme === "dark" ? "#ffffff" : "#111827"),
                            }}
                          >
                            {g.name}
                          </span>
                        ))}
                        {a.genres.length > 4 && (
                          <span className="px-2 py-0.5 rounded-full border text-xs opacity-80">
                            +{a.genres.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pagination */}
      <div className="mt-2">
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} theme={theme} />
      </div>

      {/* Modale */}
      <ArticleEditorModal
        open={open}
        onClose={() => setOpen(false)}
        apiBase={API_BASE}
        article={current}
        onSaved={onSaved}
        onDeleted={onDeleted}
      />
    </main>
  );
}
