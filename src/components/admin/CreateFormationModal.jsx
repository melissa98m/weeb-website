import React, { useEffect, useState, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import { ensureCsrf } from "../../lib/api";

/**
 * Modale de création de formation
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onCreated: (formation) => void
 * - apiBase: string (ex: http://localhost:8000/api)
 */
export default function CreateFormationModal({ open, onClose, onCreated, apiBase }) {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setBusy(false);
      setErr("");
    }
  }, [open]);

  const overlay =
    theme === "dark"
      ? "bg-black/60"
      : "bg-black/40";

  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  const inputBase = "w-full rounded-xl border px-3 py-2 outline-none transition";
  const inputThemed =
    theme === "dark"
      ? "bg-[#141414] text-white border-[#333] focus:ring-2 focus:ring-white/20 focus:border-white/30"
      : "bg-white text-gray-900 border-gray-200 focus:ring-2 focus:ring-black/10 focus:border-gray-300";

  const btnPrimary =
    theme === "dark"
      ? "bg-secondary text-white border-secondary hover:brightness-110"
      : "bg-primary text-dark border-primary hover:brightness-110";

  const btnGhost =
    theme === "dark"
      ? "bg-[#262626] text-white border-[#333] hover:bg-[#303030]"
      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50";

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr("Le nom est requis.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const csrf = await ensureCsrf();
      const r = await fetch(`${apiBase}/formations/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
        body: JSON.stringify({ name: name.trim(), description: description || null }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        const first =
          body?.name?.[0] ||
          body?.description?.[0] ||
          body?.detail ||
          `HTTP ${r.status}`;
        throw new Error(String(first));
      }
      const created = await r.json();
      onCreated?.(created);
      onClose?.();
    } catch (e2) {
      setErr(String(e2?.message || e2));
    } finally {
      setBusy(false);
    }
  }, [apiBase, name, description, onCreated, onClose]);

  // Fermer sur ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlay}`}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        // close on backdrop click (mais pas si on clique dans la card)
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={`w-full max-w-lg rounded-2xl border shadow-xl ${card}`}>
        <form onSubmit={onSubmit}>
          <div className="p-5 border-b border-inherit/30">
            <h2 className="text-lg font-semibold">Nouvelle formation</h2>
          </div>

          <div className="p-5 space-y-4">
            {err && (
              <div className="rounded-xl border border-red-300 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200 p-3 text-sm">
                {err}
              </div>
            )}

            <div>
              <label htmlFor="formation-name" className="block text-sm font-medium mb-1">
                Nom <span className="text-red-600">*</span>
              </label>
              <input
                id="formation-name"
                className={`${inputBase} ${inputThemed}`}
                placeholder="ex: Initiation à React"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div>
              <label htmlFor="formation-description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="formation-description"
                className={`${inputBase} ${inputThemed} min-h-[96px] resize-y`}
                placeholder="Optionnel"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="p-5 border-t border-inherit/30 flex items-center justify-end gap-2">
            <button
              type="button"
              className={`rounded-xl border px-4 py-2 ${btnGhost}`}
              onClick={onClose}
              disabled={busy}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`rounded-xl border px-4 py-2 disabled:opacity-50 ${btnPrimary}`}
              disabled={busy}
              aria-busy={busy ? "true" : "false"}
            >
              {busy ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
