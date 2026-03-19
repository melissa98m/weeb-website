import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getCookie } from "../../lib/cookies";
import { API_BASE } from "../../lib/api";

function Toast({ toast, onClose }) {
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
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-xl shadow-lg px-4 py-3 max-w-sm w-full text-sm transition-all ${colors}`}
    >
      <span className="mt-0.5 shrink-0 text-base" aria-hidden="true">
        {isSuccess ? "✅" : "❌"}
      </span>
      <p className="flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        aria-label="Fermer la notification"
        className="ml-2 shrink-0 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

function ConfirmModal({ open, onConfirm, onCancel, recipientsCount, theme }) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;
  const card = theme === "dark" ? "bg-[#1c1c1c] border-[#333] text-white" : "bg-white border-gray-200 text-gray-900";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className={`relative rounded-2xl border shadow p-6 max-w-sm w-full ${card}`}
      >
        <h2 id="confirm-modal-title" className="text-lg font-semibold mb-2">Confirmer l'envoi</h2>
        <p className="text-sm opacity-80 mb-4">
          Cette campagne sera envoyée à <strong>{recipientsCount}</strong> abonné{recipientsCount !== 1 ? "s" : ""}.
          Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border text-sm">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg border bg-blue-600 text-white text-sm hover:brightness-110"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

function SubscribersList({ theme }) {
  const card = theme === "dark" ? "bg-[#262626] border-[#333] text-white" : "bg-white border-gray-200 text-gray-900";
  const inputCls = theme === "dark"
    ? "bg-[#1c1c1c] text-white border-[#333] placeholder-white/40"
    : "bg-white text-gray-900 border-gray-200 placeholder-gray-400";
  const mutedCls = theme === "dark" ? "text-white/50" : "text-gray-400";
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
          Abonnés
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
            placeholder="Rechercher un email…"
            aria-label="Rechercher un abonné"
            className={`rounded-lg border px-3 py-1.5 text-sm w-52 ${inputCls}`}
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg border bg-blue-600 text-white text-sm hover:brightness-110 transition"
          >
            Chercher
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-6 space-y-2" aria-busy="true" aria-label="Chargement des abonnés">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-8 rounded animate-pulse ${theme === "dark" ? "bg-white/10" : "bg-gray-100"}`} />
            ))}
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-red-500" role="alert">{error}</p>
        ) : data?.results?.length === 0 ? (
          <p className={`p-6 text-sm ${mutedCls}`}>
            {search ? "Aucun résultat pour cette recherche." : "Aucun abonné."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">Liste des abonnés à la newsletter</caption>
            <thead>
              <tr className={`text-left text-xs uppercase tracking-wide ${mutedCls} border-b ${theme === "dark" ? "border-[#333]" : "border-gray-100"}`}>
                <th scope="col" className="px-4 py-2 font-medium">Email</th>
                <th scope="col" className="px-4 py-2 font-medium">Inscrit le</th>
                <th scope="col" className="px-4 py-2 font-medium">Dernier envoi</th>
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
        <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t text-sm ${theme === "dark" ? "border-[#333]" : "border-gray-100"}`}>
          <div className="flex items-center gap-2">
            <label htmlFor="page-size-select" className={`text-xs ${mutedCls}`}>
              Lignes par page
            </label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className={`rounded-lg border px-2 py-1 text-sm ${inputCls}`}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className={mutedCls}>
              Page {data.page} / {data.num_pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={data.page <= 1}
                aria-label="Page précédente"
                className={`px-3 py-1.5 rounded-lg border text-sm transition disabled:opacity-40 disabled:cursor-not-allowed ${theme === "dark" ? "border-[#333] hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"}`}
              >
                ← Préc.
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={data.page >= data.num_pages}
                aria-label="Page suivante"
                className={`px-3 py-1.5 rounded-lg border text-sm transition disabled:opacity-40 disabled:cursor-not-allowed ${theme === "dark" ? "border-[#333] hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"}`}
              >
                Suiv. →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function NewsletterManager() {
  const { theme } = useTheme();

  // SEO : pages admin exclues de l'indexation
  useEffect(() => {
    const prev = document.title;
    document.title = "Newsletter | Administration Weeb";
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.name = "robots";
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = "noindex, nofollow";
    return () => { document.title = prev; };
  }, []);

  const card = theme === "dark" ? "bg-[#262626] border-[#333] text-white" : "bg-white border-gray-200 text-gray-900";
  const inputCls = theme === "dark"
    ? "bg-[#1c1c1c] text-white border-[#333] placeholder-white/40"
    : "bg-white text-gray-900 border-gray-200 placeholder-gray-400";
  const ghostBtn = theme === "dark" ? "bg-[#1c1c1c] text-white border-[#333] hover:bg-[#222]" : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50";

  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [preview, setPreview] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/newsletter/stats/`, { credentials: "include" });
      if (!res.ok) return;
      setStats(await res.json());
    } catch { /* silencieux */ }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleSend = async () => {
    setConfirm(false);
    setSending(true);
    setToast(null);

    try {
      const csrf = getCookie("csrftoken");
      const res = await fetch(`${API_BASE}/admin/newsletter/send/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "X-CSRFToken": csrf } : {}),
        },
        body: JSON.stringify({
          subject: subject.trim(),
          body_text: bodyText.trim(),
          body_html: bodyHtml.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail ?? `Erreur ${res.status}`);
      }
      const data = await res.json();
      const detail = data.erreurs > 0
        ? `${data.envoyes} email${data.envoyes !== 1 ? "s" : ""} envoyé${data.envoyes !== 1 ? "s" : ""}, ${data.erreurs} échec${data.erreurs !== 1 ? "s" : ""}.`
        : `Campagne envoyée à ${data.envoyes} abonné${data.envoyes !== 1 ? "s" : ""} !`;
      setToast({ type: "success", message: detail });
      loadStats();
    } catch (e) {
      setToast({ type: "error", message: e.message });
    } finally {
      setSending(false);
    }
  };

  const canSend = subject.trim().length > 0 && bodyText.trim().length > 0;

  return (
    <main className="px-4 md:px-6 py-6 max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Newsletter</h1>
        <p className={`text-sm mt-1 ${theme === "dark" ? "text-white/60" : "text-gray-500"}`}>
          Gérer les abonnés et envoyer des campagnes.
        </p>
      </header>

      {/* Liste des abonnés */}
      <SubscribersList theme={theme} />

      {/* Campagne */}
      <section className={`rounded-2xl border p-5 ${card}`} aria-labelledby="campaign-heading">
        <h2 id="campaign-heading" className="text-base font-semibold mb-4">
          Nouvelle campagne
          {stats && (
            <span className={`ml-2 text-sm font-normal ${theme === "dark" ? "text-white/50" : "text-gray-400"}`}>
              — {stats.total_abonnes} abonné{stats.total_abonnes !== 1 ? "s" : ""}
            </span>
          )}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="nl-subject">Sujet *</label>
            <input
              id="nl-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${inputCls}`}
              placeholder="Ex : Nouveautés de la semaine"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="nl-text">Corps texte brut *</label>
            <textarea
              id="nl-text"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={5}
              className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${inputCls}`}
              placeholder="Contenu de l'email en texte brut (pour les clients sans HTML)…"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" htmlFor="nl-html">Corps HTML (optionnel)</label>
              <button
                type="button"
                onClick={() => setPreview((v) => !v)}
                className={`text-xs px-2 py-1 rounded border ${ghostBtn}`}
              >
                {preview ? "Masquer aperçu" : "Aperçu HTML"}
              </button>
            </div>
            <textarea
              id="nl-html"
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              rows={6}
              className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${inputCls}`}
              placeholder="<p>Contenu HTML de l'email…</p>"
            />
          </div>

          {preview && bodyHtml && (
            <div className={`rounded-lg border p-4 text-sm ${theme === "dark" ? "bg-white text-gray-900" : "bg-gray-50"}`}>
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Aperçu HTML</p>
              {/* Aperçu brut saisi par l'admin (page protégée, jamais exposée aux utilisateurs).
                  Le contenu est envoyé par email — les clients email supportent un sous-ensemble HTML restreint.
                  Note : ajouter DOMPurify si ce composant est utilisé hors contexte admin. */}
              <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            </div>
          )}
        </div>

        <div className="flex justify-end mt-5">
          <button
            type="button"
            onClick={() => setConfirm(true)}
            disabled={!canSend || sending || !stats?.total_abonnes}
            className="px-5 py-2 rounded-xl border bg-blue-600 text-white text-sm hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? "Envoi en cours…" : "Envoyer la campagne"}
          </button>
        </div>
      </section>

      <ConfirmModal
        open={confirm}
        onConfirm={handleSend}
        onCancel={() => setConfirm(false)}
        recipientsCount={stats?.total_abonnes ?? 0}
        theme={theme}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}
