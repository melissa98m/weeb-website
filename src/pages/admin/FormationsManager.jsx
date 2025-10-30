import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../../context/AuthContext";
import { hasPersonnelRole, PERSONNEL_ROLE } from "../../utils/roles";
import { useTheme } from "../../context/ThemeContext";
import AdminAccessFooter from "../../components/admin/AdminAccessFooter";
import Pagination from "../../components/ui/Pagination";
import PageSizer from "../../components/ui/PageSizer";
import FormationDetailsModal from "../../components/admin/FormationDetailsModal";
import CreateFormationModal from "../../components/admin/CreateFormationModal";

// Normalise toujours vers .../api
const API_BASE = (() => {
  const raw = (import.meta.env.VITE_API_URL ?? "http://localhost:8000") + "";
  const base = raw.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
})();

export default function FormationsManager() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // recherche + pagination
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [pageCount, setPageCount] = useState(1);

  // modales
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  // AbortController
  const ctrlRef = useRef(null);

  const card =
    theme === "dark"
      ? "bg-[#262626] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";
  const inputCls =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333] placeholder-white/60"
      : "bg-white text-gray-900 border-gray-200 placeholder-gray-400";
  const ghostBtn =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333] hover:bg-[#222]"
      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50";
  const ctaBtn =
    theme === "dark"
      ? "bg-secondary text-white border-secondary hover:brightness-110"
      : "bg-primary text-dark border-primary hover:brightness-110";

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    return () => ctrlRef.current?.abort();
  }, []);

  const startTask = useCallback((ms = 15000) => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    const t = setTimeout(() => {
      try { ctrl.abort(); } catch {}
    }, ms);
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

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setErr("");
    const task = startTask();
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("page_size", String(pageSize));
      if (debouncedQ) params.set("search", debouncedQ);

      const data = await fetchJSON(`${API_BASE}/formations/?${params.toString()}`, task.signal);
      const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];

      const mapped = list.map((f) => ({
        id: f.id ?? f.pk,
        title: f.title ?? f.name ?? f.label ?? `formation#${f.id || f.pk}`,
        description: f.description ?? "",
        raw: f,
      }));

      setItems(mapped);

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
  }, [fetchJSON, startTask, pageSize, debouncedQ]);

  // initial + changements de critères
  useEffect(() => { setPage(1); }, [pageSize, debouncedQ]);
  useEffect(() => { load(page); }, [page, load]);

  const openModal = (formation) => {
    setCurrent(formation);
    setOpen(true);
  };

  const onDeleted = (id) => {
    setOpen(false);
    setItems((prev) => prev.filter((f) => String(f.id) !== String(id)));
    // load(1); // si tu préfères recharger depuis l'API
  };

  const handleCreated = useCallback((created) => {
    // ferme la modale de création
    setShowCreate(false);
    // ouvre directement la modale de détails sur l'élément créé
    const f = {
      id: created.id,
      title: created.title ?? created.name ?? created.label ?? `formation#${created.id}`,
      description: created.description ?? "",
    };
    setCurrent(f);
    setOpen(true);
    // rafraîchit la liste (et la pagination)
    setTimeout(() => {
      setPage(1);
      load(1);
    }, 0);
  }, [load]);

  // guards
  if (!user) return <div className="p-6">Veuillez vous connecter.</div>;
  if (!hasPersonnelRole(user))
    return <div className="p-6 text-red-600">Accès refusé. Cette page est réservée au personnel.</div>;

  return (
    <main className="pt-[34px] md:pt-[58px] bg-background text-white p-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold leading-tight truncate">
            Gérer les formations
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-white/60">
            Liste, recherche, création et ouverture des détails avec les inscrits.
          </p>
        </div>

        {/* Actions: créer + recherche + taille de page */}
        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          <button
            type="button"
            className={`rounded-xl border px-4 py-2 ${ctaBtn}`}
            onClick={() => setShowCreate(true)}
          >
            + Nouvelle formation
          </button>

          <input
            className={`w-60 rounded-xl border px-3 py-2 ${inputCls}`}
            placeholder="Rechercher une formation"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <PageSizer pageSize={pageSize} onChange={setPageSize} />
        </div>
      </header>

      {/* Content */}
      <section className={`rounded-2xl border mt-3 p-4 ${card}`}>
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
          <div className="p-4 text-sm opacity-80">Aucune formation.</div>
        )}

        {!loading && !err && items.length > 0 && (
          <ul
            className="grid gap-3 p-3
                       sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {items.map((f) => (
              <li key={f.id} className="rounded-xl border overflow-hidden">
                <button
                  type="button"
                  onClick={() => openModal(f)}
                  className="w-full text-left p-4 hover:brightness-105 transition"
                >
                  <div className="font-semibold truncate">{f.title}</div>
                  {f.description && (
                    <div className="mt-1 text-sm opacity-80 line-clamp-2">
                      {f.description}
                    </div>
                  )}
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

      {/* Modal détails */}
      <FormationDetailsModal
        open={open}
        onClose={() => setOpen(false)}
        apiBase={API_BASE}
        formation={current}
        onDeleted={onDeleted}
      />

      {/* Modal création */}
      <CreateFormationModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
        apiBase={API_BASE}
      />
      <AdminAccessFooter allowedRoles={PERSONNEL_ROLE} />
    </main>
    
  );
}
