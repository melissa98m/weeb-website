import React, { useEffect, useState, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getCookie } from "../../lib/cookies";
import { API_BASE } from "../../lib/api";

function ConfirmModal({ open, onConfirm, onCancel, recipientsCount, theme }) {
  // Fermeture au clavier (Escape)
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

  const [stats, setStats] = useState(null);
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [preview, setPreview] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/newsletter/stats/`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch { /* silencieux */ }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleSend = async () => {
    setConfirm(false);
    setSending(true);
    setResult(null);
    setError(null);

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
      setResult(data);
      loadStats();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const canSend = subject.trim().length > 0 && bodyText.trim().length > 0;

  return (
    <main className="px-4 md:px-6 py-6 max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Newsletter</h1>
        <p className={`text-sm mt-1 ${theme === "dark" ? "text-white/60" : "text-gray-500"}`}>
          Composer et envoyer une campagne aux abonnés.
        </p>
      </header>

      {/* Stats */}
      <section className={`rounded-2xl border p-4 mb-6 ${card}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold">
            {stats?.total_abonnes ?? "—"}
          </span>
          <span className={`text-sm ${theme === "dark" ? "text-white/60" : "text-gray-500"}`}>
            abonné{(stats?.total_abonnes ?? 0) !== 1 ? "s" : ""} actif{(stats?.total_abonnes ?? 0) !== 1 ? "s" : ""}
          </span>
        </div>
      </section>

      {/* Formulaire */}
      <section className={`rounded-2xl border p-5 ${card}`}>
        <h2 className="text-base font-semibold mb-4">Nouvelle campagne</h2>

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

          {/* Aperçu HTML */}
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

        {/* Résultat / erreur */}
        {result && (
          <div className="mt-4 rounded-lg border border-green-300 bg-green-50 text-green-800 text-sm p-3">
            ✅ Campagne envoyée — {result.envoyes} email{result.envoyes !== 1 ? "s" : ""} envoyé{result.envoyes !== 1 ? "s" : ""}
            {result.erreurs > 0 && `, ${result.erreurs} échec${result.erreurs !== 1 ? "s" : ""}`}.
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 text-red-800 text-sm p-3" role="alert">
            {error}
          </div>
        )}

        {/* Actions */}
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
    </main>
  );
}
