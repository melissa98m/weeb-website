import React, { useCallback } from "react";
import Autocomplete from "../ui/Autocomplete";

// Normalise toujours vers .../api
const API_BASE = (() => {
  const raw = (import.meta.env.VITE_API_URL ?? "http://localhost:8000") + "";
  const base = raw.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
})();

function AddUserFormationForm({
  addUserId,
  setAddUserId,
  addFormationId,
  setAddFormationId,
  onSubmit,
  busy,
  error,
}) {
  // Fonction de recherche pour les utilisateurs
  const searchUsers = useCallback(async (query, signal) => {
    try {
      const params = new URLSearchParams();
      params.set("search", query);
      params.set("page_size", "20"); // Limiter les résultats

      const response = await fetch(`${API_BASE}/users/?${params.toString()}`, {
        credentials: "include",
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const users = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];

      return users.map((user) => {
        const nameFromParts = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
        const displayName = user.username || user.email || nameFromParts || `user#${user.id}`;
        return {
          value: user.id ?? user.pk ?? user.user_id ?? user.uid,
          label: displayName,
          email: user.email ?? null,
          username: user.username ?? null,
        };
      });
    } catch (error) {
      if (error.name === "AbortError") {
        return [];
      }
      console.error("Erreur lors de la recherche d'utilisateurs:", error);
      return [];
    }
  }, []);

  // Fonction de recherche pour les formations
  const searchFormations = useCallback(async (query, signal) => {
    try {
      const params = new URLSearchParams();
      params.set("search", query);
      params.set("page_size", "20"); // Limiter les résultats

      const response = await fetch(`${API_BASE}/formations/?${params.toString()}`, {
        credentials: "include",
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const formations = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];

      return formations.map((formation) => ({
        value: formation.id ?? formation.pk ?? formation.formation_id ?? formation.fid,
        label: formation.title ?? formation.name ?? formation.label ?? `formation#${formation.id}`,
      }));
    } catch (error) {
      if (error.name === "AbortError") {
        return [];
      }
      console.error("Erreur lors de la recherche de formations:", error);
      return [];
    }
  }, []);

  // Formater l'affichage pour les utilisateurs
  const formatUserDisplay = useCallback((option) => {
    if (!option) return "";
    if (option.email && option.username) {
      return `${option.label} (${option.email})`;
    }
    return option.label || "";
  }, []);

  return (
    <section className="rounded-2xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">Ajouter un utilisateur à une formation</h2>
      {error && (
        <div
          className="mb-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}
      <form className="grid gap-3 sm:grid-cols-3 items-start" onSubmit={onSubmit}>
        <Autocomplete
          id="add-user"
          value={addUserId}
          onChange={setAddUserId}
          placeholder="Rechercher un utilisateur..."
          fetchOptions={searchUsers}
          getOptionLabel={(opt) => opt?.label ?? ""}
          getOptionValue={(opt) => opt?.value ?? null}
          formatDisplayValue={formatUserDisplay}
          minSearchLength={2}
          debounceMs={300}
        />
        <Autocomplete
          id="add-formation"
          value={addFormationId}
          onChange={setAddFormationId}
          placeholder="Rechercher une formation..."
          fetchOptions={searchFormations}
          getOptionLabel={(opt) => opt?.label ?? ""}
          getOptionValue={(opt) => opt?.value ?? null}
          formatDisplayValue={(opt) => opt?.label ?? ""}
          minSearchLength={2}
          debounceMs={300}
        />
        <button
          type="submit"
          className="rounded-xl border px-4 py-2 disabled:opacity-50"
          disabled={!addUserId || !addFormationId || busy}
          aria-busy={busy ? "true" : "false"}
        >
          {busy ? "Ajout..." : "Ajouter"}
        </button>
      </form>
    </section>
  );
}

export default React.memo(AddUserFormationForm);
