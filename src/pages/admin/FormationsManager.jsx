import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "../../context/AuthContext";
import { hasPersonnelRole, PERSONNEL_ROLE } from "../../utils/roles";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import AdminAccessFooter from "../../components/admin/AdminAccessFooter";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import Pagination from "../../components/ui/Pagination";
import PageSizer from "../../components/ui/PageSizer";
import FormationDetailsModal from "../../components/admin/FormationDetailsModal";
import CreateFormationModal from "../../components/admin/CreateFormationModal";
import { getEnv } from "../../lib/env";
import adminEn from "../../../locales/en/admin.json";
import adminFr from "../../../locales/fr/admin.json";

// Normalise toujours vers .../api
const API_BASE = (() => {
  const raw = getEnv("VITE_API_URL", "http://localhost:8000") + "";
  const base = raw.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
})();

export default function FormationsManager() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? adminFr : adminEn;

  useEffect(() => {
    const prev = document.title;
    document.title = t.page_title_formations;
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute("content", "noindex, nofollow");
    return () => {
      document.title = prev;
      if (metaRobots) metaRobots.setAttribute("content", "index, follow");
    };
  }, []);

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

  const isDark = theme === "dark";
  const card = isDark ? "bg-surface border-border text-white" : "bg-white text-gray-900 border-gray-200";
  const inputCls =
    theme === "dark"
      ? "bg-surface text-white border-border placeholder-white/60"
      : "bg-white text-gray-900 border-gray-200 placeholder-gray-400";
  const ghostBtn =
    theme === "dark"
      ? "bg-surface text-white border-border hover:bg-surface-raised"
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
      try { ctrl.abort(); } catch { /* noop */ }
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

  // Initial load + re-fetch when criteria change
  useEffect(() => { setPage(1); }, [pageSize, debouncedQ]);
  useEffect(() => { load(page); }, [page, load]);

  const openModal = (formation) => {
    setCurrent(formation);
    setOpen(true);
  };

  const onDeleted = (id) => {
    setOpen(false);
    setItems((prev) => prev.filter((f) => String(f.id) !== String(id)));
    // load(1); // uncomment to reload from the API instead
  };

  const handleCreated = useCallback((created) => {
    // Close the create modal
    setShowCreate(false);
    // Open the detail modal directly on the newly created item
    const f = {
      id: created.id,
      title: created.title ?? created.name ?? created.label ?? `formation#${created.id}`,
      description: created.description ?? "",
    };
    setCurrent(f);
    setOpen(true);
    // Refresh the list (and pagination)
    setTimeout(() => {
      setPage(1);
      load(1);
    }, 0);
  }, [load]);

  // guards
  if (!user) return <div className="p-6">{t.common_please_login}</div>;
  if (!hasPersonnelRole(user))
    return <div className="p-6 text-red-600">{t.common_access_denied}</div>;

  return (
    <main className="px-4 md:px-6 py-6">
      <AdminPageHeader
        title={t.formations_title}
        subtitle={t.formations_subtitle}
        icon={() => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4l9 5-9 5-9-5 9-5z"/><path d="M4 10v4l8 4 8-4v-4"/></svg>}
        iconBg={isDark ? "bg-primary/10 text-primary" : "bg-purple-100 text-purple-600"}
        isDark={isDark}
      >
        <button type="button" className={`rounded-xl border px-4 py-2 text-sm font-medium ${ctaBtn}`} onClick={() => setShowCreate(true)}>
          {t.formations_new}
        </button>
        <input
          className={`w-52 rounded-xl border px-3 py-2 text-sm ${inputCls}`}
          placeholder={t.formations_search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <PageSizer pageSize={pageSize} onChange={setPageSize} />
      </AdminPageHeader>

      {/* Content */}
      <section className={`rounded-2xl border mt-3 p-4 ${card}`}>
        {!loading && err && (
          <div className={`rounded-xl border px-4 py-3 text-sm ${isDark ? "border-red-700/30 bg-red-900/10 text-red-400" : "border-red-200 bg-red-50 text-red-600"}`}>
            {t.common_error.replace("{message}", err)}
            <div className="mt-2">
              <button className={`rounded-xl border px-3 py-1 text-sm ${ghostBtn}`} onClick={() => load(page)}>
                {t.common_reload}
              </button>
            </div>
          </div>
        )}

        {!loading && !err && items.length === 0 && (
          <div className={`rounded-2xl border px-4 py-10 text-center text-sm ${isDark ? "border-border text-white/30" : "border-gray-200 text-gray-400"}`}>
            {t.formations_no_results}
          </div>
        )}

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: pageSize > 8 ? 8 : pageSize }).map((_, i) => (
                <li
                  key={i}
                  className={`rounded-2xl border animate-pulse ${isDark ? "border-border bg-surface" : "border-gray-200 bg-white"}`}
                >
                  <div className="p-4 flex flex-col gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
                    <div className="space-y-1.5">
                      <div className={`h-3 rounded-full w-3/4 ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
                      <div className={`h-2.5 rounded-full w-full ${isDark ? "bg-white/3" : "bg-gray-50"}`} />
                      <div className={`h-2.5 rounded-full w-2/3 ${isDark ? "bg-white/3" : "bg-gray-50"}`} />
                    </div>
                  </div>
                </li>
              ))
            : items.map((f) => (
                <li
                  key={f.id}
                  className={`rounded-2xl border transition-colors ${
                    isDark
                      ? "border-border hover:border-primary/30 bg-surface"
                      : "border-gray-200 hover:border-secondary/30 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openModal(f)}
                    className="w-full text-left p-4 flex flex-col gap-2.5 h-full"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold font-display shrink-0 ${
                      isDark ? "bg-primary/15 text-primary" : "bg-secondary/10 text-secondary"
                    }`}>
                      {(f.title || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className={`font-display font-semibold text-sm leading-snug truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                        {f.title}
                      </div>
                      {f.description && (
                        <div className={`mt-1 text-xs line-clamp-2 ${isDark ? "text-white/50" : "text-gray-400"}`}>
                          {f.description}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))
          }
        </ul>
      </section>

      {/* Pagination */}
      <div className="mt-2">
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} theme={theme} />
      </div>

      {/* Detail modal */}
      <FormationDetailsModal
        open={open}
        onClose={() => setOpen(false)}
        apiBase={API_BASE}
        formation={current}
        onDeleted={onDeleted}
      />

      {/* Create modal */}
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
