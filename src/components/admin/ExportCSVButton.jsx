import React, { useState } from "react";
import { API_BASE } from "../../lib/api";
import { getCookie } from "../../lib/cookies";

function IconDownload({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/**
 * Bouton qui déclenche le téléchargement d'un export CSV depuis l'API.
 *
 * @param {object} props
 * @param {"inscrits"|"feedbacks"|"messages"} props.type - Type d'export.
 * @param {string} [props.dateFrom] - Filtre date de début (YYYY-MM-DD).
 * @param {string} [props.dateTo]   - Filtre date de fin (YYYY-MM-DD).
 * @param {string} [props.label]    - Libellé du bouton.
 * @param {string} [props.className]
 */
export default function ExportCSVButton({ type, dateFrom, dateTo, label, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const LABELS = {
    inscrits: "Inscrits",
    feedbacks: "Feedbacks",
    messages: "Messages",
  };

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const url = `${API_BASE}/export/${type}/${params.toString() ? `?${params}` : ""}`;
      const csrfToken = getCookie("csrftoken");

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: csrfToken ? { "X-CSRFToken": csrfToken } : {},
      });

      if (!res.ok) {
        throw new Error(`Erreur ${res.status} — accès refusé ou serveur indisponible.`);
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const filename = `${type}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const displayLabel = label ?? `Exporter ${LABELS[type] ?? type}`;

  return (
    <div className="inline-flex flex-col gap-1">
      <button
        onClick={handleDownload}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-busy={loading}
      >
        <IconDownload />
        {loading ? "Export en cours…" : displayLabel}
      </button>
      {error && (
        <span className="text-xs text-red-500" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
