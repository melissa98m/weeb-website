import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

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
  const staffFallback = !!u.is_staff; // optionnel

  return inCommercial || inPersonnel || flags || staffFallback;
};
/* -------------------------------------------------- */

export default function Messages() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();

  const t = useMemo(
    () =>
      language === "fr"
        ? {
            title: "Messages",
            no_access: "Vous n’avez pas l’autorisation d’accéder à cette page.",
            loading: "Chargement…",
            error: "Une erreur est survenue lors du chargement des messages.",
            empty: "Aucun message pour le moment.",
            user: "Nom",
            phone: "Téléphone",
            email: "Email",
            subject: "Sujet",
            message: "Message",
            to_process: "À traiter",
            processed: "Traité",
            mark_done: "Marquer comme traité",
            sort_by: "Trier par",
            sort_priority: "Priorité (par défaut)",
            sort_recent: "Plus récents",
            sort_to_process: "À traiter",
            yes: "Oui",
            no: "Non",
          }
        : {
            title: "Messages",
            no_access: "You are not allowed to access this page.",
            loading: "Loading…",
            error: "An error occurred while loading messages.",
            empty: "No message yet.",
            user: "Name",
            phone: "Phone",
            email: "Email",
            subject: "Subject",
            message: "Message",
            to_process: "To process",
            processed: "Processed",
            mark_done: "Mark as processed",
            sort_by: "Sort by",
            sort_priority: "Priority (default)",
            sort_recent: "Most recent",
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
  const [sort, setSort] = useState("priority"); // priority | recent | to_process

  const fetchMessages = useCallback(async () => {
    if (!canSee) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API_BASE}/messages/`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];

      // Normalisation (supporte subject = id OU objet, variations *_detail(s))
      const normalized = list.map((it) => {
        const subjectObj =
          (typeof it.subject === "object" && it.subject) ||
          it.subject_detail ||
          it.subject_details ||
          null;

        const subjectName =
          subjectObj?.name ||
          subjectObj?.title ||
          (typeof it.subject === "number" ? `#${it.subject}` : "—");

        const first = it.first_name || it.firstname || it.firstName || "";
        const last = it.last_name || it.lastname || it.lastName || "";
        const fullName = `${first} ${last}`.trim() || "—";

        const phone =
          it.telephone ||
          it.phone ||
          it.phone_number ||
          "—";

        const email =
          it.email ||
          it.mail ||
          it.contact_email ||
          "—";

        return {
          id: it.id ?? it.pk ?? null,
          name: fullName,
          phone,
          email,
          subjectId: typeof it.subject === "number" ? it.subject : subjectObj?.id ?? null,
          subjectName,
          message_content: it.message_content ?? it.message ?? "",
          is_processed: !!it.is_processed,
          created_at: it.created_at || it.createdAt || null,
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
    fetchMessages();
  }, [fetchMessages]);

  const sorted = useMemo(() => {
    const arr = [...items];
    switch (sort) {
      case "recent":
        arr.sort((a, b) => {
          const ta = a.created_at ? Date.parse(a.created_at) : 0;
          const tb = b.created_at ? Date.parse(b.created_at) : 0;
          return tb - ta; // plus récents d'abord
        });
        break;
      case "to_process":
        // non traités (is_processed=false) en haut
        arr.sort((a, b) => Number(a.is_processed) - Number(b.is_processed));
        break;
      default:
        // PRIORITÉ: d’abord non traités
        arr.sort((a, b) => Number(a.is_processed) - Number(b.is_processed));
    }
    return arr;
  }, [items, sort]);

  const markProcessed = async (row) => {
    if (!row?.id) return;
    try {
      const res = await fetch(`${API_BASE}/messages/${row.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_processed: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Optimistic update
      setItems((prev) =>
        prev.map((it) => (it.id === row.id ? { ...it, is_processed: true } : it))
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
            <option value="recent">{t.sort_recent}</option>
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
                  <th className="text-left px-4 py-2 border-b">{t.subject}</th>
                  <th className="text-left px-4 py-2 border-b">{t.to_process}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.id ?? `${row.email}-${row.created_at}`}>
                    <td className="px-4 py-2 border-b align-top">
                      <div className="font-medium">{row.name}</div>
                      {row.message_content && (
                        <div
                          className={
                            theme === "dark" ? "text-white/70" : "text-gray-600"
                          }
                        >
                          “{row.message_content}”
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b align-top">{row.phone}</td>
                    <td className="px-4 py-2 border-b align-top">{row.email}</td>
                    <td className="px-4 py-2 border-b align-top">
                      {row.subjectName}
                    </td>
                    <td className="px-4 py-2 border-b align-top">
                      {row.is_processed ? (
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
