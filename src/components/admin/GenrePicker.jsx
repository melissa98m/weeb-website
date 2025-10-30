import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { ensureCsrf } from "../../lib/api";

export default function GenrePicker({
  apiBase,
  value = [],            // [{id,name,color?}]
  onChange = () => {},
}) {
  const { theme } = useTheme();

  const card = theme === "dark" ? "bg-[#262626] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200";
  const inputCls = theme === "dark"
    ? "bg-[#1c1c1c] text-white border-[#333] placeholder-white/60"
    : "bg-white text-gray-900 border-gray-200 placeholder-gray-400";
  const chipCls = "px-2 py-1 rounded-full border text-xs";
  const ghostBtn = theme === "dark"
    ? "bg-[#1c1c1c] text-white border-[#333] hover:bg-[#222]"
    : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50";

  const [all, setAll] = useState([]);         // [{id,name,color?}]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  // création rapide
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6b7280"); // gris par défaut
  const [creating, setCreating] = useState(false);

  const ctrlRef = useRef(null);
  const startTask = useCallback((ms = 15000) => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    const t = setTimeout(() => { try { ctrl.abort(); } catch {} }, ms);
    const isAbortError = (e) =>
      ctrl.signal.aborted ||
      e?.name === "AbortError" ||
      /aborted|AbortError|signal is aborted/i.test(String(e?.message || ""));
    return {
      signal: ctrl.signal,
      isAbortError,
      done: () => { clearTimeout(t); if (ctrlRef.current === ctrl) ctrlRef.current = null; },
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const task = startTask(20000);
    (async () => {
      setLoading(true); setErr("");
      try {
        const r = await fetch(`${apiBase}/genres/?ordering=name&page_size=500`, {
          credentials: "include",
          signal: task.signal,
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        if (!alive) return;
        setAll(list.map(g => ({ id: g.id, name: g.name, color: g.color })));
      } catch (e) {
        if (!task.isAbortError(e)) setErr(String(e?.message || e));
      } finally {
        task.done();
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; try { ctrlRef.current?.abort(); } catch {} };
  }, [apiBase, startTask]);

  const selectedIds = useMemo(() => new Set(value.map(v => v.id)), [value]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return all;
    return all.filter(g => (g.name || "").toLowerCase().includes(qq));
  }, [all, q]);

  const toggleGenre = useCallback((g) => {
    const exists = value.some(v => String(v.id) === String(g.id));
    if (exists) onChange(value.filter(v => String(v.id) !== String(g.id)));
    else onChange([...value, g]);
  }, [value, onChange]);

  const removeGenre = useCallback((id) => {
    onChange(value.filter(v => String(v.id) !== String(id)));
  }, [value, onChange]);

  // PATCH couleur d’un genre sélectionné
  const patchColor = useCallback(async (id, color) => {
    // Optimistic update local
    onChange(value.map(v => (String(v.id) === String(id) ? { ...v, color } : v)));

    const task = startTask(12000);
    try {
      const csrf = await ensureCsrf();
      const r = await fetch(`${apiBase}/genres/${id}/`, {
        method: "PATCH",
        credentials: "include",
        signal: task.signal,
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        body: JSON.stringify({ color }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      // sync aussi la liste globale
      setAll(prev => prev.map(g => (String(g.id) === String(id) ? { ...g, color } : g)));
    } catch (e) {
      if (!task.isAbortError(e)) setErr(String(e?.message || e));
    } finally { task.done(); }
  }, [apiBase, onChange, startTask, value]);

  // Créer un genre (avec couleur)
  const createGenre = useCallback(async () => {
    const n = newName.trim();
    if (!n) return;
    setCreating(true);
    const task = startTask(15000);
    try {
      const csrf = await ensureCsrf();
      const r = await fetch(`${apiBase}/genres/`, {
        method: "POST",
        credentials: "include",
        signal: task.signal,
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        body: JSON.stringify({ name: n, color: newColor || null }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const g = await r.json();
      setAll((prev) => [{ id: g.id, name: g.name, color: g.color }, ...prev]);
      onChange([...value, { id: g.id, name: g.name, color: g.color }]);
      setNewName("");
    } catch (e) {
      if (!task.isAbortError(e)) setErr(String(e?.message || e));
    } finally {
      task.done();
      setCreating(false);
    }
  }, [apiBase, newName, newColor, value, onChange, startTask]);

  return (
    <section className={`rounded-xl border ${card}`}>
      <div className="p-4 space-y-3">
        {/* sélection actuelle */}
        <div className="flex flex-wrap gap-2">
          {value.length === 0 && (
            <span className={theme === "dark" ? "text-white/60" : "text-gray-600"}>
              Aucun genre sélectionné.
            </span>
          )}
          {value.map((g) => (
            <span
              key={g.id}
              className={`${chipCls} flex items-center gap-2`}
              style={{
                backgroundColor: "transparent",
                borderColor: g.color || (theme === "dark" ? "#333333" : "#e5e7eb"),
                color: g.color || (theme === "dark" ? "#ffffff" : "#111827"),
              }}
            >
              {g.name}
              {/* Color picker inline pour le genre sélectionné */}
              <input
                type="color"
                value={(g.color && /^#[0-9A-Fa-f]{6}$/.test(g.color)) ? g.color : "#6b7280"}
                onChange={(e) => patchColor(g.id, e.target.value)}
                className="w-5 h-5 p-0 border-0 bg-transparent cursor-pointer"
                title="Changer la couleur"
              />
              <button
                type="button"
                className="opacity-70 hover:opacity-100"
                onClick={() => removeGenre(g.id)}
                aria-label={`Retirer ${g.name}`}
                title="Retirer"
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        {/* recherche + liste */}
        <div className="flex items-center gap-2">
          <input
            className={`flex-1 rounded-lg border px-3 py-2 ${inputCls}`}
            placeholder="Rechercher un genre…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="button"
            className={`rounded-lg border px-3 py-2 ${ghostBtn}`}
            onClick={() => setQ("")}
          >
            Effacer
          </button>
        </div>

        <div className="max-h-40 overflow-auto rounded-lg border">
          {loading ? (
            <div className="p-3 text-sm opacity-80">Chargement…</div>
          ) : err ? (
            <div className="p-3 text-sm text-red-600 dark:text-red-400">Erreur : {err}</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-sm opacity-80">Aucun résultat.</div>
          ) : (
            <ul>
              {filtered.map((g) => {
                const active = selectedIds.has(g.id);
                return (
                  <li key={g.id} className="border-b last:border-b-0">
                    <button
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`w-full text-left px-3 py-2 ${active ? "opacity-60" : ""}`}
                      title={active ? "Déjà sélectionné" : "Ajouter"}
                    >
                      {g.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* création rapide — pas de <form> ici */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
          <input
            className={`min-w-[200px] rounded-lg border px-3 py-2 ${inputCls}`}
            placeholder="Nouveau genre"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createGenre();
              }
            }}
          />
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer"
            title="Couleur du nouveau genre"
          />
          <button
            type="button"
            onClick={createGenre}
            className={`rounded-lg border px-3 py-2 ${ghostBtn}`}
            disabled={creating || !newName.trim()}
          >
            {creating ? "Création…" : "Créer"}
          </button>
        </div>
      </div>
    </section>
  );
}
