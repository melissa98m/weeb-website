import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthApi } from "../../lib/api";

function getFilenameFromDisposition(disposition, fallback) {
  if (!disposition) return fallback;
  const match = /filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i.exec(disposition);
  if (!match || !match[1]) return fallback;
  return decodeURIComponent(match[1]);
}

export default function DataRights({ theme, t, onSignedOut }) {
  const navigate = useNavigate();
  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [dataPayload, setDataPayload] = useState(null);
  const [dataTouched, setDataTouched] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleViewData = async () => {
    try {
      setDataTouched(true);
      setDataLoading(true);
      setDataError(null);
      const payload = await AuthApi.data();
      setDataPayload(payload ?? null);
    } catch (e) {
      setDataError(e);
      setDataPayload(null);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloadLoading(true);
      setDownloadError(null);
      const { blob, disposition } = await AuthApi.exportData();
      const filename = getFilenameFromDisposition(disposition, "weeb-data.json");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setDownloadError(e);
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
      await AuthApi.deleteAccount();
      setDeleteSuccess(true);
      await onSignedOut?.();
      navigate("/");
    } catch (e) {
      setDeleteError(e);
      setDeleteSuccess(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <section className="w-full max-w-2xl mt-10">
      <div className={`rounded-xl border shadow ${card} p-6`}>
        <h2 className="text-xl font-semibold mb-2">{t.gdpr_title}</h2>
        <p className="text-sm opacity-70 mb-5">{t.gdpr_intro}</p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleViewData}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              theme === "dark"
                ? "bg-secondary text-white hover:bg-secondary/80"
                : "bg-primary text-dark hover:bg-primary/80"
            }`}
            disabled={dataLoading}
          >
            {dataLoading ? t.gdpr_loading : t.gdpr_view}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              theme === "dark"
                ? "border border-white/20 text-white hover:bg-white/10"
                : "border border-dark/20 text-dark hover:bg-dark/10"
            }`}
            disabled={downloadLoading}
          >
            {downloadLoading ? t.gdpr_loading : t.gdpr_download}
          </button>
        </div>

        {(dataError || downloadError) && (
          <p className="mt-3 text-xs text-red-500">
            {dataError ? t.gdpr_data_error : t.gdpr_download_error}
          </p>
        )}

        {dataPayload && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">{t.gdpr_view_title}</h3>
            <pre
              className={`rounded-lg border p-3 text-xs overflow-auto max-h-80 ${
                theme === "dark"
                  ? "bg-[#141414] border-[#333] text-slate-200"
                  : "bg-gray-50 border-gray-200 text-gray-700"
              }`}
            >
              {JSON.stringify(dataPayload, null, 2)}
            </pre>
          </div>
        )}

        {dataTouched && dataPayload === null && !dataLoading && !dataError && (
          <p className="mt-3 text-xs opacity-70">{t.gdpr_data_empty}</p>
        )}
      </div>

      <div className={`rounded-xl border shadow ${card} p-6 mt-6`}>
        <h3 className="text-lg font-semibold mb-2">{t.gdpr_delete_title}</h3>
        <p className="text-sm opacity-70 mb-4">{t.gdpr_delete_intro}</p>

        <label className="flex items-start gap-2 text-sm mb-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={confirmChecked}
            onChange={(event) => setConfirmChecked(event.target.checked)}
          />
          <span>{t.gdpr_delete_check}</span>
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="text-sm" htmlFor="delete-keyword">
            {t.gdpr_delete_type}
          </label>
          <input
            id="delete-keyword"
            type="text"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            className={`rounded-md border px-3 py-2 text-sm ${
              theme === "dark"
                ? "bg-transparent border-white/30 text-white"
                : "bg-white border-gray-300 text-dark"
            }`}
            placeholder={keyword}
          />
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete || deleteLoading}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              canDelete
                ? theme === "dark"
                  ? "bg-red-500 text-white hover:bg-red-400"
                  : "bg-red-600 text-white hover:bg-red-500"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            {deleteLoading ? t.gdpr_loading : t.gdpr_delete_cta}
          </button>
        </div>

        {deleteError && <p className="mt-3 text-xs text-red-500">{t.gdpr_delete_error}</p>}
        {deleteSuccess && (
          <p className="mt-3 text-xs text-green-500">{t.gdpr_delete_success}</p>
        )}
      </div>
    </section>
  );
}
