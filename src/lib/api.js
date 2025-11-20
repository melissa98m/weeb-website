
import { getCookie } from "./cookies";

/** Résout la base API de façon sûre. */
const PROD_API_URL = import.meta?.env?.VITE_PROD_API_URL?.replace(/\/$/, "") || import.meta?.env?.VITE_API_URL?.replace(/\/$/, "");
const DEV_API_URL = import.meta?.env?.VITE_DEV_API_URL?.replace(/\/$/, "") || import.meta?.env?.VITE_API_URL?.replace(/\/$/, "");

function resolveApiBase() {
  const isProduction = import.meta.env.MODE === "production";
  
  // 1) Priorité: variable d'env Vite explicite (build-time)
  const explicitUrl = import.meta?.env?.VITE_API_URL?.replace(/\/$/, "");
  if (explicitUrl) return explicitUrl;

  // 2) Mode production: utilise PROD_API_URL
  if (isProduction) {
    if (PROD_API_URL) return PROD_API_URL;
    // Fallback: détection HTTPS/Vercel en production
    if (typeof window !== "undefined") {
      const isHttps = window.location.protocol === "https:";
      const isVercel = /\.vercel\.app$/i.test(window.location.hostname);
      if (isHttps || isVercel) {
        return PROD_API_URL || "https://weebbackend.melissa-mangione.com/api";
      }
    }
  }

  // 3) Mode développement: utilise DEV_API_URL
  if (DEV_API_URL) return DEV_API_URL;
  
  // 4) Dernier recours: dev local par défaut
  return "http://localhost:8000/api";
}

export const API_BASE = resolveApiBase();
export const API = `${API_BASE}/auth`;

if (typeof window !== "undefined") {
  window.__API_BASE__ = API_BASE; // pratique debug
  console.log("[API_BASE]", API_BASE);
}

/** ========== CSRF ========== */
export async function ensureCsrf() {
  const existing = getCookie("csrftoken");
  if (existing) {
    console.log("[CSRF] cookie présent");
    return existing;
  }

  const url = `${API}/csrf/`;
  console.log("[CSRF] GET", url);
  let r;
  try {
    r = await fetch(url, { credentials: "include" });
  } catch (e) {
    console.error("[CSRF] network error", e);
    throw new Error(`CSRF request failed (network/502?) → ${url}`);
  }
  if (!r.ok) {
    console.error("[CSRF] status", r.status);
    throw new Error(`CSRF ${r.status} at ${url}`);
  }

  try { await r.clone().json(); } catch (_) {}
  const token = getCookie("csrftoken");
  console.log("[CSRF] après appel:", token ? "OK" : "ABSENT");
  if (!token) throw new Error("CSRF cookie not found after call (check cookie domain/samesite).");
  return token;
}

async function authRequest(path, { method = "GET", body, headers = {}, csrf = false } = {}) {
  const finalHeaders = {
    Accept: "application/json",
    ...headers,
  };

  let payload = body;
  const isFormData = body instanceof FormData;
  if (payload && !isFormData) {
    finalHeaders["Content-Type"] = "application/json";
    payload = JSON.stringify(payload);
  }

  if (csrf) {
    const token = getCookie("csrftoken") ?? (await ensureCsrf());
    finalHeaders["X-CSRFToken"] = token;
  }

  const url = `${API}${path}`;
  let response;
  try {
    response = await fetch(url, {
      method,
      credentials: "include",
      headers: finalHeaders,
      body: isFormData ? payload : payload ?? undefined,
    });
  } catch (networkError) {
    const err = new Error(`Auth API network error for ${url}`);
    err.cause = networkError;
    throw err;
  }

  const contentType = response.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (_) {
      data = null;
    }
  } else if (response.status !== 204) {
    try {
      const text = await response.text();
      if (text) data = { detail: text };
    } catch (_) {
      data = null;
    }
  }

  if (!response.ok) {
    const err = new Error(`Auth API ${response.status} ${response.statusText}`);
    err.status = response.status;
    err.details = data;
    throw err;
  }

  return data;
}

export const AuthApi = {
  me() {
    return authRequest("/me/");
  },
  login(payload) {
    return authRequest("/login/", { method: "POST", body: payload, csrf: true });
  },
  register(payload) {
    return authRequest("/register/", { method: "POST", body: payload, csrf: true });
  },
  logout() {
    return authRequest("/logout/", { method: "POST", csrf: true });
  },
};
