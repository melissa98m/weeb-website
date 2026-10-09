import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { getCookie } from "../../lib/cookies";
import { API_BASE } from "../../lib/api";
import RichTextEditor from "../../components/admin/RichTextEditor";
import AdminAccessFooter from "../../components/admin/AdminAccessFooter";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import Pagination from "../../components/ui/Pagination";
import PageSizer from "../../components/ui/PageSizer";
import { STAFF_ROLES } from "../../utils/roles";
import adminEn from "../../../locales/en/admin.json";
import adminFr from "../../../locales/fr/admin.json";

function htmlToText(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function Toast({ toast, onClose, t }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!toast) return;
    timerRef.current = setTimeout(onClose, 4000);
    return () => clearTimeout(timerRef.current);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const colors = isSuccess
    ? "bg-green-600 text-white"
    : "bg-red-600 text-white";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      aria-live={isSuccess ? "polite" : "assertive"}
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-xl shadow-lg px-4 py-3 max-w-sm w-full text-sm transition-all ${colors}`}
    >
      <span className="mt-0.5 shrink-0 text-base" aria-hidden="true">
        {isSuccess ? "✅" : "❌"}
      </span>
      <p className="flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        aria-label={t.newsletter_toast_close}
        className="ml-2 shrink-0 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

function ConfirmModal({ open, onConfirm, onCancel, recipientsCount, theme, t }) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;
  const card = theme === "dark" ? "bg-surface border-border text-white" : "bg-white border-gray-200 text-gray-900";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className={`relative rounded-2xl border shadow p-6 max-w-sm w-full ${card}`}
      >
        <h2 id="confirm-modal-title" className="text-lg font-semibold mb-2">{t.newsletter_confirm_title}</h2>
        <p className="text-sm opacity-80 mb-4">
          {t.newsletter_confirm_body.replace('{count}', recipientsCount)}
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border text-sm">
            {t.newsletter_confirm_cancel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg border bg-secondary text-white text-sm hover:brightness-110"
          >
            {t.newsletter_confirm_send}
          </button>
        </div>
      </div>
    </div>
  );
}

function SubscribersList({ theme, t }) {
  const card = theme === "dark" ? "bg-surface-2 border-border text-white" : "bg-white border-gray-200 text-gray-900";
  const inputCls = theme === "dark"
    ? "bg-surface text-white border-border placeholder-white/40"
    : "bg-white text-gray-900 border-gray-200 placeholder-gray-400";
  const mutedCls = theme === "dark" ? "text-white/70" : "text-gray-400";
  const rowHover = theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-50";
  const divider = theme === "dark" ? "divide-[#333]" : "divide-gray-100";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, page_size: pageSize });
      if (search) params.set("search", search);
      const res = await fetch(`${API_BASE}/admin/newsletter/subscribers/?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const formatDate = (iso) => {
    if (!iso) return <span className={mutedCls}>—</span>;
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <section className={`rounded-2xl border ${card}`} aria-labelledby="subscribers-heading">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b ${divider.replace('divide', 'border')}">
        <h2 id="subscribers-heading" className="text-base font-semibold">
          {t.newsletter_subscribers}
          {data && (
            <span className={`ml-2 text-sm font-normal ${mutedCls}`}>
              ({data.count})
            </span>
          )}
        </h2>
        <form onSubmit={handleSearch} role="search" className="flex gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t.newsletter_search_email}
            aria-label={t.newsletter_search_aria}
            className={`rounded-lg border px-3 py-1.5 text-sm w-52 ${inputCls}`}
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg border bg-secondary text-white text-sm hover:brightness-110 transition"
          >
            {t.newsletter_search_btn}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-6 space-y-2" aria-busy="true" aria-label={t.newsletter_loading}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-8 rounded animate-pulse ${theme === "dark" ? "bg-white/10" : "bg-gray-100"}`} />
            ))}
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-red-500" role="alert">{error}</p>
        ) : data?.results?.length === 0 ? (
          <p className={`p-6 text-sm ${mutedCls}`}>
            {search ? t.newsletter_no_results : t.newsletter_no_subscribers}
          </p>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">{t.newsletter_subscribers_table_caption}</caption>
            <thead>
              <tr className={`text-left text-xs uppercase tracking-wide ${mutedCls} border-b ${theme === "dark" ? "border-border" : "border-gray-100"}`}>
                <th scope="col" className="px-4 py-2 font-medium">{t.newsletter_col_email}</th>
                <th scope="col" className="px-4 py-2 font-medium">{t.newsletter_col_subscribed}</th>
                <th scope="col" className="px-4 py-2 font-medium">{t.newsletter_col_last_sent}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${divider}`}>
              {data.results.map((sub) => (
                <tr key={sub.email} className={`transition-colors ${rowHover}`}>
                  <td className="px-4 py-3 font-mono text-xs">{sub.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(sub.consented_at)}</td>
                  <td className={`px-4 py-3 whitespace-nowrap ${!sub.last_sent_at ? mutedCls : ""}`}>
                    {formatDate(sub.last_sent_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && (data.num_pages > 1 || data.count > 5) && (
        <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t ${theme === "dark" ? "border-border" : "border-gray-100"}`}>
          <PageSizer pageSize={pageSize} onChange={(n) => { setPageSize(n); setPage(1); }} />
          <Pagination page={page} pageCount={data.num_pages} onPageChange={setPage} theme={theme} />
        </div>
      )}
    </section>
  );
}

function getStatusLabels(t) {
  return {
    draft:     { label: t.newsletter_status_draft,     cls: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/70" },
    scheduled: { label: t.newsletter_status_scheduled, cls: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300" },
    sending:   { label: t.newsletter_status_sending,   cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300" },
    sent:      { label: t.newsletter_status_sent,      cls: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300" },
    failed:    { label: t.newsletter_status_failed,    cls: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300" },
  };
}

function CampaignsBadge({ status, t }) {
  const s = getStatusLabels(t)[status] ?? getStatusLabels(t).draft;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

function CampaignsList({ theme, onSelect, refresh, t }) {
  const card = theme === "dark" ? "bg-surface-2 border-border text-white" : "bg-white border-gray-200 text-gray-900";
  const muted = theme === "dark" ? "text-white/70" : "text-gray-400";
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/newsletter/campaigns/`, { credentials: "include" });
      if (!res.ok) return;
      setCampaigns(await res.json());
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load, refresh]);

  const deleteC = async (id) => {
    const csrf = getCookie("csrftoken");
    await fetch(`${API_BASE}/admin/newsletter/campaigns/${id}/`, {
      method: "DELETE",
      credentials: "include",
      headers: csrf ? { "X-CSRFToken": csrf } : {},
    });
    load();
  };

  if (loading) return null;
  if (!campaigns.length) return null;

  return (
    <section className={`rounded-2xl border ${card}`} aria-labelledby="campaigns-list-heading">
      <h2 id="campaigns-list-heading" className="text-base font-semibold px-5 pt-4 pb-3 border-b ${theme === 'dark' ? 'border-border' : 'border-gray-100'}">
        {t.newsletter_campaigns}
      </h2>
      <ul className="divide-y divide-inherit">
        {campaigns.map((c) => (
          <li key={c.id} className="px-5 py-3 flex flex-wrap items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{c.subject}</div>
              <div className={`text-xs mt-0.5 ${muted}`}>
                {c.scheduled_at
                  ? `${t.newsletter_campaign_scheduled} ${new Date(c.scheduled_at).toLocaleString("fr-FR")}`
                  : c.sent_at
                  ? `${t.newsletter_campaign_sent} ${new Date(c.sent_at).toLocaleString("fr-FR")} — ${c.sent_count} envois`
                  : `${t.newsletter_campaign_created} ${new Date(c.created_at).toLocaleString("fr-FR")}`}
              </div>
            </div>
            <CampaignsBadge status={c.status} t={t} />
            {(c.status === "draft" || c.status === "scheduled") && (
              <div className="flex gap-2">
                <button
                  onClick={() => onSelect(c)}
                  className="text-xs px-2 py-1 rounded border hover:opacity-80 transition"
                  aria-label={`Modifier la campagne ${c.subject}`}
                >
                  {t.newsletter_btn_edit}
                </button>
                <button
                  onClick={() => deleteC(c.id)}
                  className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:opacity-80 transition"
                  aria-label={`Supprimer la campagne ${c.subject}`}
                >
                  {t.newsletter_btn_delete}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function NewsletterManager() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? adminFr : adminEn;
  const isDark = theme === "dark";

  useEffect(() => {
    const prev = document.title;
    document.title = t.page_title_newsletter;
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.name = "robots";
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = "noindex, nofollow";
    return () => { document.title = prev; };
  }, [t]);

  const card = isDark ? "bg-surface border-border text-white" : "bg-white border-gray-200 text-gray-900";
  const inputCls = isDark
    ? "bg-surface text-white border-border placeholder-white/40"
    : "bg-white text-gray-900 border-gray-200 placeholder-gray-400";
  const ghostBtn = isDark ? "bg-surface text-white border-border hover:bg-surface-raised" : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50";
  const muted = isDark ? "text-white/70" : "text-gray-500";

  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState(null);
  const [campaignsRefresh, setCampaignsRefresh] = useState(0);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/newsletter/stats/`, { credentials: "include" });
      if (!res.ok) return;
      setStats(await res.json());
    } catch { /* silencieux */ }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const resetForm = () => {
    setEditingCampaignId(null);
    setSubject("");
    setBodyText("");
    setBodyHtml("");
    setScheduledAt("");
  };

  const loadCampaign = (c) => {
    setEditingCampaignId(c.id);
    setSubject(c.subject);
    setBodyText(c.body_text);
    setBodyHtml(c.body_html || "");
    setScheduledAt(c.scheduled_at ? c.scheduled_at.slice(0, 16) : "");
  };

  const saveDraft = async () => {
    const csrf = getCookie("csrftoken");
    const payload = {
      subject: subject.trim(),
      body_text: bodyText.trim(),
      body_html: bodyHtml.trim() || "",
      scheduled_at: scheduledAt || null,
    };
    const url = editingCampaignId
      ? `${API_BASE}/admin/newsletter/campaigns/${editingCampaignId}/`
      : `${API_BASE}/admin/newsletter/campaigns/`;
    const method = editingCampaignId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(csrf ? { "X-CSRFToken": csrf } : {}) },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    return res.json();
  };

  const handleSend = async () => {
    setConfirm(false);
    setSending(true);
    setToast(null);
    try {
      const campaign = await saveDraft();
      const csrf = getCookie("csrftoken");
      const sendPayload = scheduledAt ? { scheduled_at: scheduledAt } : {};
      const res = await fetch(`${API_BASE}/admin/newsletter/campaigns/${campaign.id}/send/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(csrf ? { "X-CSRFToken": csrf } : {}) },
        body: JSON.stringify(sendPayload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail ?? `Erreur ${res.status}`);
      }
      const data = await res.json();
      setToast({ type: "success", message: data.detail ?? t.newsletter_success });
      resetForm();
      setCampaignsRefresh((n) => n + 1);
      loadStats();
    } catch (e) {
      setToast({ type: "error", message: e.message });
    } finally {
      setSending(false);
    }
  };

  const canSend = subject.trim().length > 0 && bodyHtml.trim().length > 0;

  // Date minimum pour planification : maintenant + 5 minutes
  const minScheduledAt = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <main className="px-4 md:px-6 py-6 space-y-6">
      <AdminPageHeader
        title={t.newsletter_title}
        subtitle={t.newsletter_subtitle}
        icon={() => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
        iconBg={isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-600"}
        isDark={isDark}
      />

      {/* Subscriber list */}
      <SubscribersList theme={theme} t={t} />

      {/* Historique campagnes */}
      <CampaignsList theme={theme} onSelect={loadCampaign} refresh={campaignsRefresh} t={t} />

      {/* Formulaire campagne */}
      <section className={`rounded-2xl border p-5 ${card}`} aria-labelledby="campaign-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="campaign-heading" className="text-base font-semibold">
            {editingCampaignId ? t.newsletter_btn_edit_campaign : t.newsletter_btn_new}
            {stats && (
              <span className={`ml-2 text-sm font-normal ${muted}`}>
                — {stats.total_abonnes} {stats.total_abonnes !== 1 ? t.newsletter_subscribers_count_plural : t.newsletter_subscribers_count}
              </span>
            )}
          </h2>
          {editingCampaignId && (
            <button onClick={resetForm} className={`text-xs px-2 py-1 rounded border ${ghostBtn}`}>
              {t.newsletter_btn_new}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="nl-subject">{t.newsletter_field_subject}</label>
            <input
              id="nl-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${inputCls}`}
              placeholder={t.newsletter_placeholder_subject}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">{t.newsletter_field_body_text}</label>
            <RichTextEditor
              value={bodyHtml}
              onChange={(html) => {
                setBodyHtml(html);
                setBodyText(htmlToText(html));
              }}
              theme={theme}
            />
          </div>

          {/* Planification */}
          <div>
            <label className="block text-sm mb-1" htmlFor="nl-scheduled">
              {t.newsletter_field_scheduled}
            </label>
            <input
              id="nl-scheduled"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={minScheduledAt}
              className={`rounded-lg border px-3 py-2 text-sm ${inputCls}`}
            />
            {scheduledAt && (
              <button
                type="button"
                onClick={() => setScheduledAt("")}
                className={`ml-2 text-xs px-2 py-1 rounded border ${ghostBtn}`}
              >
                {t.newsletter_btn_clear}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            type="button"
            onClick={() => setConfirm(true)}
            disabled={!canSend || sending || !stats?.total_abonnes}
            className="px-5 py-2 rounded-xl border bg-secondary text-white text-sm hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending
              ? t.newsletter_btn_sending
              : scheduledAt
              ? t.newsletter_btn_schedule
              : t.newsletter_btn_send_now}
          </button>
        </div>
      </section>

      <ConfirmModal
        open={confirm}
        onConfirm={handleSend}
        onCancel={() => setConfirm(false)}
        recipientsCount={stats?.total_abonnes ?? 0}
        theme={theme}
        t={t}
      />

      <Toast toast={toast} onClose={() => setToast(null)} t={t} />
      <AdminAccessFooter allowedRoles={STAFF_ROLES} />
    </main>
  );
}
