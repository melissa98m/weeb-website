export const COOKIE_CONSENT_NAME = "cookie_consent";
export const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const raw = parts.pop().split(";").shift();
    return raw ? decodeURIComponent(raw) : null;
  }
  return null;
}

export function setCookie(name, value, maxAge = COOKIE_CONSENT_MAX_AGE) {
  let cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
  if (window.location.protocol === "https:") {
    cookie += "; Secure";
  }
  document.cookie = cookie;
}

export function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}
  
