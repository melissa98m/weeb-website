
import { deleteCookie, getCookie, setCookie } from "./cookies";

/** Résout la base API de façon simple et lisible. */
const EXPLICIT_API_URL = import.meta?.env?.VITE_API_URL?.replace(/\/$/, "");
const FALLBACK_API_URL = "https://weebbackend.melissa-mangione.com/api";

function resolveApiBase() {
  if (EXPLICIT_API_URL) return EXPLICIT_API_URL;
  return FALLBACK_API_URL;
}

export const API_BASE = resolveApiBase();
export const API = `${API_BASE}/auth`;

const isDev = import.meta.env.DEV;


if (typeof window !== "undefined" && isDev) {
  window.__API_BASE__ = API_BASE; // pratique debug
}

function storeAuthTokens(payload) {
  if (typeof window === "undefined" || !payload) return;
  const access =
    payload.access ||
    payload.access_token ||
    payload.token ||
    payload.accessToken ||
    null;
  const refresh =
    payload.refresh ||
    payload.refresh_token ||
    payload.refreshToken ||
    null;
  try {
    if (access) window.localStorage?.setItem?.("access_token", access);
    if (refresh) window.localStorage?.setItem?.("refresh_token", refresh);
  } catch {
    // ignore storage errors
  }

  if (access) {
    setCookie("access", access);
    setCookie("access_token", access);
  }
}

function clearAuthTokens() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage?.removeItem?.("access_token");
    window.localStorage?.removeItem?.("refresh_token");
    window.localStorage?.removeItem?.("access");
    window.localStorage?.removeItem?.("refresh");
  } catch {
    // ignore storage errors
  }
  deleteCookie("access");
  deleteCookie("access_token");
}

/** ========== CSRF ========== */
export async function ensureCsrf() {
  const existing = getCookie("csrftoken");
  if (existing) {
    return existing;
  }

  if (typeof window !== "undefined" && window.Cypress) {
    const token = "testtoken";
    document.cookie = `csrftoken=${token}; path=/`;
    return token;
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

async function apiRequest(path, { method = "GET", body, headers = {}, csrf = false } = {}) {
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

  const url = `${API_BASE}${path}`;
  let response;
  try {
    response = await fetch(url, {
      method,
      credentials: "include",
      headers: finalHeaders,
      body: isFormData ? payload : payload ?? undefined,
    });
  } catch (networkError) {
    const err = new Error(`API network error for ${url}`);
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
    const err = new Error(`API ${response.status} ${response.statusText}`);
    err.status = response.status;
    err.details = data;
    throw err;
  }

  return data;
}

async function authRequestRaw(path, { method = "GET", headers = {}, csrf = false } = {}) {
  const finalHeaders = {
    Accept: "*/*",
    ...headers,
  };

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
    });
  } catch (networkError) {
    const err = new Error(`Auth API network error for ${url}`);
    err.cause = networkError;
    throw err;
  }

  if (!response.ok) {
    const err = new Error(`Auth API ${response.status} ${response.statusText}`);
    err.status = response.status;
    throw err;
  }

  return response;
}

export const AuthApi = {
  me() {
    return authRequest("/me/");
  },
  data() {
    return authRequest("/me/data/");
  },
  async exportData() {
    const response = await authRequestRaw("/me/export/");
    const contentType = response.headers.get("content-type") || "";
    let blob;
    if (contentType.includes("application/json")) {
      const json = await response.json();
      blob = new Blob([JSON.stringify(json, null, 2)], {
        type: "application/json",
      });
    } else {
      blob = await response.blob();
    }
    const disposition = response.headers.get("content-disposition") || "";
    return { blob, disposition };
  },
  deleteAccount() {
    return authRequest("/me/delete/", { method: "DELETE", csrf: true });
  },
  login(payload) {
    return authRequest("/login/", { method: "POST", body: payload, csrf: true }).then(
      (data) => {
        storeAuthTokens(data);
        return data;
      }
    );
  },
  register(payload) {
    return authRequest("/register/", { method: "POST", body: payload, csrf: true });
  },
  logout() {
    return authRequest("/logout/", { method: "POST", csrf: true }).finally(() => {
      clearAuthTokens();
    });
  },
  requestPasswordReset(payload) {
    return authRequest("/forgot-password/", { method: "POST", body: payload, csrf: true });
  },
  confirmPasswordReset(payload) {
    return authRequest("/reset-password/", { method: "POST", body: payload, csrf: true });
  },
};

export const NewsletterApi = {
  subscribe(payload) {
    return apiRequest("/newsletter-consents/", {
      method: "POST",
      body: payload,
      csrf: true,
    });
  },
};
