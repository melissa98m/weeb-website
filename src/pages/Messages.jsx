import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import AdminAccessFooter from "../components/admin/AdminAccessFooter";
import { STAFF_ROLES, hasAnyStaffRole } from "../utils/roles";
import { getEnv } from "../lib/env";
import { ensureCsrf } from "../lib/api";

const API_BASE = (() => {
  const raw = getEnv("VITE_API_URL", "http://localhost:8000") + "";
  const base = raw.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
})();

const STATUS_COLORS = {
  nouveau:  { light: "bg-amber-100 text-amber-800",   dark: "bg-amber-600/20 text-amber-300" },
  en_cours: { light: "bg-blue-100 text-blue-800",     dark: "bg-blue-600/20 text-blue-300" },
  resolu:   { light: "bg-green-100 text-green-800",   dark: "bg-green-600/20 text-green-300" },
};
const STATUS_LABELS = {
  fr: { nouveau: "Nouveau", en_cours: "En cours", resolu: "Résolu" },
  en: { nouveau: "New",     en_cours: "In progress", resolu: "Resolved" },
};

function StatusBadge({ status, theme }) {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.nouveau;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${theme === "dark" ? colors.dark : colors.light}`}>
      {STATUS_LABELS.fr[status] ?? status}
    </span>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();

  const t = useMemo(
    () =>
      language === "fr"
        ? {
            title: "Messages",
            no_access: "Vous n'avez pas l'autorisation d'accéder à cette page.",
            loading: "Chargement…",
            error: "Une erreur est survenue lors du chargement des messages.",
            empty: "Aucun message pour le moment.",
            user: "Nom",
            phone: "Téléphone",
            email: "Email",
            subject: "Sujet",
            message: "Message",
            status: "Statut",
            assigned: "Assigné à",
            reply: "Réponse",
            to_process: "À traiter",
            processed: "Traité",
            mark_done: "Marquer comme traité",
            sort_by: "Trier par",
            sort_priority: "Priorité (par défaut)",
            sort_recent: "Plus récents",
            sort_to_process: "À traiter",
            filter_status: "Filtrer",
            filter_all: "Tous",
            btn_reply: "Répondre",
            btn_save: "Enregistrer",
            btn_cancel: "Annuler",
            reply_placeholder: "Saisir une réponse interne…",
            replied_at: "Répondu le",
            assign_to_me: "M'assigner",
            unassign: "Désassigner",
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
            status: "Status",
            assigned: "Assigned to",
            reply: "Reply",
            to_process: "To process",
            processed: "Processed",
            mark_done: "Mark as processed",
            sort_by: "Sort by",
            sort_priority: "Priority (default)",
            sort_recent: "Most recent",
            sort_to_process: "To process",
            filter_status: "Filter",
            filter_all: "All",
            btn_reply: "Reply",
            btn_save: "Save",
            btn_cancel: "Cancel",
            reply_placeholder: "Enter an internal reply…",
            replied_at: "Replied on",
            assign_to_me: "Assign to me",
            unassign: "Unassign",
          },
    [language]
  );

  const canSee = hasAnyStaffRole(user);

  const panel =
    theme === "dark"
      ? "bg-[#262626] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";
  const headRow = theme === "dark" ? "bg-[#232323]" : "bg-gray-50";
  const muted = theme === "dark" ? "text-white/70" : "text-gray-600";
  const btnPrimary =
    theme === "dark"
      ? "bg-secondary text-white hover:brightness-110"
      : "bg-primary text-dark hover:brightness-110";
  const btnGhost =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333] hover:bg-[#222]"
      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50";
  const inputCls =
    theme === "dark"
      ? "bg-[#1c1c1c] border-[#444] text-white placeholder-white/40"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [sort, setSort] = useState("priority");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [replyDraft, setReplyDraft] = useState({});
  const [saving, setSaving] = useState({});

  const fetchMessages = useCallback(async () => {
    if (!canSee) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API_BASE}/messages/`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];

      const normalized = list.map((it) => {
        const subjectObj =
          (typeof it.subject === "object" && it.subject) ||
          it.subject_detail ||
          null;
        const subjectName =
          subjectObj?.name || subjectObj?.title ||
          (typeof it.subject === "number" ? `#${it.subject}` : "—");
        const first = it.first_name || "";
        const last = it.last_name || "";
        return {
          id: it.id ?? null,
          name: `${first} ${last}`.trim() || "—",
          phone: it.telephone || "—",
          email: it.email || "—",
          subjectName,
          message_content: it.message_content ?? "",
          is_processed: !!it.is_processed,
          status: it.status || "nouveau",
          assigned_to: it.assigned_to ?? null,
          assigned_to_detail: it.assigned_to_detail ?? null,
          reply_content: it.reply_content || "",
          replied_at: it.replied_at || null,
          created_at: it.created_at || null,
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

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const patch = useCallback(async (id, payload) => {
    const csrf = await ensureCsrf();
    const res = await fetch(`${API_BASE}/messages/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, []);

  const updateItem = useCallback((id, changes) => {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, ...changes } : it));
  }, []);

  const changeStatus = async (row, newStatus) => {
    try {
      await patch(row.id, {
        status: newStatus,
        is_processed: newStatus === "resolu",
      });
      updateItem(row.id, {
        status: newStatus,
        is_processed: newStatus === "resolu",
      });
    } catch (e) { console.error(e); }
  };

  const toggleAssign = async (row) => {
    const newAssigned = row.assigned_to === user?.id ? null : user?.id;
    try {
      const updated = await patch(row.id, { assigned_to: newAssigned });
      updateItem(row.id, {
        assigned_to: updated.assigned_to,
        assigned_to_detail: updated.assigned_to_detail,
      });
    } catch (e) { console.error(e); }
  };

  const saveReply = async (id) => {
    const content = replyDraft[id] ?? items.find((it) => it.id === id)?.reply_content ?? "";
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const updated = await patch(id, { reply_content: content });
      updateItem(id, { reply_content: updated.reply_content, replied_at: updated.replied_at });
      setReplyDraft((d) => { const n = { ...d }; delete n[id]; return n; });
    } catch (e) { console.error(e); }
    finally { setSaving((s) => ({ ...s, [id]: false })); }
  };

  const filtered = useMemo(() => {
    let arr = [...items];
    if (filterStatus !== "all") arr = arr.filter((it) => it.status === filterStatus);
    switch (sort) {
      case "recent":
        arr.sort((a, b) => (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0));
        break;
      case "to_process":
        arr.sort((a, b) => Number(a.is_processed) - Number(b.is_processed));
        break;
      default:
        arr.sort((a, b) => Number(a.is_processed) - Number(b.is_processed));
    }
    return arr;
  }, [items, sort, filterStatus]);

  if (!canSee) {
    return (
      <main className="pt-[34px] md:pt-[58px] bg-background text-white p-6">
        <div className={`rounded-xl border p-6 ${panel}`}>
          <h1 className="text-xl font-semibold mb-2">{t.title}</h1>
          <p className={muted}>{t.no_access}</p>
        </div>
      </main>
    );
  }

  const renderState = (content, tone = "muted") => (
    <div className={`p-4 text-sm ${tone === "error" ? (theme === "dark" ? "text-red-400" : "text-red-600") : muted}`}>
      {content}
    </div>
  );

  /* ---- Expanded detail row (desktop) ---- */
  const DetailRow = ({ row }) => {
    const draft = replyDraft[row.id] ?? row.reply_content;
    const isDirty = replyDraft[row.id] !== undefined && replyDraft[row.id] !== row.reply_content;
    return (
      <tr className={theme === "dark" ? "bg-[#1e1e1e]" : "bg-gray-50"}>
        <td colSpan={6} className="px-4 py-3">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {/* Message complet */}
            <div>
              <div className={`font-medium mb-1 ${muted}`}>{t.message}</div>
              <p className="whitespace-pre-wrap break-words">{row.message_content || "—"}</p>
            </div>
            {/* Réponse interne */}
            <div>
              <div className={`font-medium mb-1 ${muted}`}>{t.reply}</div>
              <textarea
                rows={3}
                value={draft}
                onChange={(e) => setReplyDraft((d) => ({ ...d, [row.id]: e.target.value }))}
                placeholder={t.reply_placeholder}
                className={`w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-1 ${inputCls}`}
              />
              {row.replied_at && (
                <p className={`text-xs mt-1 ${muted}`}>
                  {t.replied_at} {new Date(row.replied_at).toLocaleString()}
                </p>
              )}
              {isDirty && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => saveReply(row.id)}
                    disabled={saving[row.id]}
                    className={`px-3 py-1 rounded-md text-xs transition ${btnPrimary}`}
                  >
                    {saving[row.id] ? "…" : t.btn_save}
                  </button>
                  <button
                    onClick={() => setReplyDraft((d) => { const n = { ...d }; delete n[row.id]; return n; })}
                    className={`px-3 py-1 rounded-md border text-xs transition ${btnGhost}`}
                  >
                    {t.btn_cancel}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions statut + assignation */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-current/10">
            {["nouveau", "en_cours", "resolu"].map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(row, s)}
                className={`px-3 py-1 rounded-full text-xs border transition ${
                  row.status === s
                    ? (theme === "dark" ? "border-white/40 font-semibold" : "border-gray-500 font-semibold")
                    : (theme === "dark" ? "border-[#444] hover:bg-[#333]" : "border-gray-200 hover:bg-gray-100")
                }`}
              >
                <StatusBadge status={s} theme={theme} />
              </button>
            ))}
            <button
              onClick={() => toggleAssign(row)}
              className={`ml-auto px-3 py-1 rounded-md border text-xs transition ${btnGhost}`}
            >
              {row.assigned_to === user?.id ? t.unassign : t.assign_to_me}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <main className="pt-[34px] md:pt-[58px] bg-background text-white p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold">{t.title}</h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtre statut */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-2 py-1 rounded-md border text-sm ${theme === "dark" ? "bg-[#1c1c1c] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200"}`}
            aria-label={t.filter_status}
          >
            <option value="all">{t.filter_all}</option>
            <option value="nouveau">{STATUS_LABELS.fr.nouveau}</option>
            <option value="en_cours">{STATUS_LABELS.fr.en_cours}</option>
            <option value="resolu">{STATUS_LABELS.fr.resolu}</option>
          </select>

          {/* Tri */}
          <label className="text-sm sr-only">{t.sort_by}</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={`px-2 py-1 rounded-md border text-sm ${theme === "dark" ? "bg-[#1c1c1c] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200"}`}
          >
            <option value="priority">{t.sort_priority}</option>
            <option value="recent">{t.sort_recent}</option>
            <option value="to_process">{t.sort_to_process}</option>
          </select>
        </div>
      </div>

      <section className={`rounded-2xl border ${panel}`}>
        {/* Mobile cards */}
        <div className="md:hidden">
          {loading ? renderState(t.loading)
            : err ? renderState(t.error, "error")
            : filtered.length === 0 ? renderState(t.empty)
            : (
              <ul className="divide-y" role="list">
                {filtered.map((row) => {
                  const isOpen = expandedId === row.id;
                  const draft = replyDraft[row.id] ?? row.reply_content;
                  const isDirty = replyDraft[row.id] !== undefined && replyDraft[row.id] !== row.reply_content;
                  return (
                    <li key={row.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium break-words">{row.name}</div>
                          <div className={`text-sm ${muted} break-words`}>{row.email} • {row.phone}</div>
                        </div>
                        <StatusBadge status={row.status} theme={theme} />
                      </div>

                      {row.assigned_to_detail && (
                        <p className={`text-xs mt-1 ${muted}`}>{t.assigned}: {row.assigned_to_detail.username}</p>
                      )}

                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => setExpandedId(isOpen ? null : row.id)}
                          className={`px-3 py-1 rounded-md border text-xs transition ${btnGhost}`}
                        >
                          {isOpen ? t.btn_cancel : t.btn_reply}
                        </button>
                      </div>

                      {isOpen && (
                        <div className="mt-3 space-y-2">
                          <p className={`text-sm ${muted} break-words`}>{row.message_content}</p>
                          <textarea
                            rows={3}
                            value={draft}
                            onChange={(e) => setReplyDraft((d) => ({ ...d, [row.id]: e.target.value }))}
                            placeholder={t.reply_placeholder}
                            className={`w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 ${inputCls}`}
                          />
                          <div className="flex flex-wrap gap-1">
                            {["nouveau", "en_cours", "resolu"].map((s) => (
                              <button key={s} onClick={() => changeStatus(row, s)} className={`text-xs ${row.status === s ? "font-semibold underline" : ""}`}>
                                <StatusBadge status={s} theme={theme} />
                              </button>
                            ))}
                          </div>
                          {isDirty && (
                            <button onClick={() => saveReply(row.id)} disabled={saving[row.id]} className={`px-3 py-1 rounded-md text-xs ${btnPrimary}`}>
                              {saving[row.id] ? "…" : t.btn_save}
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm" aria-busy={loading ? "true" : "false"}>
            <thead>
              <tr className={`${headRow} text-left`}>
                <th className="px-4 py-2 font-medium">{t.user}</th>
                <th className="px-4 py-2 font-medium">{t.email}</th>
                <th className="px-4 py-2 font-medium">{t.subject}</th>
                <th className="px-4 py-2 font-medium">{t.status}</th>
                <th className="px-4 py-2 font-medium">{t.assigned}</th>
                <th className="px-4 py-2 font-medium w-10" aria-label="Détail" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-2" colSpan={6}>{t.loading}</td></tr>
              ) : err ? (
                <tr><td className="px-4 py-2 text-red-500" colSpan={6}>{t.error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className={`px-4 py-2 ${muted}`} colSpan={6}>{t.empty}</td></tr>
              ) : (
                filtered.flatMap((row) => {
                  const isOpen = expandedId === row.id;
                  return [
                    <tr
                      key={row.id}
                      className={`border-t border-gray-200 dark:border-[#333] cursor-pointer hover:${theme === "dark" ? "bg-[#2a2a2a]" : "bg-gray-50"}`}
                      onClick={() => setExpandedId(isOpen ? null : row.id)}
                    >
                      <td className="px-4 py-2">
                        <div className="font-medium truncate">{row.name}</div>
                        <div className={`text-xs ${muted}`}>{row.phone}</div>
                      </td>
                      <td className="px-4 py-2 truncate max-w-[160px]">{row.email}</td>
                      <td className="px-4 py-2 truncate max-w-[120px]">{row.subjectName}</td>
                      <td className="px-4 py-2"><StatusBadge status={row.status} theme={theme} /></td>
                      <td className={`px-4 py-2 text-xs ${muted}`}>
                        {row.assigned_to_detail?.username ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-center text-lg select-none">
                        {isOpen ? "▲" : "▼"}
                      </td>
                    </tr>,
                    isOpen && <DetailRow key={`detail-${row.id}`} row={row} />,
                  ];
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {err && (
        <div className="mt-3">
          <button onClick={fetchMessages} className={`rounded-xl border px-3 py-1 text-sm ${btnGhost}`}>
            Recharger
          </button>
        </div>
      )}
      <AdminAccessFooter allowedRoles={STAFF_ROLES} />
    </main>
  );
}
