import React, { useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import Autocomplete from "../ui/Autocomplete";
import { getEnv } from "../../lib/env";

const API_BASE = (() => {
  const raw = getEnv("VITE_API_URL", "http://localhost:8000") + "";
  const base = raw.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
})();

function IconPlus({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function Spinner({ size = 14 }) {
  return (
    <span
      className="inline-block rounded-full border-2 border-current border-t-transparent animate-spin"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

function AddUserFormationForm({
  addUserId,
  setAddUserId,
  addFormationId,
  setAddFormationId,
  onSubmit,
  busy,
  error,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const searchUsers = useCallback(async (query, signal) => {
    try {
      const params = new URLSearchParams({ search: query, page_size: "20" });
      const r = await fetch(`${API_BASE}/users/?${params}`, { credentials: "include", signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const users = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      return users.map((u) => {
        const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
        return {
          value: u.id ?? u.pk ?? u.user_id ?? u.uid,
          label: u.username || u.email || name || `user#${u.id}`,
          email: u.email ?? null,
          username: u.username ?? null,
        };
      });
    } catch (e) {
      if (e.name === "AbortError") return [];
      return [];
    }
  }, []);

  const searchFormations = useCallback(async (query, signal) => {
    try {
      const params = new URLSearchParams({ search: query, page_size: "20" });
      const r = await fetch(`${API_BASE}/formations/?${params}`, { credentials: "include", signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      return list.map((f) => ({
        value: f.id ?? f.pk ?? f.formation_id ?? f.fid,
        label: f.title ?? f.name ?? f.label ?? `formation#${f.id}`,
      }));
    } catch (e) {
      if (e.name === "AbortError") return [];
      return [];
    }
  }, []);

  const formatUserDisplay = useCallback((opt) => {
    if (!opt) return "";
    if (opt.email && opt.username) return `${opt.label} (${opt.email})`;
    return opt.label || "";
  }, []);

  const canSubmit = !!(addUserId && addFormationId && !busy);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
          <IconPlus size={12} />
        </div>
        <h2 className={`text-sm font-semibold ${isDark ? "text-white/80" : "text-gray-700"}`}>
          Nouvelle affectation
        </h2>
      </div>

      {error && (
        <div
          role="alert"
          className={`mb-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${
            isDark
              ? "border-red-700/40 bg-red-900/15 text-red-300"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span className="mt-0.5 shrink-0" aria-hidden="true">⚠</span>
          {error}
        </div>
      )}

      <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-start" onSubmit={onSubmit}>
        <div>
          <label htmlFor="add-user" className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-white/60" : "text-gray-400"}`}>
            Utilisateur
          </label>
          <Autocomplete
            id="add-user"
            value={addUserId}
            onChange={setAddUserId}
            placeholder="Rechercher…"
            fetchOptions={searchUsers}
            getOptionLabel={(opt) => opt?.label ?? ""}
            getOptionValue={(opt) => opt?.value ?? null}
            formatDisplayValue={formatUserDisplay}
            minSearchLength={2}
            debounceMs={300}
          />
        </div>

        <div>
          <label htmlFor="add-formation" className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-white/60" : "text-gray-400"}`}>
            Formation
          </label>
          <Autocomplete
            id="add-formation"
            value={addFormationId}
            onChange={setAddFormationId}
            placeholder="Rechercher…"
            fetchOptions={searchFormations}
            getOptionLabel={(opt) => opt?.label ?? ""}
            getOptionValue={(opt) => opt?.value ?? null}
            formatDisplayValue={(opt) => opt?.label ?? ""}
            minSearchLength={2}
            debounceMs={300}
          />
        </div>

        <div className="flex flex-col justify-end">
          <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide opacity-0 select-none`} aria-hidden="true">
            &nbsp;
          </span>
          <button
            type="submit"
            disabled={!canSubmit}
            aria-busy={busy ? "true" : "false"}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              canSubmit
                ? isDark
                  ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                  : "bg-secondary/8 border-secondary/25 text-secondary hover:bg-secondary/15"
                : isDark
                  ? "border-border text-white/60"
                  : "border-gray-200 text-gray-400"
            }`}
          >
            {busy ? <Spinner /> : <IconPlus size={14} />}
            {busy ? "Ajout…" : "Affecter"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default React.memo(AddUserFormationForm);
