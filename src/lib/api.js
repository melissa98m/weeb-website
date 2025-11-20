import { getCookie } from "./cookies";

// Construit toujours .../api/auth
const RAW = (import.meta?.env?.VITE_API_URL?.replace(/\/$/, "")) ||
            (typeof window !== "undefined" ? window.location.origin : "http://localhost:8000");
const API_BASE = RAW.endsWith("/api") ? RAW : `${RAW}/api`;
const API = `${API_BASE}/auth`;

/** Récupère/assure le cookie CSRF et retourne le token. */
export async function ensureCsrf() {
  const existing = getCookie("csrftoken");
  if (existing) return existing;

  const url = `${API}/csrf/`;
  let r;
  try {
    r = await fetch(url, { credentials: "include" });
  } catch {
    throw new Error(`CSRF request failed → ${url}`);
  }
  if (!r.ok) throw new Error(`CSRF ${r.status} at ${url}`);

  // Ignore le body s'il n'y en a pas
  try { await r.clone().json(); } catch {}

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

/** Appel API générique avec CSRF + retry 401 via /refresh/ */
export async function apiFetch(path, { method="GET", body=null, json=true, withCsrf=false, retry=true } = {}) {
  const init = { method, credentials: "include", headers: {} };
  if (json) init.headers["Content-Type"] = "application/json";
  if (withCsrf && method.toUpperCase() !== "GET") {
    const csrf = getCookie("csrftoken") || (await ensureCsrf());
    init.headers["X-CSRFToken"] = csrf;
  }
  if (body) init.body = json ? JSON.stringify(body) : body;

  const url = `${API}${path}`;
  const res1 = await fetch(url, init);
  if (res1.status !== 401 || !retry) return res1;

  try {
    await refreshAccess();
    return await fetch(url, init);
  } catch {
    return res1;
  }
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
      const details = { non_field_errors: ["Identifier and password are required."] };
      throw Object.assign(new Error("login_failed"), { status: 400, details });
    }
    const r = await apiFetch("/login/", {
      method: "POST",
      withCsrf: true,
      body: { email: id, username: id, identifier: id, password }
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw Object.assign(new Error("login_failed"), { status: r.status, details: err });
    }
    return { ok: true };
  },
  async register(payload) {
    const r = await apiFetch("/register/", { method: "POST", withCsrf: true, body: payload });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw Object.assign(new Error("register_failed"), { status: r.status, details: err });
    }
    return { ok: true };
  },
  async refresh() { await refreshAccess(); return { ok: true }; },
  async logout() { const r = await apiFetch("/logout/", { method: "POST", withCsrf: true, body: {} }); return r.ok; }
};

// petit helper cookie si besoin ici
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}
