import { deleteCookie, getCookie } from "./cookies";
import { appEnv } from "./env";

/** Résout la base API de façon simple et lisible. */
const EXPLICIT_API_URL = appEnv.VITE_API_URL?.replace(/\/$/, "");
const FALLBACK_API_URL = "https://weebbackend.melissa-mangione.com/api";

function resolveApiBase() {
  if (EXPLICIT_API_URL) return EXPLICIT_API_URL;
  return FALLBACK_API_URL;
}

export const API_BASE = resolveApiBase();
export const API = `${API_BASE}/auth`;
const OAUTH_GITHUB_URL = appEnv.VITE_OAUTH_GITHUB_URL?.trim();

const isDev = appEnv.DEV;
const RESERVED_ERROR_KEYS = new Set(["detail", "code", "status", "request_id", "retry_after", "errors"]);


if (typeof window !== "undefined" && isDev) {
  window.__API_BASE__ = API_BASE; // pratique debug
}

function storeAuthTokens() {
  // Backend auth is cookie-based (HttpOnly). Do not mirror tokens into JS storage.
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

function firstMessage(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const msg = firstMessage(item);
      if (msg) return msg;
    }
    return null;
  }
  if (value && typeof value === "object") {
    if (typeof value.detail === "string") return value.detail;
    if (Array.isArray(value.non_field_errors)) {
      const msg = firstMessage(value.non_field_errors);
      if (msg) return msg;
    }
    for (const item of Object.values(value)) {
      const msg = firstMessage(item);
      if (msg) return msg;
    }
  }
  return null;
}

function normalizeFieldErrors(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};

  const normalized = {};
  const mergeFieldEntries = (source) => {
    if (!source || typeof source !== "object" || Array.isArray(source)) return;
    for (const [key, value] of Object.entries(source)) {
      if (RESERVED_ERROR_KEYS.has(key)) continue;
      if (typeof value === "string") {
        normalized[key] = [value];
        continue;
      }
      if (Array.isArray(value)) {
        const cleaned = value.flatMap((item) => {
          if (typeof item === "string") return [item];
          const nested = firstMessage(item);
          return nested ? [nested] : [];
        });
        if (cleaned.length) normalized[key] = cleaned;
        continue;
      }
      if (value && typeof value === "object") {
        const nested = firstMessage(value);
        if (nested) normalized[key] = [nested];
      }
    }
  };

  mergeFieldEntries(payload.errors);
  mergeFieldEntries(payload);
  return normalized;
}

function normalizeErrorPayload(payload, { status, requestId } = {}) {
  const base = payload && typeof payload === "object" && !Array.isArray(payload)
    ? { ...payload }
    : {};
  const fields = normalizeFieldErrors(base);
  const detail =
    typeof base.detail === "string"
      ? base.detail
      : firstMessage(base.non_field_errors) || firstMessage(fields) || "Request failed.";

  const normalized = {
    ...base,
    detail,
    code: typeof base.code === "string" ? base.code : null,
    status: Number.isFinite(base.status) ? base.status : status ?? null,
    retry_after: Number.isFinite(Number(base.retry_after)) ? Math.ceil(Number(base.retry_after)) : null,
    request_id: typeof base.request_id === "string" ? base.request_id : requestId ?? null,
    errors: fields,
  };

  for (const [key, value] of Object.entries(fields)) {
    if (normalized[key] === undefined) {
      normalized[key] = value;
    }
  }

  return normalized;
}

function createApiError({ message, details, status = null, url, method, cause = null, network = false }) {
  const error = new Error(message);
  error.name = "ApiClientError";
  error.status = status;
  error.url = url;
  error.method = method;
  error.network = network;
  error.details = details || {};
  error.code = error.details?.code || null;
  error.requestId = error.details?.request_id || null;
  error.retryAfter = Number.isFinite(Number(error.details?.retry_after))
    ? Math.ceil(Number(error.details.retry_after))
    : null;
  error.cause = cause;
  return error;
}

async function parseResponsePayload(response) {
  const contentType = response.headers?.get?.("content-type") || "";
  if (typeof response.json === "function" && (contentType.includes("application/json") || !contentType)) {
    try {
      return await response.json();
    } catch {
      // fall through to text parsing when available
    }
  }

  if (response.status === 204) return null;

  try {
    const text = await response.text();
    return text ? { detail: text } : null;
  } catch {
    return null;
  }
}

function buildHttpError(response, data, { url, method }) {
  const requestId = response.headers?.get?.("x-request-id") || null;
  const details = normalizeErrorPayload(data, {
    status: response.status,
    requestId,
  });
  const message =
    details.detail ||
    `${method} ${url} failed with status ${response.status}`;

  return createApiError({
    message,
    details,
    status: response.status,
    url,
    method,
  });
}

function buildNetworkError({ url, method, cause }) {
  return createApiError({
    message: `Network error while calling ${method} ${url}`,
    details: {
      detail: "Network error. Check your connection and try again.",
      code: "network_error",
      status: null,
      request_id: null,
      retry_after: null,
      errors: {},
    },
    status: null,
    url,
    method,
    cause,
    network: true,
  });
}

export function getApiErrorDetails(error) {
  return error?.details && typeof error.details === "object" ? error.details : {};
}

export function getApiFieldError(error, keys) {
  const keyList = Array.isArray(keys) ? keys : [keys];
  const details = getApiErrorDetails(error);
  for (const key of keyList) {
    const source = details.errors?.[key] ?? details[key];
    if (Array.isArray(source) && source.length) return source.join(" ");
    if (typeof source === "string") return source;
  }
  return null;
}

export function mapApiFieldErrors(error, mapping) {
  return Object.entries(mapping).reduce((acc, [uiField, apiFields]) => {
    const message = getApiFieldError(error, apiFields);
    if (message) acc[uiField] = message;
    return acc;
  }, {});
}

export function getApiErrorMessage(error, fallback = "Request failed.") {
  if (!error) return fallback;
  const details = getApiErrorDetails(error);
  return (
    firstMessage(details.non_field_errors) ||
    details.detail ||
    error.detail ||
    error.message ||
    fallback
  );
}

export function getApiRetryAfter(error) {
  const details = getApiErrorDetails(error);
  const raw = error?.retryAfter ?? details?.retry_after;
  return Number.isFinite(Number(raw)) && Number(raw) > 0 ? Math.ceil(Number(raw)) : null;
}

export function getApiRequestId(error) {
  return error?.requestId || getApiErrorDetails(error)?.request_id || null;
}

export function getApiSupportHint(error, language = "en") {
  const requestId = getApiRequestId(error);
  if (!requestId) return null;
  return language === "fr" ? `Référence support : ${requestId}` : `Support reference: ${requestId}`;
}

export function getApiLockoutMessage(error, language = "en", fallbackSeconds = 30) {
  const retryAfter = getApiRetryAfter(error) ?? fallbackSeconds;
  return language === "fr"
    ? `Trop de tentatives. Réessayez dans ${retryAfter}s.`
    : `Too many attempts. Retry in ${retryAfter}s.`;
}

/** ========== CSRF ========== */
async function fetchCsrfToken(url) {
  let r;
  try {
    r = await fetch(url, { credentials: "include" });
  } catch (e) {
    throw buildNetworkError({ url, method: "GET", cause: e });
  }
  if (!r.ok) {
    const data = await parseResponsePayload(r);
    throw buildHttpError(r, data, { url, method: "GET" });
  }

  let bodyToken = null;
  try {
    const data = await r.clone().json();
    bodyToken =
      data?.csrfToken ||
      data?.csrf_token ||
      data?.csrftoken ||
      data?.csrf ||
      data?.token ||
      null;
  } catch (_) {}

  if (bodyToken) {
    setCookie("csrftoken", bodyToken);
  }

  const token = bodyToken || getCookie("csrftoken");
  if (typeof window !== "undefined" && appEnv.DEV) {
    console.debug("[CSRF] ok response", {
      url,
      status: r.status,
      hasCookie: !!token,
      tokenFromBody: !!bodyToken,
    });
  }
  if (!token) {
    const err = new Error("CSRF cookie not found after call (check cookie domain/samesite).");
    err.status = 200;
    throw err;
  }
  return token;
}

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

  const urls = [`${API}/csrf/`, `${API_BASE}/csrf/`];
  let lastError;
  for (const url of urls) {
    try {
      return await fetchCsrfToken(url);
    } catch (e) {
      lastError = e;
      if (typeof window !== "undefined" && appEnv.DEV) {
        console.debug("[CSRF] failed", { url, status: e?.status, message: e?.message });
      }
      if (e?.status !== 404) break;
    }
  }
  throw lastError ?? new Error("CSRF fetch failed.");
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
  if (typeof window !== "undefined") {
    console.debug("[AUTH] request", { method, url, hasBody: !!body, csrf });
  }
  let response;
  try {
    response = await fetch(url, {
      method,
      credentials: "include",
      headers: finalHeaders,
        body: isFormData ? payload : payload ?? undefined,
    });
  } catch (networkError) {
    throw buildNetworkError({ url, method, cause: networkError });
  }

  const data = await parseResponsePayload(response);

  if (!response.ok) {
    if (typeof window !== "undefined") {
      console.debug("[AUTH] error", { url, status: response.status, details: data });
    }
    throw buildHttpError(response, data, { url, method });
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
    throw buildNetworkError({ url, method, cause: networkError });
  }

  const data = await parseResponsePayload(response);

  if (!response.ok) {
    throw buildHttpError(response, data, { url, method });
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
    throw buildNetworkError({ url, method, cause: networkError });
  }

  if (!response.ok) {
    const data = await parseResponsePayload(response);
    throw buildHttpError(response, data, { url, method });
  }

  return response;
}

export const AuthApi = {
  me() {
    return authRequest("/me/");
  },
  data() {
    return authRequest("/gdpr/");
  },
  async exportData() {
    const response = await authRequestRaw("/gdpr/");
    const contentType = response.headers?.get?.("content-type") || "";
    let blob;
    if (contentType.includes("application/json")) {
      const json = await response.json();
      blob = new Blob([JSON.stringify(json, null, 2)], {
        type: "application/json",
      });
    } else {
      blob = await response.blob();
    }
    const disposition = response.headers?.get?.("content-disposition") || "";
    return { blob, disposition };
  },
  deleteAccount() {
    return authRequest("/gdpr/", { method: "DELETE", csrf: true });
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
  oauthGoogle(payload) {
    return authRequest("/oauth/google/", { method: "POST", body: payload, csrf: true }).then(
      (data) => {
        storeAuthTokens(data);
        return data;
      }
    );
  },
  logout() {
    return authRequest("/logout/", { method: "POST", csrf: true }).finally(() => {
      clearAuthTokens();
    });
  },
  refresh() {
    return authRequest("/refresh/", { method: "POST", csrf: true });
  },
  requestPasswordReset(payload) {
    return authRequest("/forgot-password/", { method: "POST", body: payload, csrf: true });
  },
  confirmPasswordReset(payload) {
    return authRequest("/reset-password/", { method: "POST", body: payload, csrf: true });
  },
};

export function getEnabledOAuthProviders() {
  const providers = [];
  if (OAUTH_GITHUB_URL) {
    providers.push({ id: "github", label: "GitHub", url: OAUTH_GITHUB_URL });
  }
  return providers;
}

export const NewsletterApi = {
  subscribe(payload) {
    return apiRequest("/newsletter-consents/", {
      method: "POST",
      body: payload,
      csrf: true,
    });
  },
};

export const SubjectsApi = {
  list() {
    return apiRequest("/subjects/");
  },
};

export const MessagesApi = {
  create(payload) {
    return apiRequest("/messages/", {
      method: "POST",
      body: payload,
    });
  },
};
