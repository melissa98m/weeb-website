import { getCookie } from "./cookies";

// Base API : utilise VITE_API_URL si défini, sinon même origine (pratique derrière un reverse proxy)
const ORIGIN =
  (import.meta?.env?.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/$/, "")) ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:8000");

const API = `${ORIGIN}/auth`;

/**
 * Récupère/assure le cookie CSRF et retourne le token.
 */
export async function ensureCsrf() {
  const existing = getCookie("csrftoken");
  if (existing) return existing;

  const url = `${API}/csrf/`;
  let r;
  try {
    r = await fetch(url, { credentials: "include" });
  } catch (e) {
    throw new Error(`CSRF request failed (network/502?) → ${url}`);
  }
  if (!r.ok) throw new Error(`CSRF ${r.status} at ${url}`);

  // Certaines implémentations renvoient 204/texte : on ignore le JSON silencieusement
  try { await r.clone().json(); } catch (_) {}

  const token = getCookie("csrftoken");
  if (!token) throw new Error("CSRF cookie not found after call (check cookie domain/samesite).");
  return token;
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

  async login({ email, username, identifier, password }) {
    // Prend la première valeur dispo (email > username > identifier)
    const id = (email ?? username ?? identifier ?? "").trim();
    if (!id || !password) {
      const details = { non_field_errors: ["Username/email and password are required."] };
      throw Object.assign(new Error("login_failed"), { status: 400, details });
    }

    // IMPORTANT : ton backend marche avec { email, password } (test Postman)
    // Pour être blindé, on envoie aussi username/identifier (ignorés si inutiles)
    const body = { email: id, username: id, identifier: id, password };

    const r = await apiFetch("/login/", {
      method: "POST",
      withCsrf: true,
      body
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
