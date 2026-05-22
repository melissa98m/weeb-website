import React from "react";
import { useTheme } from "../../context/ThemeContext";

function IconTrash({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  );
}

function SkeletonRow({ isDark }) {
  const bg = isDark ? "bg-white/5" : "bg-gray-100";
  return (
    <tr>
      {[40, 56, 52, 20].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`h-3.5 rounded-full animate-pulse ${bg}`} style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

function UserAvatar({ username, isDark }) {
  const letter = (username || "?")[0].toUpperCase();
  return (
    <span
      className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold shrink-0 ${
        isDark ? "bg-primary/15 text-primary" : "bg-secondary/10 text-secondary"
      }`}
      aria-hidden="true"
    >
      {letter}
    </span>
  );
}

function UserFormationTable({ loading, error, links: _links, filteredLinks, onRemove, busy }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const muted       = isDark ? "text-white/40" : "text-gray-400";
  const headText    = isDark ? "text-white/35" : "text-gray-400";
  const rowHover    = isDark ? "hover:bg-white/3" : "hover:bg-gray-50/80";
  const rowDivider  = isDark ? "border-border/60" : "border-gray-100";
  const tagBase     = `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
    isDark ? "bg-primary/8 border-primary/20 text-primary/80" : "bg-secondary/6 border-secondary/15 text-secondary"
  }`;
  const removeBtn   = `inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
    isDark
      ? "border-red-700/30 text-red-400 hover:bg-red-900/20 hover:border-red-600/40"
      : "border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
  }`;

  /* ── Empty / Error states ── */
  if (!loading && error) {
    return (
      <div className={`rounded-2xl border px-4 py-6 text-center text-sm ${isDark ? "border-red-700/30 bg-red-900/10 text-red-400" : "border-red-200 bg-red-50 text-red-600"}`}>
        Erreur de chargement. Voir le message ci-dessus.
      </div>
    );
  }

  if (!loading && filteredLinks.length === 0) {
    return (
      <div className={`rounded-2xl border px-4 py-10 text-center text-sm ${isDark ? "border-border text-white/30" : "border-gray-200 text-gray-400"}`}>
        Aucune affectation trouvée.
      </div>
    );
  }

  /* ── Mobile cards ── */
  const MobileList = () => (
    <div className="md:hidden divide-y" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6" }}>
      {loading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 space-y-2 animate-pulse">
              <div className={`h-3 rounded-full w-2/5 ${isDark ? "bg-white/8" : "bg-gray-100"}`} />
              <div className={`h-3 rounded-full w-3/5 ${isDark ? "bg-white/5" : "bg-gray-50"}`} />
            </div>
          ))
        : filteredLinks.map((l) => (
            <div key={l.id} className="flex items-start justify-between gap-3 p-4">
              <div className="flex items-start gap-3 min-w-0">
                <UserAvatar username={l.user?.username} isDark={isDark} />
                <div className="min-w-0">
                  <p className={`font-medium text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                    {l.user?.username ?? `user#${l.user?.id}`}
                  </p>
                  <p className={`text-xs truncate mt-0.5 ${muted}`}>
                    {l.user?.email ?? "—"}
                  </p>
                  <span className={`${tagBase} mt-2`}>
                    {l.formation?.title ?? `formation#${l.formation?.id}`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(l.id)}
                disabled={busy}
                className={removeBtn}
                aria-label={`Retirer ${l.user?.username ?? "cet utilisateur"} de ${l.formation?.title ?? "cette formation"}`}
              >
                <IconTrash />
              </button>
            </div>
          ))
      }
    </div>
  );

  /* ── Desktop table ── */
  const DesktopTable = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm table-fixed" aria-busy={loading ? "true" : "false"}>
        <colgroup>
          <col className="w-[28%]" />
          <col className="w-[28%]" />
          <col className="w-[30%]" />
          <col className="w-[14%]" />
        </colgroup>
        <thead>
          <tr className={`border-b ${rowDivider}`}>
            {["Utilisateur", "Email", "Formation", ""].map((h, i) => (
              <th key={i} scope="col" className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${headText}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} isDark={isDark} />)
            : filteredLinks.map((l) => (
                <tr key={l.id} className={`border-t transition-colors ${rowDivider} ${rowHover}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar username={l.user?.username} isDark={isDark} />
                      <span className={`truncate font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`} title={l.user?.username}>
                        {l.user?.username ?? `user#${l.user?.id}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`truncate block text-sm ${muted}`} title={l.user?.email ?? "—"}>
                      {l.user?.email ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={tagBase} title={l.formation?.title}>
                      {l.formation?.title ?? `formation#${l.formation?.id}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onRemove(l.id)}
                      disabled={busy}
                      className={removeBtn}
                      aria-label={`Retirer ${l.user?.username ?? "cet utilisateur"} de ${l.formation?.title ?? "cette formation"}`}
                    >
                      <IconTrash />
                      Retirer
                    </button>
                  </td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <MobileList />
      <DesktopTable />
    </>
  );
}

export default React.memo(UserFormationTable);
