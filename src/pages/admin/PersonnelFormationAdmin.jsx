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

import Pill from "../../components/ui/Pill";
import FiltersBar from "../../components/admin/FiltersBar";
import AddUserFormationForm from "../../components/admin/AddUserFormation";
import UserFormationTable from "../../components/admin/UserFormationTable";
import Pagination from "../../components/ui/Pagination";
import PageSizer from "../../components/ui/PageSizer";

// Normalise toujours vers .../api
const API_BASE = (() => {
  const raw = (import.meta.env.VITE_API_URL ?? "http://localhost:8000") + "";
  const base = raw.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
})();

export default function PersonnelFormationAdmin() {
  const { user } = useAuth();
  const { theme } = useTheme();

  // boot (users + formations)
  const [bootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState("");
  const [users, setUsers] = useState([]);
  const [formations, setFormations] = useState([]);

  // liens (user-formations)
  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState("");

  // filtres / recherche
  const [filterUser, setFilterUser] = useState(null);
  const [filterFormation, setFilterFormation] = useState(null);
  const [searchUser, setSearchUser] = useState("");
  const searchQ = useDeferredValue(searchUser.trim().toLowerCase());

  // pagination
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pageSize, setPageSize] = useState(10); // <- défaut 10

  // ajout / suppression
  const [addUserId, setAddUserId] = useState(null);
  const [addFormationId, setAddFormationId] = useState(null);
  const [busy, setBusy] = useState(false);

  // 2 contrôleurs séparés
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
    const t = setTimeout(() => { try { ctrl.abort(); } catch {} }, ms);
    return {
      signal: ctrl.signal,
      done: () => { clearTimeout(t); if (ref.current === ctrl) ref.current = null; },
      isAbortError: (e) => e?.name === "AbortError" || /aborted/i.test(String(e?.message || "")),
    };
  }, []);

  // charge users + formations
  const loadBootstrap = useCallback(async () => {
    setBootLoading(true);
    setBootError("");
    const task = startTask(bootCtrlRef, 15000);
    try {
      const [usersData, formsData] = await Promise.all([
        fetchJSON(`${API_BASE}/users/`, task.signal),
        fetchJSON(`${API_BASE}/formations/`, task.signal),
      ]);
      const usersList = Array.isArray(usersData?.results) ? usersData.results : Array.isArray(usersData) ? usersData : [];
      const formsList = Array.isArray(formsData?.results) ? formsData.results : Array.isArray(formsData) ? formsData : [];
      setUsers(usersList.map(fmtUser));
      setFormations(formsList.map(fmtFormation));
    } catch (e) {
      if (!task.isAbortError(e)) setBootError(String(e?.message || e));
    } finally {
      task.done();
      setBootLoading(false);
    }
  }, [fetchJSON, startTask, fmtUser, fmtFormation]);

  // charge liens (pagination + filtres serveur si dispos)
  const loadLinks = useCallback(async (p = 1) => {
    setLinksLoading(true);
    setLinksError("");
    const task = startTask(linksCtrlRef, 15000);
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("page_size", String(pageSize)); // <- prend la valeur sélectionnée
      // Optionnel pour compat LimitOffset (si jamais activé côté API) :
      // params.set("limit", String(pageSize));
      // params.set("offset", String((p - 1) * pageSize));
      if (filterUser) params.set("user", String(filterUser));
      if (filterFormation) params.set("formation", String(filterFormation));
      // si SearchFilter ajouté côté API : if (searchQ) params.set("search", searchQ);

      const candidates = [
        `${API_BASE}/user-formations/`,
        `${API_BASE}/userformations/`,
        `${API_BASE}/user_formations/`,
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
      if (!data) throw lastErr || new Error("Impossible de charger la ressource user-formations.");

      const raw = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      const mapped = raw.map((l) => {
        const userObj = (typeof l.user === "object" && l.user) || l.user_detail || l.user_details || null;
        const formationObj = (typeof l.formation === "object" && l.formation) || l.formation_detail || l.formation_details || null;
        return {
          id: l.id ?? l.pk,
          user: fmtUser(userObj ?? l.user ?? null),
          formation: fmtFormation(formationObj ?? l.formation ?? null),
        };
      });
      setLinks(mapped);

      // calcule pageCount selon le pageSize actuel
      const total = typeof data?.count === "number"
        ? data.count
        : (data?.next || data?.previous) ? (p + (data?.next ? 1 : 0)) * pageSize : raw.length;
      setPageCount(Math.max(1, Math.ceil(total / pageSize)));
    } catch (e) {
      if (!task.isAbortError(e)) setLinksError(String(e?.message || e));
    } finally {
      task.done();
      setLinksLoading(false);
    }
  }, [fetchJSON, startTask, fmtUser, fmtFormation, filterUser, filterFormation, pageSize /*, searchQ*/]);

  // initial
  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadBootstrap();
      if (mounted) await loadLinks(1);
    })();
    return () => { mounted = false; };
  }, [loadBootstrap, loadLinks]);

  // reset page si filtres OU pageSize changent
  useEffect(() => {
    setPage(1);
  }, [filterUser, filterFormation, pageSize /*, searchQ*/]);

  // recharge quand page change
  useEffect(() => {
    loadLinks(page);
  }, [page, loadLinks]);

  // options filtres
  const userOptions = useMemo(
    () => (users || []).map((u) => ({ value: u.id, label: u.username || u.email || `user#${u.id}` })),
    [users]
  );
  const formationOptions = useMemo(
    () => (formations || []).map((f) => ({ value: f.id, label: f.title })),
    [formations]
  );

  // filtrage client (au cas où tu gardes une recherche côté front)
  const filteredLinks = useMemo(() => {
    let arr = links;
    if (filterUser) arr = arr.filter((l) => String(l.user?.id) === String(filterUser));
    if (filterFormation) arr = arr.filter((l) => String(l.formation?.id) === String(filterFormation));
    if (searchQ) {
      arr = arr.filter(
        (l) =>
          (l.user?.username ?? "").toLowerCase().includes(searchQ) ||
          (l.user?.email ?? "").toLowerCase().includes(searchQ)
      );
    }
    return arr;
  }, [links, filterUser, filterFormation, searchQ]);

  // actions
  const onSubmitAdd = useCallback(
    async (e) => {
      e.preventDefault();
      if (!addUserId || !addFormationId) return;
      setBusy(true);
      try {
        const csrf = await ensureCsrf();
        const res = await fetch(`${API_BASE}/user-formations/`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
          body: JSON.stringify({ user: Number(addUserId), formation: Number(addFormationId) }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} POST /user-formations/`);
        setAddUserId(null);
        setAddFormationId(null);
        await loadLinks(page); // recharge la page courante
      } catch (e2) {
        setLinksError(String(e2.message || e2));
      } finally {
        setBusy(false);
      }
    },
    [addUserId, addFormationId, loadLinks, page]
  );

  const removeLink = useCallback(async (id) => {
    if (!id) return;
    setBusy(true);
    try {
      const csrf = await ensureCsrf();
      const res = await fetch(`${API_BASE}/user-formations/${id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: { "X-CSRFToken": csrf },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} DELETE /user-formations/${id}/`);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      // Option: await loadLinks(page); // si tu veux recalcul strict côté serveur
    } catch (e) {
      setLinksError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }, [page /*, loadLinks*/]);

  // guards
  if (!user) return <div className="p-6">Veuillez vous connecter.</div>;
  if (!hasPersonnelRole(user))
    return <div className="p-6 text-red-600">Accès refusé. Cette page est réservée au personnel.</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start md:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold leading-tight truncate">
            Gestion des formations
          </h1>
          <div className="mt-0.5 text-xs text-gray-500 dark:text-white/60 sm:hidden">
            Accès réservé au personnel
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Pill color="primary" variant="soft" size="md">
            {users.length} utilisateurs
          </Pill>
          <Pill color="info" variant="soft" size="md">
            {formations.length} formations
          </Pill>
          <Pill color="success" variant="soft" size="md">
            {links.length} liens
          </Pill>
        </div>
      </header>

      {bootError && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {bootError}
          <div className="mt-2">
            <button className="rounded-xl border px-3 py-1 text-sm" onClick={loadBootstrap} disabled={bootLoading}>
              Recharger utilisateurs/formations
            </button>
          </div>
        </div>
      )}

      {linksError && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {linksError}
          <div className="mt-2">
            <button className="rounded-xl border px-3 py-1 text-sm" onClick={() => loadLinks(page)} disabled={linksLoading}>
              Recharger les liens
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

      {/* Contrôles de liste : taille de page à droite */}
      <div className="flex items-center justify-end">
        <PageSizer pageSize={pageSize} onChange={setPageSize} />
      </div>

      <AddUserFormationForm
        userOptions={userOptions}
        formationOptions={formationOptions}
        addUserId={addUserId}
        setAddUserId={setAddUserId}
        addFormationId={addFormationId}
        setAddFormationId={setAddFormationId}
        onSubmit={onSubmitAdd}
        busy={busy}
      />

      <UserFormationTable
        loading={linksLoading}
        error={linksError}
        links={links}
        filteredLinks={links}   // pagination serveur -> on affiche directement la page courante
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

      <footer className="text-xs text-gray-500">
        Accès réservé : {PERSONNEL_ROLE.join(", ") || "Personnel"}.
      </footer>
    </div>
  );
}