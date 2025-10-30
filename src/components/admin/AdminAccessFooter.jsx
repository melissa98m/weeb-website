import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { hasAnyRole } from "../../utils/roles";

/* Icône cadenas (inline) */
function LockIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* Utilitaire d’unicité en conservant l’ordre d’apparition */
function uniq(list) {
  const s = new Set();
  const out = [];
  for (const v of list) {
    if (!v || s.has(v)) continue;
    s.add(v);
    out.push(v);
  }
  return out;
}

/* Récupère des noms "affichables" de rôles depuis l’objet user (sans normaliser). */
function collectDisplayRoleNames(user) {
  if (!user) return [];

  const pick = (arr) =>
    Array.isArray(arr)
      ? arr
          .map((v) => (typeof v === "string" ? v : v?.name))
          .filter(Boolean)
      : [];

  const out = [
    ...pick(user.groups),
    ...pick(user.group_names),
    ...pick(user.roles),
  ];

  if (user.role) out.push(String(user.role));
  if (user.profile?.group?.name) out.push(String(user.profile.group.name));

  // Flags -> étiquettes lisibles
  if (user.is_commercial) out.push("Commercial");
  if (user.is_personnel) out.push("Personnel");
  if (user.is_redacteur) out.push("Rédacteur");
  if (user.is_staff) out.push("Staff");
  if (user.is_superuser) out.push("Superuser");

  return uniq(out);
}

/**
 * Footer d’accès Admin
 *
 * Props :
 * - allowedRoles: string[]  (ex: STAFF_ROLES, PERSONNEL_ROLE, REDACTION_ROLES…)
 * - className?: string
 * - showUserRoles?: boolean (true par défaut)
 */
export default function AdminAccessFooter({
  allowedRoles = ["Personnel"],
  className = "",
  showUserRoles = true,
}) {
  const { theme } = useTheme();
  const { user } = useAuth();

  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  const muted = theme === "dark" ? "text-white/70" : "text-gray-600";

  const ok = hasAnyRole(user, allowedRoles);
  const statusCls = ok
    ? theme === "dark"
      ? "bg-green-600/20 text-green-300 border-green-700/40"
      : "bg-green-100 text-green-800 border-green-200"
    : theme === "dark"
    ? "bg-red-600/20 text-red-300 border-red-700/40"
    : "bg-red-100 text-red-800 border-red-200";

  const pillBase =
    "px-2 py-0.5 rounded-full text-[11px] leading-none font-semibold border";

  const allowedLabel =
    Array.isArray(allowedRoles) && allowedRoles.length > 0
      ? allowedRoles.join(", ")
      : "Personnel";

  const userRoleList = collectDisplayRoleNames(user);
  const userRolesLabel =
    userRoleList.length > 0 ? userRoleList.join(", ") : "—";

  return (
    <footer
      className={`mt-4 rounded-xl border px-3 py-2 text-xs ${card} ${className}`}
      aria-live="polite"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Bloc gauche : libellé d’accès */}
        <div className="flex items-center gap-2 min-w-0">
          <LockIcon />
          <div className="min-w-0">
            <div className="font-medium truncate">
              Accès réservé : {allowedLabel}
            </div>
            {showUserRoles && (
              <div className={`truncate ${muted}`}>
                Vos rôles reconnus : {userRolesLabel}
              </div>
            )}
          </div>
        </div>

        {/* Bloc droit : statut */}
        <div className="flex items-center gap-2 sm:justify-end">
          <span className={`${pillBase} ${statusCls}`}>
            {ok ? "Accès autorisé" : "Accès refusé"}
          </span>
        </div>
      </div>
    </footer>
  );
}
