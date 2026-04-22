// --- Role family declarations ---
export const STAFF_ROLES = ["Commercial", "Personnel"];
export const REDACTION_ROLES = ["Redacteur", "Personnel"];
export const PERSONNEL_ROLE = ["Personnel"]; // unique

// Maps boolean flags to role names (used for role detection)
const FLAG_TO_ROLE = {
  is_commercial: "Commercial",
  is_personnel: "Personnel",
  is_redacteur: "Redacteur",
};

// Permissions that implicitly grant "Personnel" access (fallback)
const PERMS_FOR_PERSONNEL = [
  "api.view_userformation",
  "api.add_userformation",
  "api.change_userformation",
  "api.delete_userformation",
];

// --- Internal helpers ---
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
 * Collects ALL possible role sources from the user object
 * and returns a Set of normalized (lowercase) role names.
 */
export function collectUserRoleNames(user) {
  if (!user) return new Set();

  const names = [
    ...pickNames(user.groups),
    ...pickNames(user.group_names),
    ...pickNames(user.roles),
    user.role,
    user.profile?.group?.name,
    // Boolean flags -> role names
    ...Object.entries(FLAG_TO_ROLE)
      .filter(([flag]) => !!user?.[flag])
      .map(([, roleName]) => roleName),
  ].filter(Boolean);

  return new Set(names.map(norm));
}

/**
 * Generic check: does the user have AT LEAST ONE role from allowedRoles?
 * Also falls back to staff/superuser flags.
 * Optionally checks explicit permissions if extraPerms is provided.
 */
export function hasAnyRole(user, allowedRoles, extraPerms = []) {
  if (!user) return false;

  // Staff/superuser -> always allowed
  if (user.is_staff || user.is_superuser) return true;

  const want = new Set((allowedRoles || []).map(norm));
  const have = collectUserRoleNames(user);

  for (const r of want) {
    if (have.has(r)) return true;
  }

  // Explicit permission fallback (if the backend exposes them)
  if (Array.isArray(extraPerms) && Array.isArray(user?.perms)) {
    const p = new Set(user.perms);
    if (extraPerms.some((perm) => p.has(perm))) return true;
  }

  return false;
}

// --- Convenience wrappers ---
export function hasAnyStaffRole(user) {
  return hasAnyRole(user, STAFF_ROLES);
}

export function hasPersonnelRole(user) {
  // grants access via "Personnel" role or via user-formation-related permissions
  return hasAnyRole(user, PERSONNEL_ROLE, PERMS_FOR_PERSONNEL);
}

export function hasAnyRedactionRole(user) {
  return hasAnyRole(user, REDACTION_ROLES);
}
