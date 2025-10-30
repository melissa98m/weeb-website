export const STAFF_ROLES = ["Commercial", "Personnel"];

/** Retourne true si l'utilisateur a au moins un rôle parmi STAFF_ROLES */
export function hasAnyStaffRole(user) {
  if (!user) return false;

  // format: user.groups = [{id, name}, ...]
  if (Array.isArray(user.groups) && user.groups.some(g => STAFF_ROLES.includes(g?.name))) {
    return true;
  }
  // format: user.group_names = ["Commercial", ...]
  if (Array.isArray(user.group_names) && user.group_names.some(n => STAFF_ROLES.includes(n))) {
    return true;
  }
  // indicateurs booléens (si ton backend renvoie ça)
  if (user.is_commercial || user.is_personnel) return true;

  return false;
}

export const PERSONNEL_ROLE = ["personnel"];

function collectNames(arr) {
  if (!Array.isArray(arr)) return [];
  // supporte ['Personnel'] ou [{name:'Personnel'}]
  return arr
    .map(v => (typeof v === "string" ? v : v?.name))
    .filter(Boolean)
    .map(s => String(s).toLowerCase());
}

/** True si l'utilisateur est "Personnel" via groupe, flag ou staff/admin */
export function hasPersonnelRole(u) {
  if (!u) return false;

  const bag = new Set([
    ...collectNames(u.groups),        // ex: ['Personnel']
    ...collectNames(u.group_names),   // ex: ['Personnel']
    ...collectNames(u.roles),         // ex: ['Personnel']
    ...(u.role ? [String(u.role).toLowerCase()] : []),
    ...(u.profile?.group?.name ? [String(u.profile.group.name).toLowerCase()] : []),
  ]);

  // flags backend
  if (u.is_personnel) return true;

  // groupe attendu
  if (PERSONNEL_ROLE.some(r => bag.has(r))) return true;

  // fallback: staff/admin
  if (u.is_staff || u.is_superuser) return true;

  // fallback (optionnel) : permissions explicites
  if (Array.isArray(u.perms)) {
    const p = new Set(u.perms);
    if (
      p.has("api.view_userformation") ||
      p.has("api.add_userformation") ||
      p.has("api.change_userformation") ||
      p.has("api.delete_userformation")
    ) return true;
  }

  return false;
}