import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { hasAnyRedactionRole } from "../../utils/roles";
import { ensureCsrf } from "../../lib/api";

const API_BASE = (() => {
  const raw = (import.meta.env.VITE_API_URL ?? "http://localhost:8000") + "";
  const base = raw.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
})();

export default function GenresManager() {
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
  const dangerBtn = theme === "dark"
    ? "bg-red-600/20 text-red-400 border-red-600/40 hover:bg-red-600/30"
    : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";

  // Liste des genres
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Recherche
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  // Modale création/édition
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null); // null => création, sinon {id, name, color}
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState("#6b7280");
  const [saving, setSaving] = useState(false);

  const ctrlRef = useRef(null);

  const startTask = useCallback((ms = 15000) => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    const t = setTimeout(() => { try { ctrl.abort(); } catch {} }, ms);
    const isAbortError = (e) =>
      ctrl.signal.aborted ||
      e?.name === "AbortError" ||
      /aborted|AbortError|Failed to fetch|NetworkError/i.test(String(e?.message || ""));
    return {
      signal: ctrl.signal,
      isAbortError,
      done: () => { clearTimeout(t); if (ctrlRef.current === ctrl) ctrlRef.current = null; }
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

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    const task = startTask(15000);
    try {
      const data = await fetchJSON(`${API_BASE}/genres/?ordering=name&page_size=500`, task.signal);
      const list = Array.isArray(data) ? data : (data.results || []);
      setGenres(list.map(g => ({
        id: g.id,
        name: g.name || "",
        color: g.color || null,
      })));
    } catch (e) {
      if (!task.isAbortError(e)) setErr(String(e?.message || e));
      setGenres([]);
    } finally {
      task.done();
      setLoading(false);
    }
  }, [fetchJSON, startTask]);

  useEffect(() => {
    load();
    return () => { try { ctrlRef.current?.abort(); } catch {} };
  }, [load]);

  const filtered = useMemo(() => {
    if (!debouncedQ) return genres;
    return genres.filter(g => (g.name || "").toLowerCase().includes(debouncedQ));
  }, [genres, debouncedQ]);

  const openCreate = () => {
    setCurrent(null);
    setFormName("");
    setFormColor("#6b7280");
    setOpen(true);
  };

  const openEdit = (genre) => {
    setCurrent(genre);
    setFormName(genre.name || "");
    setFormColor(genre.color || "#6b7280");
    setOpen(true);
  };

  const handleSave = useCallback(async () => {
    const name = formName.trim();
    if (!name) return;

    setSaving(true);
    const task = startTask(15000);
    try {
      const csrf = await ensureCsrf();
      const body = { name, color: formColor || null };
      const url = current
        ? `${API_BASE}/genres/${current.id}/`
        : `${API_BASE}/genres/`;
      const method = current ? "PATCH" : "POST";

      const r = await fetch(url, {
        method,
        credentials: "include",
        signal: task.signal,
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        body: JSON.stringify(body),
      });

      if (!r.ok) {
        const errorText = await r.text().catch(() => "");
        throw new Error(`HTTP ${r.status}${errorText ? `: ${errorText}` : ""}`);
      }

      const saved = await r.json();
      const updated = {
        id: saved.id,
        name: saved.name || "",
        color: saved.color || null,
      };

      if (current) {
        setGenres(prev => prev.map(g => Number(g.id) === Number(current.id) ? updated : g));
      } else {
        setGenres(prev => [updated, ...prev].sort((a, b) => (a.name || "").localeCompare(b.name || "")));
      }

      setOpen(false);
      setCurrent(null);
    } catch (e) {
      if (!task.isAbortError(e)) setErr(String(e?.message || e));
    } finally {
      task.done();
      setSaving(false);
    }
  }, [formName, formColor, current, startTask]);

  const handleDelete = useCallback(async (genre) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le genre "${genre.name}" ?`)) return;

    const task = startTask(15000);
    try {
      const csrf = await ensureCsrf();
      const r = await fetch(`${API_BASE}/genres/${genre.id}/`, {
        method: "DELETE",
        credentials: "include",
        signal: task.signal,
        headers: { "X-CSRFToken": csrf },
      });

      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      setGenres(prev => prev.filter(g => Number(g.id) !== Number(genre.id)));
    } catch (e) {
      if (!task.isAbortError(e)) setErr(String(e?.message || e));
    } finally {
      task.done();
    }
  }, [startTask]);

  return (
    <main className="px-4 md:px-6 py-4 md:py-6">
      {/* Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold leading-tight">Gérer les genres</h1>
          <p className="text-xs mt-1 opacity-80">Créer, modifier et supprimer les genres d'articles.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className={`w-64 rounded-xl border px-3 py-2 ${inputCls}`}
            placeholder="Rechercher un genre"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="button" onClick={openCreate} className={`rounded-xl border px-3 py-2 ${cta}`}>
            + Nouveau genre
          </button>
        </div>
      </header>

      {/* Liste */}
      <section className={`mt-3 rounded-2xl border p-3 ${card}`}>
        {loading && <div className="p-4 text-sm opacity-80">Chargement…</div>}
        {!loading && err && (
          <div className="p-4 text-sm text-red-600 dark:text-red-400">
            Erreur : {err}
            <div className="mt-2">
              <button className={`rounded-xl border px-3 py-1 text-sm ${ghostBtn}`} onClick={load}>
                Recharger
              </button>
            </div>
          </div>
        )}
        {!loading && !err && filtered.length === 0 && (
          <div className="p-4 text-sm opacity-80">
            {q ? "Aucun genre ne correspond à votre recherche." : "Aucun genre."}
          </div>
        )}

        {!loading && !err && filtered.length > 0 && (
          <div className="grid gap-3 p-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((genre) => (
              <div
                key={genre.id}
                className={`rounded-xl border p-4 ${card} flex flex-col gap-3`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border flex items-center justify-center text-lg font-semibold"
                    style={{
                      backgroundColor: genre.color ? `${genre.color}20` : "transparent",
                      borderColor: genre.color || (theme === "dark" ? "#333" : "#e5e7eb"),
                      color: genre.color || (theme === "dark" ? "#fff" : "#111"),
                    }}
                  >
                    {genre.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{genre.name || "Sans nom"}</div>
                    {genre.color && (
                      <div className="text-xs opacity-70 truncate">{genre.color}</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(genre)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm ${ghostBtn}`}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(genre)}
                    className={`rounded-lg border px-3 py-2 text-sm ${dangerBtn}`}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modale création/édition */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
              setCurrent(null);
            }
          }}
        >
          <div className={`rounded-2xl border p-6 max-w-md w-full ${card}`}>
            <h2 className="text-xl font-bold mb-4">
              {current ? "Modifier le genre" : "Nouveau genre"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom</label>
                <input
                  type="text"
                  className={`w-full rounded-lg border px-3 py-2 ${inputCls}`}
                  placeholder="Nom du genre"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Couleur</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-16 h-16 rounded-lg border cursor-pointer"
                  />
                  <input
                    type="text"
                    className={`flex-1 rounded-lg border px-3 py-2 ${inputCls}`}
                    placeholder="#6b7280"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setCurrent(null);
                }}
                className={`flex-1 rounded-lg border px-3 py-2 ${ghostBtn}`}
                disabled={saving}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={`flex-1 rounded-lg border px-3 py-2 ${cta}`}
                disabled={saving || !formName.trim()}
              >
                {saving ? "Enregistrement…" : current ? "Modifier" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

