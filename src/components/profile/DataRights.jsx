import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthApi, getApiErrorMessage, getApiSupportHint } from "../../lib/api";

function getFilenameFromDisposition(disposition, fallback) {
  if (!disposition) return fallback;
  const match = /filename\*?=(?:UTF-8'')?["]?([^";]+)["]?/i.exec(disposition);
  if (!match || !match[1]) return fallback;
  return decodeURIComponent(match[1]);
}

function getUiLanguage() {
  if (typeof window === "undefined") return "en";
  return window.navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export default function DataRights({ theme, t, onSignedOut }) {
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [dataErrorHint, setDataErrorHint] = useState(null);
  const [dataPayload, setDataPayload] = useState(null);
  const [dataTouched, setDataTouched] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [downloadErrorHint, setDownloadErrorHint] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteErrorHint, setDeleteErrorHint] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleViewData = async () => {
    try {
      setDataTouched(true);
      setDataLoading(true);
      setDataError(null);
      setDataErrorHint(null);
      const payload = await AuthApi.data();
      setDataPayload(payload ?? null);
    } catch (e) {
      setDataError(getApiErrorMessage(e, t.gdpr_data_error));
      setDataErrorHint(getApiSupportHint(e, getUiLanguage()));
      setDataPayload(null);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloadLoading(true);
      setDownloadError(null);
      setDownloadErrorHint(null);
      const { blob, disposition } = await AuthApi.exportData();
      const filename = getFilenameFromDisposition(disposition, "weeb-data.json");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setDownloadError(getApiErrorMessage(e, t.gdpr_download_error));
      setDownloadErrorHint(getApiSupportHint(e, getUiLanguage()));
    } finally {
      setDownloadLoading(false);
    }
  };

  const keyword = t.gdpr_delete_keyword || "DELETE";
  const canDelete =
    confirmChecked && confirmText.trim().toUpperCase() === keyword.toUpperCase();

  const handleDelete = async () => {
    if (!canDelete) return;
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      setDeleteErrorHint(null);
      await AuthApi.deleteAccount();
      setDeleteSuccess(true);
      await onSignedOut?.();
      navigate("/");
    } catch (e) {
      setDeleteError(getApiErrorMessage(e, t.gdpr_delete_error));
      setDeleteErrorHint(getApiSupportHint(e, getUiLanguage()));
      setDeleteSuccess(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cardBase = isDark
    ? "rounded-2xl border bg-surface border-border"
    : "rounded-2xl border bg-white border-gray-200 shadow-sm";

  const btnSecondary = `px-4 py-2 text-sm font-medium rounded-xl border min-h-[40px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
    isDark
      ? "border-border text-white/70 hover:bg-white/5 hover:text-white"
      : "border-gray-200 text-dark/70 hover:bg-gray-50"
  }`;

  const btnPrimary = `px-4 py-2 text-sm font-medium rounded-xl min-h-[40px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
    isDark
      ? "bg-secondary text-white hover:bg-secondary/85"
      : "bg-secondary text-white hover:bg-secondary/90"
  }`;

  return (
    <section className="mt-6 space-y-4">
      {/* Data access card */}
      <div className={`${cardBase} p-6`}>
        <p className={`text-[11px] uppercase tracking-[.15em] font-semibold mb-1 ${isDark ? "text-primary/70" : "text-secondary/70"}`}>
          RGPD
        </p>
        <h2 className={`font-display font-bold text-xl mb-1 ${isDark ? "text-white" : "text-dark"}`}>
          {t.gdpr_title}
        </h2>
        <p className={`text-sm mb-5 ${isDark ? "text-white/50" : "text-dark/50"}`}>
          {t.gdpr_intro}
        </p>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleViewData} className={btnPrimary} disabled={dataLoading}>
            {dataLoading ? t.gdpr_loading : t.gdpr_view}
          </button>
          <button type="button" onClick={handleDownload} className={btnSecondary} disabled={downloadLoading}>
            {downloadLoading ? t.gdpr_loading : t.gdpr_download}
          </button>
        </div>

        {(dataError || downloadError) && (
          <div className="mt-3 text-xs text-red-500">
            <p>{dataError || downloadError}</p>
            {(dataErrorHint || downloadErrorHint) && (
              <p className="mt-1 opacity-80">{dataErrorHint || downloadErrorHint}</p>
            )}
          </div>
        )}

        {dataPayload && (
          <div className="mt-5">
            <h3 className={`text-sm font-semibold mb-2 ${isDark ? "text-white/70" : "text-dark/70"}`}>
              {t.gdpr_view_title}
            </h3>
            <pre
              className={`rounded-xl border p-4 text-xs overflow-auto max-h-72 ${
                isDark
                  ? "bg-surface-3 border-border text-slate-300"
                  : "bg-gray-50 border-gray-200 text-gray-700"
              }`}
            >
              {JSON.stringify(dataPayload, null, 2)}
            </pre>
          </div>
        )}

        {dataTouched && dataPayload === null && !dataLoading && !dataError && (
          <p className={`mt-3 text-xs ${isDark ? "text-white/40" : "text-dark/40"}`}>
            {t.gdpr_data_empty}
          </p>
        )}
      </div>

      {/* Danger zone */}
      <div className={`rounded-2xl border p-6 ${
        isDark
          ? "bg-red-500/5 border-red-500/20"
          : "bg-red-50/60 border-red-200"
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h3 className="text-base font-semibold text-red-600">{t.gdpr_delete_title}</h3>
        </div>
        <p className={`text-sm mb-5 ${isDark ? "text-white/50" : "text-dark/50"}`}>
          {t.gdpr_delete_intro}
        </p>

        <label className="flex items-start gap-2.5 text-sm mb-4 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-red-500"
            checked={confirmChecked}
            onChange={(e) => setConfirmChecked(e.target.checked)}
          />
          <span className={isDark ? "text-white/70" : "text-dark/70"}>{t.gdpr_delete_check}</span>
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className={`text-sm shrink-0 ${isDark ? "text-white/60" : "text-dark/60"}`} htmlFor="delete-keyword">
            {t.gdpr_delete_type}
          </label>
          <input
            id="delete-keyword"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-red-400/30 ${
              isDark
                ? "bg-transparent border-border text-white placeholder-white/30 focus:border-red-400/60"
                : "bg-white border-gray-300 text-dark placeholder-dark/30 focus:border-red-400/60"
            }`}
            placeholder={keyword}
          />
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete || deleteLoading}
            className={`px-4 py-2 rounded-xl text-sm font-semibold min-h-[40px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              canDelete
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-gray-400/50 text-white/50 cursor-not-allowed"
            }`}
          >
            {deleteLoading ? t.gdpr_loading : t.gdpr_delete_cta}
          </button>
        </div>

        {deleteError && (
          <div className="mt-3 text-xs text-red-500">
            <p>{deleteError}</p>
            {deleteErrorHint && <p className="mt-1 opacity-80">{deleteErrorHint}</p>}
          </div>
        )}
        {deleteSuccess && (
          <p className="mt-3 text-xs text-green-500">{t.gdpr_delete_success}</p>
        )}
      </div>
    </section>
  );
}
