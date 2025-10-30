import React from "react";
import { useTheme } from "../../context/ThemeContext";
import Select from "../../components/ui/Select";

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

  const inputBase =
    "w-full rounded-xl border px-3 py-2 outline-none transition placeholder:truncate";
  const inputThemed =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333] placeholder:text-white/50 focus:ring-2 focus:ring-white/20 focus:border-white/30"
      : "bg-white text-gray-900 border-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-black/10 focus:border-gray-300";

  const labelThemed = theme === "dark" ? "text-white/90" : "text-gray-800";

  return (
    <section
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      role="search"
      aria-label="Filtres utilisateurs et formations"
    >
      <div>
        <label
          htmlFor="filter-user"
          className={`mb-1 block text-sm font-medium ${labelThemed}`}
        >
          Filtrer par utilisateur
        </label>
        <Select
          id="filter-user"
          value={filterUser}
          onChange={setFilterUser}
          options={userOptions}
          placeholder="Tous"
        />
      </div>

      <div>
        <label
          htmlFor="filter-formation"
          className={`mb-1 block text-sm font-medium ${labelThemed}`}
        >
          Filtrer par formation
        </label>
        <Select
          id="filter-formation"
          value={filterFormation}
          onChange={setFilterFormation}
          options={formationOptions}
          placeholder="Toutes"
        />
      </div>

      <div className="sm:col-span-2">
        <label
          htmlFor="search-user"
          className={`mb-1 block text-sm font-medium ${labelThemed}`}
        >
          Recherche utilisateur
        </label>
        <input
          id="search-user"
          className={`${inputBase} ${inputThemed}`}
          placeholder="nom d'utilisateur ou email"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          autoComplete="off"
          inputMode="search"
        />
      </div>
    </section>
  );
}

export default React.memo(FiltersBar);