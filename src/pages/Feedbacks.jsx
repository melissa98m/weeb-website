import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import AdminAccessFooter from "../components/admin/AdminAccessFooter";
import PageSizer from "../components/ui/PageSizer";
import Pagination from "../components/ui/Pagination";
import { STAFF_ROLES } from "../utils/roles";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

/* ----- Helper rôles (Commercial ou Personnel) ----- */
const hasAnyStaffRole = (u) => {
  if (!u) return false;
  const toLower = (s) => String(s || "").toLowerCase();

  const collected = [];
  if (Array.isArray(u.groups)) {
    for (const g of u.groups) {
      if (g && typeof g === "object" && g.name) collected.push(g.name);
      else if (typeof g === "string") collected.push(g);
    }
  }
  if (Array.isArray(u.group_names)) collected.push(...u.group_names);
  if (Array.isArray(u.roles)) collected.push(...u.roles);
  if (u.role) collected.push(u.role);
  if (u.profile?.group?.name) collected.push(u.profile.group.name);

  const set = new Set(collected.map(toLower));
  const inCommercial = set.has("commercial");
  const inPersonnel = set.has("personnel");

  const flags = !!(u.is_commercial || u.is_personnel);
  const staffFallback = !!u.is_staff;

  return inCommercial || inPersonnel || flags || staffFallback;
};
/* ----------------------------------------------------------------------------- */

export default function Feedback() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();

  const t = useMemo(
    () =>
      language === "fr"
        ? {
            title: "Feedback",
            no_access: "Vous n’avez pas l’autorisation d’accéder à cette page.",
            loading: "Chargement…",
            error: "Une erreur est survenue lors du chargement des feedbacks.",
            empty: "Aucun feedback pour le moment.",
            user: "Utilisateur",
            phone: "Téléphone",
            email: "Email",
            formation: "Formation",
            satisfaction: "Satisfaction",
            confidence: "Confiance",
            to_process: "À traiter",
            mark_done: "Marquer comme traité",
            processed: "Traité",
            sort_by: "Trier par",
            sort_priority: "Priorité (par défaut)",
            sort_satisfaction: "Satisfaction",
            sort_to_process: "À traiter",
            yes: "Oui",
            no: "Non",
          }
        : {
            title: "Feedback",
            no_access: "You are not allowed to access this page.",
            loading: "Loading…",
            error: "An error occurred while loading feedbacks.",
            empty: "No feedback yet.",
            user: "User",
            phone: "Phone",
            email: "Email",
            formation: "Training",
            satisfaction: "Satisfaction",
            confidence: "Confidence",
            to_process: "To process",
            mark_done: "Mark as processed",
            processed: "Processed",
            sort_by: "Sort by",
            sort_priority: "Priority (default)",
            sort_satisfaction: "Satisfaction",
            sort_to_process: "To process",
            yes: "Yes",
            no: "No",
          },
    [language]
  );

  const canSee = hasAnyStaffRole(user);

  const card =
    theme === "dark"
      ? "bg-[#262626] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";
  const headRow = theme === "dark" ? "bg-[#232323]" : "bg-gray-50";
  const muted = theme === "dark" ? "text-white/70" : "text-gray-600";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [sort, setSort] = useState("priority"); // priority | satisfaction | to_process
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchFeedbacks = useCallback(async () => {
    if (!canSee) return;
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("page_size", String(pageSize));
      const res = await fetch(`${API_BASE}/feedbacks/?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];

      const normalized = list.map((it) => {
        const userObj =
          (typeof it.user === "object" && it.user) ||
          it.user_detail ||
          it.user_details ||
          null;

        const formationObj =
          (typeof it.formation === "object" && it.formation) ||
          it.formation_detail ||
          it.formation_details ||
          null;

        const userName =
          userObj?.first_name || userObj?.last_name
            ? `${userObj?.first_name ?? ""} ${userObj?.last_name ?? ""}`.trim()
            : userObj?.username || `#${it.user}`;

        const email =
          userObj?.email ||
          userObj?.mail ||
          userObj?.contact_email ||
          "—";

        const phone =
          userObj?.phone ||
          userObj?.telephone ||
          userObj?.phone_number ||
          userObj?.profile?.phone ||
          "—";

        const formationName = formationObj?.name || `#${it.formation}`;

        const confidenceRaw = it.confidence ?? it.confidence_score ?? null;
        const confidenceParsed =
          confidenceRaw === null || confidenceRaw === undefined
            ? null
            : Number(confidenceRaw);
        const confidence = Number.isFinite(confidenceParsed) ? confidenceParsed : null;

        return {
          id: it.id ?? it.pk ?? null,
          userId: typeof it.user === "number" ? it.user : userObj?.id ?? null,
          userName,
          email,
          phone,
          formationId:
            typeof it.formation === "number" ? it.formation : formationObj?.id ?? null,
          formationName,
          feedback_content: it.feedback_content ?? "",
          satisfaction: !!it.satisfaction,
          to_process: !!it.to_process,
          confidence,
          raw: it,
        };
      });

      setItems(normalized);
      const total =
        typeof data?.count === "number"
          ? data.count
          : data?.next || data?.previous
          ? (page + (data?.next ? 1 : 0)) * pageSize
          : normalized.length;
      setPageCount(Math.max(1, Math.ceil(total / pageSize)));
    } catch (e) {
      setErr(e);
      setItems([]);
      setPageCount(1);
    } finally {
      setLoading(false);
    }
  }, [canSee, page, pageSize]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const sorted = useMemo(() => {
    const arr = [...items];
    switch (sort) {
      case "satisfaction":
        arr.sort((a, b) => Number(a.satisfaction) - Number(b.satisfaction));
        break;
      case "to_process":
        arr.sort((a, b) => Number(a.to_process) - Number(b.to_process));
        break;
      default:
        arr.sort((a, b) => {
          const aKey = (a.satisfaction ? 1 : 0) + (a.to_process ? 1 : 0);
          const bKey = (b.satisfaction ? 1 : 0) + (b.to_process ? 1 : 0);
          return aKey - bKey;
        });
    }
    return arr;
  }, [items, sort]);

  const markProcessed = async (row) => {
    if (!row?.id) return;
    try {
      const res = await fetch(`${API_BASE}/feedbacks/${row.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ to_process: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems((prev) =>
        prev.map((it) => (it.id === row.id ? { ...it, to_process: true } : it))
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (!canSee) {
    return (
      <main className="px-6 py-16 max-w-5xl mx-auto">
        <div className={`rounded-xl border p-6 ${card}`}>
          <h1 className="text-xl font-semibold mb-2">{t.title}</h1>
          <p className={theme === "dark" ? "text-white/70" : "text-gray-600"}>
            {t.no_access}
          </p>
        </div>
      </main>
    );
  }

  /* ---------- Mobile: liste en cartes (avec Satisfaction) ---------- */
  const MobileList = () => (
    <div className="md:hidden">
      {loading ? (
        <div className="p-4 text-sm opacity-80">{t.loading}</div>
      ) : err ? (
        <div className="p-4 text-sm text-red-600 dark:text-red-400">
          {t.error}
        </div>
      ) : sorted.length === 0 ? (
        <div className="p-4 text-sm opacity-80">{t.empty}</div>
      ) : (
        <ul className="divide-y first:divide-y-0" role="list">
          {sorted.map((row) => {
            const satCls = row.satisfaction
              ? theme === "dark"
                ? "bg-green-600/20 text-green-400"
                : "bg-green-100 text-green-700"
              : theme === "dark"
              ? "bg-red-600/20 text-red-400"
              : "bg-red-100 text-red-700";
            const confVal = row.confidence;
            const confOk = typeof confVal === "number" && confVal >= 0.7;
            const confCls =
              typeof confVal === "number"
                ? confOk
                  ? theme === "dark"
                    ? "bg-green-600/20 text-green-400"
                    : "bg-green-100 text-green-700"
                  : theme === "dark"
                  ? "bg-orange-600/20 text-orange-400"
                  : "bg-orange-100 text-orange-700"
                : theme === "dark"
                ? "bg-gray-700 text-white/80"
                : "bg-gray-100 text-gray-700";
            const confText =
              typeof confVal === "number" ? confVal.toFixed(2) : "—";
            return (
              <li
                key={row.id ?? `${row.userId}-${row.formationId}`}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium whitespace-normal break-words">
                      {row.userName}
                    </div>
                    {/* Satisfaction badge en mobile */}
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${satCls}`}>
                        {t.satisfaction}: {row.satisfaction ? t.yes : t.no}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${confCls}`}>
                        {t.confidence}: {confText}
                      </span>
                    </div>
                  </div>
                </div>

                {row.feedback_content && (
                  <div className={`mt-2 text-sm ${muted} whitespace-normal break-words`}>
                    “{row.feedback_content}”
                  </div>
                )}
                <div className={`mt-1 text-xs ${muted} whitespace-normal break-words`}>
                  {row.email} · {row.phone}
                </div>
                <div className="mt-1 text-xs whitespace-normal break-words">
                  {t.formation}: {row.formationName}
                </div>

                <div className="mt-3">
                  {row.to_process ? (
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        theme === "dark"
                          ? "bg-gray-700 text-white/80"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {t.processed}
                    </span>
                  ) : (
                    <button
                      onClick={() => markProcessed(row)}
                      className={`px-3 py-1.5 rounded-md shadow text-xs transition ${
                        theme === "dark"
                          ? "bg-secondary text-white"
                          : "bg-primary text-dark"
                      }`}
                    >
                      {t.mark_done}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  /* ---------- Desktop: tableau fixe sans scroll horizontal ---------- */
  const DesktopTable = () => (
    <div className="hidden md:block overflow-hidden">
      <table
        className="w-full table-fixed border-collapse text-sm"
        aria-busy={loading ? "true" : "false"}
      >
        <colgroup>
          <col className="w-[24%]" />
          <col className="w-[13%]" />
          <col className="w-[21%]" />
          <col className="w-[16%]" />
          <col className="w-[10%]" />
          <col className="w-[8%]" />
          <col className="w-[8%]" />
        </colgroup>
        <thead>
          <tr className={`${headRow} text-left`}>
            <th className="px-4 py-2 font-medium">{t.user}</th>
            <th className="px-4 py-2 font-medium">{t.phone}</th>
            <th className="px-4 py-2 font-medium">{t.email}</th>
            <th className="px-4 py-2 font-medium">{t.formation}</th>
            <th className="px-4 py-2 font-medium">{t.satisfaction}</th>
            <th className="px-4 py-2 font-medium">{t.confidence}</th>
            <th className="px-4 py-2 font-medium">{t.to_process}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td className="px-4 py-2" colSpan={7}>{t.loading}</td></tr>
          ) : err ? (
            <tr><td className="px-4 py-2 text-red-600 dark:text-red-400" colSpan={7}>{t.error}</td></tr>
          ) : sorted.length === 0 ? (
            <tr><td className={`px-4 py-2 ${muted}`} colSpan={7}>{t.empty}</td></tr>
          ) : (
            sorted.map((row) => {
              const satCls = row.satisfaction
                ? theme === "dark"
                  ? "bg-green-600/20 text-green-400"
                  : "bg-green-100 text-green-700"
                : theme === "dark"
                ? "bg-red-600/20 text-red-400"
                : "bg-red-100 text-red-700";
              const confVal = row.confidence;
              const confOk = typeof confVal === "number" && confVal >= 0.7;
              const confCls =
                typeof confVal === "number"
                  ? confOk
                    ? theme === "dark"
                      ? "bg-green-600/20 text-green-400"
                      : "bg-green-100 text-green-700"
                    : theme === "dark"
                    ? "bg-orange-600/20 text-orange-400"
                    : "bg-orange-100 text-orange-700"
                  : theme === "dark"
                  ? "bg-gray-700 text-white/80"
                  : "bg-gray-100 text-gray-700";
              const confText =
                typeof confVal === "number" ? confVal.toFixed(2) : "—";
              return (
                <tr
                  key={row.id ?? `${row.userId}-${row.formationId}`}
                  className="border-t border-gray-200 dark:border-[#333]"
                >
                  <td className="px-4 py-2 align-top">
                    <div className="whitespace-normal break-words">{row.userName}</div>
                    {row.feedback_content && (
                      <div className={`mt-0.5 text-xs ${muted} whitespace-normal break-words`}>
                        “{row.feedback_content}”
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 align-top">
                    <div className="whitespace-normal break-words">{row.phone}</div>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <div className="whitespace-normal break-words">{row.email}</div>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <div className="whitespace-normal break-words">{row.formationName}</div>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <span className={`px-2 py-0.5 rounded text-xs ${satCls}`}>
                      {row.satisfaction ? t.yes : t.no}
                    </span>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <span className={`px-2 py-0.5 rounded text-xs ${confCls}`}>
                      {confText}
                    </span>
                  </td>
                  <td className="px-4 py-2 align-top">
                    {row.to_process ? (
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          theme === "dark"
                            ? "bg-gray-700 text-white/80"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {t.processed}
                      </span>
                    ) : (
                      <button
                        onClick={() => markProcessed(row)}
                        className={`px-3 py-1.5 rounded-md shadow text-xs transition ${
                          theme === "dark"
                            ? "bg-secondary text-white"
                            : "bg-primary text-dark"
                        }`}
                      >
                        {t.mark_done}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <main className="pt-[34px] md:pt-[58px] bg-background text-white p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold">{t.title}</h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm">{t.sort_by}</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={`px-2 py-1 rounded-md border text-sm ${
                theme === "dark"
                  ? "bg-[#1c1c1c] text-white border-[#333]"
                  : "bg-white text-gray-900 border-gray-200"
              }`}
            >
              <option value="priority">{t.sort_priority}</option>
              <option value="satisfaction">{t.sort_satisfaction}</option>
              <option value="to_process">{t.sort_to_process}</option>
            </select>
          </div>
          <PageSizer pageSize={pageSize} onChange={setPageSize} />
        </div>
      </div>

      {/* Card container */}
      <div className={`rounded-xl border shadow ${card}`}>
        {/* Mobile list (avec Satisfaction) */}
        <MobileList />
        {/* Desktop table */}
        <DesktopTable />
      </div>
      <div className="mt-4">
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} theme={theme} />
      </div>
      <AdminAccessFooter allowedRoles={STAFF_ROLES} />
    </main>
  );
}
