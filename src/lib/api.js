import { getCookie } from "./cookies";

// Base API : utilise VITE_API_URL si défini, sinon même origine (pratique derrière un reverse proxy)
const ORIGIN =
  (import.meta?.env?.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/$/, "")) ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:8000");

const API = `${ORIGIN}/api/auth`;

/**
 * Récupère/assure le cookie CSRF et retourne le token.
 */
export async function ensureCsrf() {
  const existing = getCookie("csrftoken");
  if (existing) return existing;
  const r = await fetch(`${API}/csrf/`, { credentials: "include" });
  if (!r.ok) throw new Error("Failed to obtain CSRF token");
  const data = await r.json().catch(() => ({}));
  return data?.csrfToken || getCookie("csrftoken");
}

async function refreshAccess() {
  const csrf = await ensureCsrf();
  const r = await fetch(`${API}/refresh/`, {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRFToken": csrf, "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  if (!r.ok) throw new Error("refresh_failed");
  return true;
}

/**
 * Appel générique API avec gestion CSRF + refresh automatique sur 401.
 */
export async function apiFetch(
  path,
  { method = "GET", body = null, json = true, withCsrf = false, retry = true } = {}
) {
  const init = { method, credentials: "include", headers: {} };

  if (json) init.headers["Content-Type"] = "application/json";
  if (withCsrf && method.toUpperCase() !== "GET") {
    const csrf = getCookie("csrftoken") || (await ensureCsrf());
    init.headers["X-CSRFToken"] = csrf;
  }
  if (body) init.body = json ? JSON.stringify(body) : body;

  const res1 = await fetch(`${API}${path}`, init);
  if (res1.status !== 401 || !retry) return res1;

  // Tentative de refresh du token d'accès puis retry une fois
  try {
    await refreshAccess();
    return await fetch(`${API}${path}`, init);
  } catch {
    return res1;
  }
}

// API haut niveau
export const AuthApi = {
  async me() {
    const r = await apiFetch("/me/", { method: "GET" });
    if (!r.ok) throw new Error(`me_${r.status}`);
    return r.json();
  },

  async login({ username, password }) {
    const r = await apiFetch("/login/", {
      method: "POST",
      withCsrf: true,
      body: { username, password }
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw Object.assign(new Error("login_failed"), { status: r.status, details: err });
    }
    return { ok: true };
  },

  async register({ username, email, first_name, last_name, password, password_confirm }) {
    const r = await apiFetch("/register/", {
      method: "POST",
      withCsrf: true,
      body: { username, email, first_name, last_name, password, password_confirm }
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw Object.assign(new Error("register_failed"), { status: r.status, details: err });
    }
    return { ok: true };
  },

  async refresh() {
    await refreshAccess();
    return { ok: true };
  },

  async logout() {
    const r = await apiFetch("/logout/", { method: "POST", withCsrf: true, body: {} });
    return r.ok;
  }
};
