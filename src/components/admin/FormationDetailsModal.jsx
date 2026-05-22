import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { ensureCsrf } from "../../lib/api";
import Pagination from "../ui/Pagination";
import PageSizer from "../ui/PageSizer";
import FormationContentEditor from "./FormationContentEditor";

function IconTrash({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6"/>
      <path d="M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  );
}

function UserAvatar({ username, isDark }) {
  const letter = (username || "?")[0].toUpperCase();
  return (
    <span
      className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold shrink-0 ${
        isDark ? "bg-primary/15 text-primary" : "bg-secondary/10 text-secondary"
      }`}
      aria-hidden="true"
    >
      {letter}
    </span>
  );
}

function SkeletonRow({ isDark }) {
  const bg = isDark ? "bg-white/5" : "bg-gray-100";
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-full animate-pulse ${bg}`} />
          <div className={`h-3 rounded-full w-28 animate-pulse ${bg}`} />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className={`h-3 rounded-full w-44 animate-pulse ${bg}`} />
      </td>
    </tr>
  );
}

export default function FormationDetailsModal({ open, onClose, apiBase, formation, onDeleted }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [tab, setTab] = useState("inscrits");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const ctrlRef = useRef(null);

  const card = isDark ? "bg-surface text-white border-border" : "bg-white text-gray-900 border-gray-200";
  const muted = isDark ? "text-white/50" : "text-gray-400";
  const rowDivider = isDark ? "border-border/60" : "border-gray-100";
  const headText = isDark ? "text-white/35" : "text-gray-400";

  const overlay = open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0";
  const panel = open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0";

  useEffect(() => {
    return () => ctrlRef.current?.abort();
  }, []);

  const startTask = useCallback((ms = 15000) => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    const t = setTimeout(() => { try { ctrl.abort(); } catch { /* noop */ } }, ms);
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

  useEffect(() => { setPage(1); setTab("inscrits"); }, [formation?.id, open, pageSize]);
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
        } catch { /* noop */ }
        throw new Error(msg);
      }
      onDeleted?.(formation.id);
    } catch (e) {
      alert(`Suppression impossible: ${String(e?.message || e)}`);
    } finally {
      setDeleting(false);
    }
  }, [apiBase, formation?.id, formation?.title, onDeleted]);

  const formLetter = (formation?.title || "?")[0].toUpperCase();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition ${overlay}`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full sm:max-w-3xl sm:rounded-2xl border shadow-xl transition duration-200 ${panel} ${card}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className={`flex items-start justify-between gap-4 px-6 py-5 border-b ${isDark ? "border-border/60" : "border-gray-100"}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 font-display ${
              isDark ? "bg-primary/15 text-primary" : "bg-secondary/10 text-secondary"
            }`}>
              {formLetter}
            </div>
            <div className="min-w-0">
              <h2
                id="modal-title"
                className={`font-display font-bold text-lg leading-tight truncate ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {formation?.title ?? "Détails de la formation"}
              </h2>
              {formation?.description && (
                <p className={`mt-0.5 text-sm line-clamp-1 ${muted}`}>{formation.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                isDark
                  ? "border-border text-white/60 hover:text-white hover:bg-white/5"
                  : "border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={doDelete}
              disabled={deleting}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark
                  ? "border-red-700/30 text-red-400 hover:bg-red-900/20 hover:border-red-600/40"
                  : "border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
              }`}
              title="Supprimer cette formation"
            >
              <IconTrash />
              {deleting ? "Suppression…" : "Supprimer"}
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className={`flex px-6 border-b ${isDark ? "border-border/60" : "border-gray-100"}`}>
          {[
            { key: "inscrits", label: "Inscrits" },
            { key: "contenu", label: "Contenu" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === key
                  ? isDark
                    ? "border-primary text-primary"
                    : "border-secondary text-secondary"
                  : `border-transparent ${isDark ? "text-white/50 hover:text-white/80" : "text-gray-400 hover:text-gray-700"}`
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Onglet Contenu */}
        {tab === "contenu" && (
          <div className="p-4 sm:p-6">
            <FormationContentEditor
              apiBase={apiBase}
              formationId={formation?.id}
              theme={theme}
            />
          </div>
        )}

        {/* Onglet Inscrits */}
        {tab === "inscrits" && (
          <div className="p-4 sm:p-6">
            {err && (
              <div className={`mb-4 rounded-xl border px-3 py-2.5 text-sm ${
                isDark ? "border-red-700/30 bg-red-900/10 text-red-400" : "border-red-200 bg-red-50 text-red-600"
              }`}>
                Erreur : {err}
              </div>
            )}

            {!err && !loading && rows.length === 0 && (
              <div className={`rounded-2xl border px-4 py-10 text-center text-sm ${
                isDark ? "border-border text-white/30" : "border-gray-200 text-gray-400"
              }`}>
                Aucun inscrit pour cette formation.
              </div>
            )}

            {(loading || rows.length > 0) && (
              <>
                {/* Desktop table */}
                <div className={`hidden md:block overflow-x-auto rounded-xl border ${isDark ? "border-border/60" : "border-gray-100"}`}>
                  <table className="w-full text-sm table-fixed" aria-busy={loading ? "true" : "false"}>
                    <colgroup>
                      <col className="w-[48%]" />
                      <col className="w-[52%]" />
                    </colgroup>
                    <thead>
                      <tr className={`border-b ${rowDivider}`}>
                        {["Utilisateur", "Email"].map((h) => (
                          <th
                            key={h}
                            scope="col"
                            className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${headText}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading
                        ? Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                            <SkeletonRow key={i} isDark={isDark} />
                          ))
                        : rows.map((u) => (
                            <tr
                              key={u.id}
                              className={`border-t transition-colors ${rowDivider} ${isDark ? "hover:bg-white/3" : "hover:bg-gray-50/80"}`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <UserAvatar username={u.username} isDark={isDark} />
                                  <span
                                    className={`truncate font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                                    title={u.username}
                                  >
                                    {u.username}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`truncate block text-sm ${muted}`} title={u.email}>
                                  {u.email}
                                </span>
                              </td>
                            </tr>
                          ))
                      }
                    </tbody>
                  </table>
                </div>

                {/* Mobile list */}
                <div className={`md:hidden rounded-xl border divide-y ${
                  isDark ? "border-border/60 divide-border/60" : "border-gray-100 divide-gray-100"
                }`}>
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-4 space-y-2 animate-pulse">
                          <div className={`h-3 rounded-full w-2/5 ${isDark ? "bg-white/8" : "bg-gray-100"}`} />
                          <div className={`h-3 rounded-full w-3/5 ${isDark ? "bg-white/5" : "bg-gray-50"}`} />
                        </div>
                      ))
                    : rows.map((u) => (
                        <div key={u.id} className="flex items-center gap-3 p-4">
                          <UserAvatar username={u.username} isDark={isDark} />
                          <div className="min-w-0">
                            <p className={`font-medium text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                              {u.username}
                            </p>
                            <p className={`text-xs truncate mt-0.5 ${muted}`}>
                              {u.email}
                            </p>
                          </div>
                        </div>
                      ))
                  }
                </div>
              </>
            )}

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <PageSizer pageSize={pageSize} onChange={setPageSize} />
              <Pagination page={page} pageCount={pageCount} onPageChange={setPage} theme={theme} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
