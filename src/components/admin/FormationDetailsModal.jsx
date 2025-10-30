import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { ensureCsrf } from "../../lib/api";
import Pagination from "../ui/Pagination";
import PageSizer from "../ui/PageSizer";

export default function FormationDetailsModal({ open, onClose, apiBase, formation, onDeleted }) {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  // pagination interne de la modale
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(1);

  const [deleting, setDeleting] = useState(false);

  const ctrlRef = useRef(null);

  const card =
    theme === "dark"
      ? "bg-[#262626] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";
  const headRow = theme === "dark" ? "bg-[#232323]" : "bg-gray-50";
  const muted = theme === "dark" ? "text-white/70" : "text-gray-600";
  const btnGhost =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333] hover:bg-[#222]"
      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50";
  const btnDanger =
    theme === "dark"
      ? "bg-red-600/20 text-red-300 border-red-700 hover:bg-red-600/30"
      : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";

  const overlay = open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0";
  const panel = open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0";

  useEffect(() => {
    return () => ctrlRef.current?.abort();
  }, []);

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
      done: () => { clearTimeout(t); if (ctrlRef.current === ctrl) ctrlRef.current = null; },
      isAbortError,
    };
  }, []);

  const fetchJSON = useCallback(async (url, signal) => {
    const r = await fetch(url, { credentials: "include", signal });
    const ct = r.headers.get("content-type") || "";
    if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
    if (!ct.includes("application/json")) {
      const snippet = (await r.text()).slice(0, 200);
      throw new Error(`Réponse non-JSON (ct=${ct}). ${snippet}`);
    }
    return r.json();
  }, []);

  const fmtUser = useCallback((u) => {
    if (!u) return { id: null, username: "Inconnu", email: "—" };
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
    const username = u.username || u.email || name || `user#${u.id}`;
    return {
      id: u.id ?? u.pk ?? null,
      username,
      email: u.email ?? "—",
    };
  }, []);

  const load = useCallback(async (p = 1) => {
    if (!open || !formation?.id) return;
    setLoading(true);
    setErr("");
    const task = startTask();
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("page_size", String(pageSize));
      params.set("formation", String(formation.id));

      const candidates = [
        `${apiBase}/user-formations/`,
        `${apiBase}/userformations/`,
        `${apiBase}/user_formations/`,
      ];
      let data = null, lastErr = null;
      for (const base of candidates) {
        try {
          data = await fetchJSON(`${base}?${params.toString()}`, task.signal);
          break;
        } catch (e) {
          if (task.isAbortError(e)) return;
          lastErr = e;
        }
      }
      if (!data) throw lastErr || new Error("Impossible de charger les inscrits.");

      const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      const mapped = list.map((l) => {
        const u = (typeof l.user === "object" && l.user) || l.user_detail || l.user_details || null;
        return fmtUser(u ?? l.user ?? null);
      });
      setRows(mapped);

      const total = typeof data?.count === "number"
        ? data.count
        : (data?.next || data?.previous)
        ? (p + (data?.next ? 1 : 0)) * pageSize
        : mapped.length;

      setPageCount(Math.max(1, Math.ceil(total / pageSize)));
    } catch (e) {
      if (!task.isAbortError(e)) setErr(String(e?.message || e));
    } finally {
      task.done();
      setLoading(false);
    }
  }, [apiBase, open, formation?.id, pageSize, fetchJSON, fmtUser, startTask]);

  // Reload when open/formation changes or page changes
  useEffect(() => { setPage(1); }, [formation?.id, open, pageSize]);
  useEffect(() => { load(page); }, [load, page]);

  const doDelete = useCallback(async () => {
    if (!formation?.id) return;
    if (!window.confirm(`Supprimer la formation "${formation.title}" ?`)) return;
    setDeleting(true);
    try {
      const csrf = await ensureCsrf();
      const r = await fetch(`${apiBase}/formations/${formation.id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: { "X-CSRFToken": csrf },
      });
      if (!r.ok) {
        let msg = `HTTP ${r.status}`;
        try {
          const j = await r.json();
          if (j?.detail) msg += ` - ${j.detail}`;
        } catch {}
        throw new Error(msg);
      }
      onDeleted?.(formation.id);
    } catch (e) {
      alert(`Suppression impossible: ${String(e?.message || e)}`);
    } finally {
      setDeleting(false);
    }
  }, [apiBase, formation?.id, formation?.title, onDeleted]);

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition ${overlay}`} aria-hidden={!open}>
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* panel */}
      <div
        className={`relative w-full sm:max-w-3xl sm:rounded-2xl border p-4 sm:p-6 transition ${panel} ${card}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold truncate">
              {formation?.title ?? "Détails de la formation"}
            </h2>
            {formation?.description && (
              <p className={`mt-1 text-sm ${muted} line-clamp-3`}>{formation.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className={`rounded-xl border px-3 py-1 text-sm ${btnGhost}`} onClick={onClose}>
              Fermer
            </button>
            <button
              type="button"
              className={`rounded-xl border px-3 py-1 text-sm ${btnDanger} disabled:opacity-60`}
              onClick={doDelete}
              disabled={deleting}
              title="Supprimer cette formation"
            >
              {deleting ? "Suppression…" : "Supprimer"}
            </button>
          </div>
        </div>

        {/* Liste inscrits */}
        <div className="mt-4 rounded-xl border overflow-hidden">
          <div className={`hidden md:block ${headRow}`}>
            <div className="grid grid-cols-2 gap-0">
              <div className="p-3 font-medium">Utilisateur</div>
              <div className="p-3 font-medium">Email</div>
            </div>
          </div>

          {/* desktop */}
          <div className="hidden md:block">
            {loading ? (
              <div className="p-4 text-sm opacity-80">Chargement…</div>
            ) : err ? (
              <div className="p-4 text-sm text-red-600 dark:text-red-400">Erreur : {err}</div>
            ) : rows.length === 0 ? (
              <div className="p-4 text-sm opacity-80">Aucun inscrit.</div>
            ) : (
              <ul>
                {rows.map((u) => (
                  <li key={u.id} className="grid grid-cols-2 gap-0 border-t px-3 py-2">
                    <div className="truncate" title={u.username}>{u.username}</div>
                    <div className="truncate" title={u.email}>{u.email}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* mobile */}
          <div className="md:hidden">
            {loading ? (
              <div className="p-4 text-sm opacity-80">Chargement…</div>
            ) : err ? (
              <div className="p-4 text-sm text-red-600 dark:text-red-400">Erreur : {err}</div>
            ) : rows.length === 0 ? (
              <div className="p-4 text-sm opacity-80">Aucun inscrit.</div>
            ) : (
              <ul className="divide-y">
                {rows.map((u) => (
                  <li key={u.id} className="p-3">
                    <div className="font-medium break-words">{u.username}</div>
                    <div className={`text-sm break-words ${muted}`}>{u.email}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Pagination interne */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <PageSizer pageSize={pageSize} onChange={setPageSize} />
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} theme={theme} />
        </div>
      </div>
    </div>
  );
}
