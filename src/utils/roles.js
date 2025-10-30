// --- Déclarations de familles de rôles (affichage) ---
export const STAFF_ROLES = ["Commercial", "Personnel"];
export const REDACTION_ROLES = ["Rédacteur", "Personnel"];
export const PERSONNEL_ROLE = ["Personnel"]; // unique

// Mappe les flags booléens potentiels vers des noms de rôles (pour la détection)
const FLAG_TO_ROLE = {
  is_commercial: "Commercial",
  is_personnel: "Personnel",
  is_redacteur: "Rédacteur",
};

// Permissions qui donnent implicitement l'accès "Personnel" (fallback)
const PERMS_FOR_PERSONNEL = [
  "api.view_userformation",
  "api.add_userformation",
  "api.change_userformation",
  "api.delete_userformation",
];

// --- Utils internes ---
function norm(s) {
  return String(s || "").normalize("NFKD").toLowerCase().trim();
}

function pickNames(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => (typeof v === "string" ? v : v?.name))
    .filter(Boolean);
}

/**
 * Collecte TOUTES les sources possibles de rôles côté user
 * et renvoie un Set de NOMS DE RÔLES normalisés (lowercase).
 */
export function collectUserRoleNames(user) {
  if (!user) return new Set();

  const names = [
    ...pickNames(user.groups),
    ...pickNames(user.group_names),
    ...pickNames(user.roles),
    user.role,
    user.profile?.group?.name,
    // Flags booléens -> noms de rôle
    ...Object.entries(FLAG_TO_ROLE)
      .filter(([flag]) => !!user?.[flag])
      .map(([, roleName]) => roleName),
  ].filter(Boolean);

  return new Set(names.map(norm));
}

/**
 * Test générique : l'utilisateur a-t-il AU MOINS UN rôle dans allowedRoles ?
 * + fallbacks staff/superuser
 * + (optionnel) si extraPerms est fourni, vérifie les permissions explicites.
 */
export function hasAnyRole(user, allowedRoles, extraPerms = []) {
  if (!user) return false;

  // Staff/superuser -> accès
  if (user.is_staff || user.is_superuser) return true;

  const want = new Set((allowedRoles || []).map(norm));
  const have = collectUserRoleNames(user);

  for (const r of want) {
    if (have.has(r)) return true;
  }

  // Fallback permissions explicites (si exposées côté backend)
  if (Array.isArray(extraPerms) && Array.isArray(user?.perms)) {
    const p = new Set(user.perms);
    if (extraPerms.some((perm) => p.has(perm))) return true;
  }

  return false;
}

// --- Spécialisations conviviales ---
export function hasAnyStaffRole(user) {
  return hasAnyRole(user, STAFF_ROLES);
}

export function hasPersonnelRole(user) {
  // autorise via rôle "Personnel" ou via permissions liées aux user-formations
  return hasAnyRole(user, PERSONNEL_ROLE, PERMS_FOR_PERSONNEL);
}

export function hasAnyRedactionRole(user) {
  return hasAnyRole(user, REDACTION_ROLES);
}
