
import { getCookie } from "./cookies";

/** Résout la base API de façon sûre. */
const PROD_API_URL = import.meta?.env?.VITE_PROD_API_URL?.replace(/\/$/, "") || import.meta?.env?.VITE_API_URL?.replace(/\/$/, "");
const DEV_API_URL = import.meta?.env?.VITE_DEV_API_URL?.replace(/\/$/, "") || import.meta?.env?.VITE_API_URL?.replace(/\/$/, "");

function resolveApiBase() {
  const isProduction = import.meta.env.MODE === "production";

  // Détection de l'environnement runtime
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    const isPreviewLocal = isLocalhost && (window.location.port === "4173" || window.location.port === "5173");
    const isVercel = /\.vercel\.app$/i.test(hostname);
    const isProductionDomain = /melissa-mangione\.com$/i.test(hostname);
    const isHttps = protocol === "https:";

    // 2a) Preview local (npm run preview) : utiliser DEV_API_URL ou localhost
    if (isPreviewLocal) {
      if (DEV_API_URL) return DEV_API_URL;
      return "http://localhost:8000/api";
    }

    // 2b) Mode production sur domaine public (prod ou preview) : utiliser le proxy
    if (isProduction && isHttps && (isProductionDomain || isVercel)) {
      return "/api"; // Proxy via Vercel (évite les cookies tiers)
    }

    // 2c) Mode production sur Vercel preview : utiliser PROD_API_URL ou backend direct
    if (isProduction && (isHttps || isVercel)) {
      if (PROD_API_URL) return PROD_API_URL;
      return "https://weebbackend.melissa-mangione.com/api";
    }
  }

  // 1) Priorité: variable d'env Vite explicite (build-time)
  const explicitUrl = import.meta?.env?.VITE_API_URL?.replace(/\/$/, "");
  if (explicitUrl) return explicitUrl;

  // 3) Mode développement: utilise DEV_API_URL
  if (!isProduction && DEV_API_URL) return DEV_API_URL;
  
  // 4) Dernier recours: dev local par défaut
  return "http://localhost:8000/api";
}

export const API_BASE = resolveApiBase();
export const API = `${API_BASE}/auth`;

const isDev = import.meta.env.DEV;


if (typeof window !== "undefined" && isDev) {
  window.__API_BASE__ = API_BASE; // pratique debug
}

/** ========== CSRF ========== */
export async function ensureCsrf() {
  const existing = getCookie("csrftoken");
  if (existing) {
    return existing;
  }

  const url = `${API}/csrf/`;
  let r;
  try {
    r = await fetch(url, { credentials: "include" });
  } catch (e) {
    throw new Error(`CSRF request failed (network/502?) → ${url}`);
  }
  if (!r.ok) {
    throw new Error(`CSRF ${r.status} at ${url}`);
  }

  try { await r.clone().json(); } catch (_) {}
  const token = getCookie("csrftoken");
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
  requestPasswordReset(payload) {
    return authRequest("/forgot-password/", { method: "POST", body: payload, csrf: true });
  },
  confirmPasswordReset(payload) {
    return authRequest("/reset-password/", { method: "POST", body: payload, csrf: true });
  },
};
