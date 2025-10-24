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
