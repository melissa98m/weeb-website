import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

/* ----- même helper que dans Header pour autoriser Commercial ou Personnel ----- */
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
  const staffFallback = !!u.is_staff; // optionnel

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

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [sort, setSort] = useState("priority"); // priority | satisfaction | to_process

  const fetchFeedbacks = useCallback(async () => {
    if (!canSee) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API_BASE}/feedbacks/`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];

      // Normalisation (supporte user/formation = id OU objet, variation *_detail(s))
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
          raw: it,
        };
      });

      setItems(normalized);
    } catch (e) {
      setErr(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [canSee]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const sorted = useMemo(() => {
    const arr = [...items];
    switch (sort) {
      case "satisfaction":
        // false en haut, puis true
        arr.sort((a, b) => Number(a.satisfaction) - Number(b.satisfaction));
        break;
      case "to_process":
        // false (à traiter) en haut, puis true
        arr.sort((a, b) => Number(a.to_process) - Number(b.to_process));
        break;
      default:
        // PRIORITÉ: d’abord satisfaction=false & to_process=false
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
      // Optimistic update
      setItems((prev) =>
        prev.map((it) => (it.id === row.id ? { ...it, to_process: true } : it))
      );
    } catch (e) {
      console.error(e);
      // TODO: toast d'erreur
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

  return (
    <main className="px-6 py-16 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{t.title}</h1>

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
      </div>

      <div className={`rounded-xl border shadow ${card}`}>
        {/* states */}
        {loading && <div className="p-6 text-sm">{t.loading}</div>}
        {!loading && err && (
          <div className="p-6 text-sm text-red-500">{t.error}</div>
        )}
        {!loading && !err && sorted.length === 0 && (
          <div className="p-6 text-sm">{t.empty}</div>
        )}

        {!loading && !err && sorted.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className={theme === "dark" ? "bg-[#232323]" : "bg-gray-50"}>
                  <th className="text-left px-4 py-2 border-b">{t.user}</th>
                  <th className="text-left px-4 py-2 border-b">{t.phone}</th>
                  <th className="text-left px-4 py-2 border-b">{t.email}</th>
                  <th className="text-left px-4 py-2 border-b">{t.formation}</th>
                  <th className="text-left px-4 py-2 border-b">{t.satisfaction}</th>
                  <th className="text-left px-4 py-2 border-b">{t.to_process}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.id ?? `${row.userId}-${row.formationId}`}>
                    <td className="px-4 py-2 border-b align-top">
                      <div className="font-medium">{row.userName}</div>
                      {row.feedback_content && (
                        <div
                          className={
                            theme === "dark" ? "text-white/70" : "text-gray-600"
                          }
                        >
                          “{row.feedback_content}”
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b align-top">{row.phone}</td>
                    <td className="px-4 py-2 border-b align-top">{row.email}</td>
                    <td className="px-4 py-2 border-b align-top">
                      {row.formationName}
                    </td>
                    <td className="px-4 py-2 border-b align-top">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          row.satisfaction
                            ? theme === "dark"
                              ? "bg-green-600/20 text-green-400"
                              : "bg-green-100 text-green-700"
                            : theme === "dark"
                            ? "bg-red-600/20 text-red-400"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {row.satisfaction ? t.yes : t.no}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b align-top">
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
                          className={`px-3 py-1.5 rounded-md shadow text-xs hover:brightness-110 ${
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
