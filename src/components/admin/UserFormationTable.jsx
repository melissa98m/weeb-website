import React from "react";
import { useTheme } from "../../context/ThemeContext";

function UserFormationTable({
  loading,
  error,
  links,
  filteredLinks,
  onRemove,
  busy,
}) {
  const { theme } = useTheme();

  const card =
    theme === "dark"
      ? "bg-[#262626] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  const headRow = theme === "dark" ? "bg-[#232323]" : "bg-gray-50";
  const muted = theme === "dark" ? "text-white/70" : "text-gray-600";
  const borderRow = theme === "dark" ? "border-[#333]" : "border-gray-200";

  const btn =
    theme === "dark"
      ? "bg-red-400 text-white border-[#333] hover:bg-[#222]"
      : "bg-red-400 text-gray-900 border-gray-200 hover:bg-gray-50";

  /* ---------- ÉTATS COMMUNS ---------- */
  const renderState = (content) => (
    <div className={`p-4 ${muted}`}>{content}</div>
  );

  /* ---------- MOBILE: LISTE EN CARTES ---------- */
  const MobileList = () => (
    <div className="md:hidden">
      {loading
        ? renderState("Chargement des liens…")
        : error
        ? (
          <div className="p-4 text-red-600 dark:text-red-400">
            Erreur de chargement. Voir le message au-dessus.
          </div>
        )
        : filteredLinks.length === 0
        ? renderState("Aucun résultat.")
        : (
          <ul className="divide-y first:divide-y-0" role="list">
            {filteredLinks.map((l) => (
              <li key={l.id} className={`p-4 ${theme === "dark" ? "divide-[#333]" : "divide-gray-200"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium break-words">
                      {l.user?.username ?? `user#${l.user?.id}`}
                    </div>
                    <div className={`text-sm break-words ${muted}`}>
                      {l.user?.email ?? "—"}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full border">
                    {l.formation?.title ?? `formation#${l.formation?.id}`}
                  </span>
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    className={`rounded-xl border px-3 py-1 text-sm disabled:opacity-50 transition ${btn}`}
                    onClick={() => onRemove(l.id)}
                    disabled={busy}
                    title="Retirer l'utilisateur de cette formation"
                  >
                    Retirer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
    </div>
  );

  /* ---------- DESKTOP: TABLE CLASSIQUE ---------- */
  const DesktopTable = () => (
    <div className="hidden md:block overflow-x-auto">
      <table
        className="min-w-full text-sm table-fixed" // table-fixed pour contrôle des largeurs + ellipsis
        aria-busy={loading ? "true" : "false"}
      >
        <colgroup>
          <col className="w-[30%]" />
          <col className="w-[30%]" />
          <col className="w-[25%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead>
          <tr className={`${headRow} text-center`}>
            <th scope="col" className="p-3 font-medium">Utilisateur</th>
            <th scope="col" className="p-3 font-medium">Email</th>
            <th scope="col" className="p-3 font-medium">Formation</th>
            <th scope="col" className="p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td className="p-3" colSpan={4}>Chargement des liens…</td></tr>
          ) : error ? (
            <tr><td className="p-3 text-red-600 dark:text-red-400" colSpan={4}>Erreur de chargement. Voir le message au-dessus.</td></tr>
          ) : filteredLinks.length === 0 ? (
            <tr><td className={`p-3 ${muted}`} colSpan={4}>Aucun résultat.</td></tr>
          ) : (
            filteredLinks.map((l) => (
              <tr key={l.id} className={`border-t ${borderRow}`}>
                <td className="p-3 align-top">
                  <div className="truncate" title={l.user?.username ?? `user#${l.user?.id}`}>
                    {l.user?.username ?? `user#${l.user?.id}`}
                  </div>
                </td>
                <td className="p-3 align-top">
                  <div className="truncate" title={l.user?.email ?? "—"}>
                    {l.user?.email ?? "—"}
                  </div>
                </td>
                <td className="p-3 align-top">
                  <div className="truncate" title={l.formation?.title ?? `formation#${l.formation?.id}`}>
                    {l.formation?.title ?? `formation#${l.formation?.id}`}
                  </div>
                </td>
                <td className="p-3 align-top">
                  <button
                    type="button"
                    className={`rounded-xl border px-3 py-1 text-sm disabled:opacity-50 transition ${btn}`}
                    onClick={() => onRemove(l.id)}
                    disabled={busy}
                    title="Retirer l'utilisateur de cette formation"
                  >
                    Retirer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className={`rounded-2xl border ${card}`}>
      {/* Mobile cards */}
      <MobileList />
      {/* Desktop table */}
      <DesktopTable />
    </section>
  );
}

export default React.memo(UserFormationTable);