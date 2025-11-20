import { getCookie } from "./cookies";

// Normalise une base API propre (avec /api au besoin)
function normalizeApiBase() {
  const raw =
    (import.meta?.env?.VITE_API_URL && String(import.meta.env.VITE_API_URL).replace(/\/+$/, "")) ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:8000");
  // si VITE_API_URL pointe déjà sur .../api, garde tel quel
  return /\/api$/i.test(raw) ? raw : `${raw}/api`;
}

const API_BASE = normalizeApiBase();
const API = `${API_BASE}/auth`;

/**
 * Assure un token CSRF.
 * - Appelle toujours /auth/csrf/ avec credentials: 'include'
 * - Lit d'abord le token renvoyé en JSON (csrfToken/csrf/token)
 * - Fallback: tente le cookie "csrftoken" si présent (dev / non-HttpOnly)
 */
export async function ensureCsrf() {
  const url = `${API}/csrf/`;
  let r;
  try {
    r = await fetch(url, { credentials: "include", headers: { Accept: "application/json" } });
  } catch (e) {
    throw new Error(`CSRF request failed (network/502?) → ${url}`);
  }
  if (!r.ok) throw new Error(`CSRF ${r.status} at ${url}`);

  // Essaye de lire le token dans le JSON
  let token = null;
  try {
    const data = await r.clone().json();
    token = data?.csrfToken || data?.csrf || data?.token || null;
  } catch {
    // ok si endpoint renvoie 204/texte
  }

  // Fallback cookie (utile en dev ou si CSRF_COOKIE_HTTPONLY=False)
  if (!token) token = getCookie("csrftoken");

  if (!token) throw new Error("CSRF token not found (check cookie domain/samesite or JSON payload).");
  return token;
}

async function refreshAccess() {
  const csrf = await ensureCsrf();
  const r = await fetch(`${API}/refresh/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": csrf,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({}),
  });
  if (!r.ok) throw new Error("refresh_failed");
  return true;
}

/**
 * Appel générique API avec gestion CSRF + refresh sur 401.
 */
export async function apiFetch(
  path,
  { method = "GET", body = null, json = true, withCsrf = false, retry = true } = {}
) {
  const init = { method, credentials: "include", headers: { Accept: "application/json" } };

  if (json) init.headers["Content-Type"] = "application/json";
  if (withCsrf && method.toUpperCase() !== "GET") {
    const csrf = await ensureCsrf();
    init.headers["X-CSRFToken"] = csrf;
  }
  if (body != null) init.body = json ? JSON.stringify(body) : body;

  const url = `${API}${path}`;
  const res1 = await fetch(url, init);

  // 401 → tentative refresh + retry une fois
  if (res1.status === 401 && retry) {
    try {
      await refreshAccess();
      return await fetch(url, init);
    } catch {
      return res1;
    }
  }

  return res1;
}

export const AuthApi = {
  async me() {
    const r = await apiFetch("/me/", { method: "GET" });
    if (!r.ok) throw new Error(`me_${r.status}`);
    return r.json();
  },

  async login({ email, username, identifier, password }) {
    const id = (email ?? username ?? identifier ?? "").trim();
    if (!id || !password) {
      const details = { non_field_errors: ["Username/email and password are required."] };
      throw Object.assign(new Error("login_failed"), { status: 400, details });
    }

    const body = { email: id, username: id, identifier: id, password };
    const r = await apiFetch("/login/", { method: "POST", withCsrf: true, body });

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
      body: { username, email, first_name, last_name, password, password_confirm },
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
  },
};