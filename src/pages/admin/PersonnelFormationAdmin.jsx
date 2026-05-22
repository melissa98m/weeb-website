import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../../context/AuthContext";
import { hasPersonnelRole, PERSONNEL_ROLE } from "../../utils/roles";
import { ensureCsrf } from "../../lib/api";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import AdminAccessFooter from "../../components/admin/AdminAccessFooter";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import adminEn from "../../../locales/en/admin.json";
import adminFr from "../../../locales/fr/admin.json";
import Pill from "../../components/ui/Pill";
import FiltersBar from "../../components/admin/FiltersBar";
import AddUserFormationForm from "../../components/admin/AddUserFormation";
import UserFormationTable from "../../components/admin/UserFormationTable";
import Pagination from "../../components/ui/Pagination";
import PageSizer from "../../components/ui/PageSizer";
import { getEnv } from "../../lib/env";

// Always normalizes to .../api
const API_BASE = (() => {
  const raw = getEnv("VITE_API_URL", "http://localhost:8000") + "";
  const base = raw.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
})();

export default function PersonnelFormationAdmin() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? adminFr : adminEn;
  const isDark = theme === "dark";

  useEffect(() => {
    const prev = document.title;
    document.title = t.page_title_personnel;
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute("content", "noindex, nofollow");
    return () => {
      document.title = prev;
      if (metaRobots) metaRobots.setAttribute("content", "index, follow");
    };
  }, []);

  // boot (users + formations)
  const [bootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState("");
  const [users, setUsers] = useState([]);
  const [formations, setFormations] = useState([]);

  // === Totaux ===
  const [usersTotal, setUsersTotal] = useState(0);
  const [formationsTotal, setFormationsTotal] = useState(0);
  const [linksTotal, setLinksTotal] = useState(0);

  // liens (user-formations)
  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState("");

  // filtres / recherche
  const [filterUser, setFilterUser] = useState(null);
  const [filterFormation, setFilterFormation] = useState(null);
  const [searchUser, setSearchUser] = useState("");
  const searchQ = useDeferredValue(searchUser.trim().toLowerCase());

  // Debounce search input to avoid fetching on every keystroke
  const [searchTrigger, setSearchTrigger] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearchTrigger(searchQ), 250);
    return () => clearTimeout(t);
  }, [searchQ]);

  // pagination
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ajout / suppression
  const [addUserId, setAddUserId] = useState(null);
  const [addFormationId, setAddFormationId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [addError, setAddError] = useState("");

  // 2 separate abort controllers
  const bootCtrlRef = useRef(null);
  const linksCtrlRef = useRef(null);

  useEffect(() => {
    return () => {
      bootCtrlRef.current?.abort();
      linksCtrlRef.current?.abort();
    };
  }, []);

  // helpers
  const fmtUser = useCallback((x) => {
    if (!x) return null;
    if (typeof x === "number") return { id: x, username: String(x) };
    const nameFromParts = `${x.first_name ?? ""} ${x.last_name ?? ""}`.trim();
    return {
      id: x.id ?? x.pk ?? x.user_id ?? x.uid,
      username: (x.username ?? x.email ?? nameFromParts) || `user#${x.id}`,
      email: x.email ?? null,
      first_name: x.first_name ?? null,
      last_name: x.last_name ?? null,
    };
  }, []);

  const fmtFormation = useCallback((x) => {
    if (!x) return null;
    if (typeof x === "number") return { id: x, title: String(x) };
    return {
      id: x.id ?? x.pk ?? x.formation_id ?? x.fid,
      title: x.title ?? x.name ?? x.label ?? `formation#${x.id}`,
    };
  }, []);

  const fetchJSON = useCallback(async (url, signal) => {
    const r = await fetch(url, { credentials: "include", signal });
    const ct = r.headers.get("content-type") || "";
    if (!r.ok) {
      if (ct.includes("text/html")) {
        const snippet = (await r.text()).slice(0, 200);
        throw new Error(`HTTP ${r.status} ${url} — attendu JSON, reçu HTML. ${snippet}`);
      }
      throw new Error(`HTTP ${r.status} ${url}`);
    }
    if (!ct.includes("application/json")) {
      const snippet = (await r.text()).slice(0, 200);
      throw new Error(`Réponse non-JSON sur ${url} (ct=${ct}). ${snippet}`);
    }
    return r.json();
  }, []);

  const startTask = useCallback((ref, ms = 15000) => {
    ref.current?.abort();
    const ctrl = new AbortController();
    ref.current = ctrl;
    const t = setTimeout(() => {
      try { ctrl.abort(); } catch { /* noop */ }
    }, ms);

    const isAbortError = (e) => {
      const msg = String(e?.message || "");
      return (
        ctrl.signal.aborted ||
        e?.name === "AbortError" ||
        /aborted|AbortError|Failed to fetch|NetworkError/i.test(msg)
      );
    };

    return {
      signal: ctrl.signal,
      done: () => { clearTimeout(t); if (ref.current === ctrl) ref.current = null; },
      isAbortError,
    };
  }, []);

  // charge users + formations (+ totaux)
  const loadBootstrap = useCallback(async () => {
    setBootLoading(true);
    setBootError("");
    const task = startTask(bootCtrlRef, 15000);
    try {
      const [usersData, formsData] = await Promise.all([
        fetchJSON(`${API_BASE}/users/`, task.signal),
        fetchJSON(`${API_BASE}/formations/`, task.signal),
      ]);

      // users
      const usersList = Array.isArray(usersData?.results)
        ? usersData.results
        : Array.isArray(usersData)
        ? usersData
        : [];
      const uCount =
        typeof usersData?.count === "number"
          ? usersData.count
          : usersList.length;

      // formations
      const formsList = Array.isArray(formsData?.results)
        ? formsData.results
        : Array.isArray(formsData)
        ? formsData
        : [];
      const fCount =
        typeof formsData?.count === "number"
          ? formsData.count
          : formsList.length;

      setUsers(usersList.map(fmtUser));
      setFormations(formsList.map(fmtFormation));
      setUsersTotal(uCount);
      setFormationsTotal(fCount);
    } catch (e) {
      if (!task.isAbortError(e)) setBootError(String(e?.message || e));
    } finally {
      task.done();
      setBootLoading(false);
    }
  }, [fetchJSON, startTask, fmtUser, fmtFormation]);

  // Load links (pagination + filters + search) and update linksTotal
  const loadLinks = useCallback(
    async (p = 1) => {
      setLinksLoading(true);
      setLinksError("");
      const task = startTask(linksCtrlRef, 15000);
      try {
        const params = new URLSearchParams();
        params.set("page", String(p));
        params.set("page_size", String(pageSize));
        if (filterUser) params.set("user", String(filterUser));
        if (filterFormation) params.set("formation", String(filterFormation));
        if (searchTrigger) params.set("search", searchTrigger);

        const candidates = [
          `${API_BASE}/user-formations/`,
        ];
        let data = null,
          lastErr = null;
        for (const base of candidates) {
          try {
            data = await fetchJSON(`${base}?${params.toString()}`, task.signal);
            break;
          } catch (e) {
            if (task.isAbortError(e)) return; // annulation silencieuse
            lastErr = e;
          }
        }
        if (!data)
          throw lastErr || new Error("Impossible de charger la ressource user-formations.");

        const raw = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : [];
        const mapped = raw.map((l) => {
          const userObj =
            (typeof l.user === "object" && l.user) ||
            l.user_detail ||
            l.user_details ||
            null;
          const formationObj =
            (typeof l.formation === "object" && l.formation) ||
            l.formation_detail ||
            l.formation_details ||
            null;
          return {
            id: l.id ?? l.pk,
            user: fmtUser(userObj ?? l.user ?? null),
            formation: fmtFormation(formationObj ?? l.formation ?? null),
          };
        });
        setLinks(mapped);

        // Totals returned by the API when paginated
        const total =
          typeof data?.count === "number"
            ? data.count
            : // fallback approximatif si pas de count
              (data?.next || data?.previous)
            ? (p + (data?.next ? 1 : 0)) * pageSize
            : raw.length;

        setLinksTotal(total);
        setPageCount(Math.max(1, Math.ceil(total / pageSize)));
      } catch (e) {
        if (!task.isAbortError(e)) setLinksError(String(e?.message || e));
      } finally {
        task.done();
        setLinksLoading(false);
      }
    },
    [fetchJSON, startTask, fmtUser, fmtFormation, filterUser, filterFormation, pageSize, searchTrigger]
  );

  // initial
  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadBootstrap();
      if (mounted) await loadLinks(1);
    })();
    return () => {
      mounted = false;
    };
  }, [loadBootstrap, loadLinks]);

  // reset page si filtres / pageSize / recherche changent
  useEffect(() => {
    setPage(1);
  }, [filterUser, filterFormation, pageSize, searchTrigger]);

  // recharge quand page change
  useEffect(() => {
    loadLinks(page);
  }, [page, loadLinks]);

  // options filtres
  const userOptions = useMemo(
    () =>
      (users || []).map((u) => ({
        value: u.id,
        label: u.username || u.email || `user#${u.id}`,
      })),
    [users]
  );
  const formationOptions = useMemo(
    () => (formations || []).map((f) => ({ value: f.id, label: f.title })),
    [formations]
  );

  // filtrage client (sur la page courante)
  const filteredLinks = useMemo(() => {
    let arr = links;
    if (filterUser)
      arr = arr.filter((l) => String(l.user?.id) === String(filterUser));
    if (filterFormation)
      arr = arr.filter(
        (l) => String(l.formation?.id) === String(filterFormation)
      );
    if (searchTrigger) {
      const q = searchTrigger;
      arr = arr.filter(
        (l) =>
          (l.user?.username ?? "").toLowerCase().includes(q) ||
          (l.user?.email ?? "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [links, filterUser, filterFormation, searchTrigger]);

  // actions
  const onSubmitAdd = useCallback(
    async (e) => {
      e.preventDefault();
      if (!addUserId || !addFormationId) return;
      setBusy(true);
      setAddError("");
      try {
        const csrf = await ensureCsrf();
        const res = await fetch(`${API_BASE}/user-formations/`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
          body: JSON.stringify({
            user: Number(addUserId),
            formation: Number(addFormationId),
          }),
        });
        
        if (!res.ok) {
          // Essayer de lire le message d'erreur de l'API
          let errorMessage = `Erreur HTTP ${res.status}`;
          try {
            const errorData = await res.json();
            const errorText = 
              errorData?.detail ||
              errorData?.message ||
              errorData?.error ||
              (Array.isArray(errorData?.non_field_errors) && errorData.non_field_errors[0]) ||
              (typeof errorData === "string" ? errorData : null);
            
            if (errorText) {
              errorMessage = errorText;
            }
            
            // Detect duplicate-enrollment errors
            const errorLower = errorMessage.toLowerCase();
            if (
              res.status === 400 ||
              res.status === 409 ||
              errorLower.includes("déjà") ||
              errorLower.includes("deja") ||
              errorLower.includes("already") ||
              errorLower.includes("exists") ||
              errorLower.includes("unique") ||
              errorLower.includes("duplicate")
            ) {
              errorMessage = t.personnel_already_registered;
            }
          } catch (_parseError) {
            // If JSON can't be parsed, fall back to the default message
            if (res.status === 400 || res.status === 409) {
              errorMessage = t.personnel_already_registered;
            }
          }
          throw new Error(errorMessage);
        }
        
        setAddUserId(null);
        setAddFormationId(null);
        setAddError("");
        await loadLinks(page);
      } catch (e2) {
        const errorMsg = String(e2.message || e2);
        setAddError(errorMsg);
      } finally {
        setBusy(false);
      }
    },
    [addUserId, addFormationId, loadLinks, page]
  );

  const removeLink = useCallback(
    async (id) => {
      if (!id) return;
      setBusy(true);
      try {
        const csrf = await ensureCsrf();
        const res = await fetch(`${API_BASE}/user-formations/${id}/`, {
          method: "DELETE",
          credentials: "include",
          headers: { "X-CSRFToken": csrf },
        });
        if (!res.ok)
          throw new Error(
            `HTTP ${res.status} DELETE /user-formations/${id}/`
          );
        setLinks((prev) => prev.filter((l) => l.id !== id));
        // on ne touche pas linksTotal ici — optionnel: recharger la page pour exactitude
      } catch (e) {
        setLinksError(String(e.message || e));
      } finally {
        setBusy(false);
      }
    },
    [page]
  );

  // guards
  if (!user) return <div className="p-6">{t.common_please_login}</div>;
  if (!hasPersonnelRole(user))
    return (
      <div className="p-6 text-red-600">
        {t.common_access_denied}
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title={t.personnel_title}
        subtitle={t.personnel_access_reserved}
        icon={() => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 7h2a4 4 0 0 1 0 8H8"/><path d="M16 17h-2a4 4 0 0 1 0-8h2"/><path d="M9 12h6"/></svg>}
        iconBg={isDark ? "bg-primary/10 text-primary" : "bg-purple-100 text-purple-600"}
        isDark={isDark}
      >
        <Pill color="primary" variant="soft" size="md">{usersTotal} {t.personnel_users}</Pill>
        <Pill color="info" variant="soft" size="md">{formationsTotal} {t.personnel_formations}</Pill>
        <Pill color="success" variant="soft" size="md">{linksTotal} {t.personnel_links}</Pill>
      </AdminPageHeader>

      {bootError && (
        <div
          className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {bootError}
          <div className="mt-2">
            <button
              className="rounded-xl border px-3 py-1 text-sm"
              onClick={loadBootstrap}
              disabled={bootLoading}
            >
              {t.personnel_reload_users}
            </button>
          </div>
        </div>
      )}

      {linksError && (
        <div
          className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {linksError}
          <div className="mt-2">
            <button
              className="rounded-xl border px-3 py-1 text-sm"
              onClick={() => loadLinks(page)}
              disabled={linksLoading}
            >
              {t.personnel_reload_links}
            </button>
          </div>
        </div>
      )}

      <FiltersBar
        userOptions={userOptions}
        formationOptions={formationOptions}
        filterUser={filterUser}
        setFilterUser={setFilterUser}
        filterFormation={filterFormation}
        setFilterFormation={setFilterFormation}
        searchUser={searchUser}
        setSearchUser={setSearchUser}
      />

      <div className="flex items-center justify-end">
        <PageSizer pageSize={pageSize} onChange={setPageSize} />
      </div>

      <AddUserFormationForm
        addUserId={addUserId}
        setAddUserId={(value) => {
          setAddUserId(value);
          if (addError) setAddError("");
        }}
        addFormationId={addFormationId}
        setAddFormationId={(value) => {
          setAddFormationId(value);
          if (addError) setAddError("");
        }}
        onSubmit={onSubmitAdd}
        busy={busy}
        error={addError}
      />

      <UserFormationTable
        loading={linksLoading}
        error={linksError}
        links={links}
        filteredLinks={filteredLinks}
        onRemove={removeLink}
        busy={busy}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
      />

      <div className="mt-4">
        <Pagination
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          theme={theme}
        />
      </div>

      <AdminAccessFooter allowedRoles={PERSONNEL_ROLE} />
    </div>
  );
}
