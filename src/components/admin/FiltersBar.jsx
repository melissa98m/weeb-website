import React from "react";
import { useTheme } from "../../context/ThemeContext";
import Select from "../../components/ui/Select";

function IconSearch({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function FiltersBar({
  userOptions,
  formationOptions,
  filterUser,
  setFilterUser,
  filterFormation,
  setFilterFormation,
  searchUser,
  setSearchUser,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const inputBase = "w-full rounded-xl border px-3 py-2 text-sm outline-none transition";
  const inputThemed = isDark
    ? "bg-surface text-white border-border placeholder:text-white/35 focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
    : "bg-white text-gray-900 border-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40";

  const labelClass = `mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-white/40" : "text-gray-400"}`;

  const hasFilters = filterUser || filterFormation || searchUser;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-white/30" : "text-gray-400"}`}>
          Filtres
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => { setFilterUser(null); setFilterFormation(null); setSearchUser(""); }}
            className={`text-xs transition-colors ${isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}
          >
            Effacer les filtres ×
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="search" aria-label="Filtres">
        <div>
          <label htmlFor="filter-user" className={labelClass}>Utilisateur</label>
          <Select id="filter-user" value={filterUser} onChange={setFilterUser} options={userOptions} placeholder="Tous" />
        </div>

        <div>
          <label htmlFor="filter-formation" className={labelClass}>Formation</label>
          <Select id="filter-formation" value={filterFormation} onChange={setFilterFormation} options={formationOptions} placeholder="Toutes" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="search-user" className={labelClass}>Recherche</label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-gray-400"}`}>
              <IconSearch />
            </span>
            <input
              id="search-user"
              className={`${inputBase} ${inputThemed} pl-8`}
              placeholder="Nom d'utilisateur ou email…"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              autoComplete="off"
              inputMode="search"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(FiltersBar);
