/**
 * Helpers SEO — canonical, Open Graph, Twitter Cards, robots
 *
 * These functions imperatively update the <head> from page-level useEffect hooks.
 * Each one returns a cleanup function for use as the useEffect return value.
 *
 * Usage inside a useEffect:
 *   const cleanCanonical = setCanonical("/blog");
 *   return cleanCanonical;
 */

const SITE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  "https://weeb.melissa-mangione.com";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/** Adds or updates the <link rel="canonical"> tag. */
export function setCanonical(path) {
  const url = `${SITE_URL}${path}`;
  let link = document.querySelector('link[rel="canonical"]');
  const created = !link;
  if (created) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  const prev = link.getAttribute("href");
  link.setAttribute("href", url);
  return () => {
    if (created) {
      if (document.head.contains(link)) link.remove();
    } else {
      link.setAttribute("href", prev || "");
    }
  };
}

/** Adds or updates a <meta property="og:*"> tag. */
export function setOgMeta(property, content) {
  let meta = document.querySelector(`meta[property="${property}"]`);
  const created = !meta;
  if (created) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  const prev = meta.getAttribute("content");
  meta.setAttribute("content", content);
  return () => {
    if (created) {
      if (document.head.contains(meta)) meta.remove();
    } else {
      meta.setAttribute("content", prev || "");
    }
  };
}

/** Adds or updates a <meta name="twitter:*"> tag. */
export function setTwitterMeta(name, content) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  const created = !meta;
  if (created) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  const prev = meta.getAttribute("content");
  meta.setAttribute("content", content);
  return () => {
    if (created) {
      if (document.head.contains(meta)) meta.remove();
    } else {
      meta.setAttribute("content", prev || "");
    }
  };
}

/**
 * Injects hreflang tags for a bilingual FR/EN site sharing a single URL structure.
 * Only x-default is used since both languages live at the same path.
 * path — the page path (e.g. "/blog").
 */
export function setHreflang(path) {
  const href = `${SITE_URL}${path}`;
  let link = document.querySelector('link[rel="alternate"][hreflang="x-default"]');
  const created = !link;
  if (created) {
    link = document.createElement("link");
    link.rel = "alternate";
    link.setAttribute("hreflang", "x-default");
    document.head.appendChild(link);
  }
  const prev = link.getAttribute("href");
  link.setAttribute("href", href);
  return () => {
    if (created) {
      if (document.head.contains(link)) link.remove();
    } else {
      link.setAttribute("href", prev || "");
    }
  };
}

/** Injects or updates a JSON-LD script block in the <head>. */
export function setJsonLd(id, data) {
  let script = document.getElementById(id);
  const created = !script;
  if (created) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
  return () => {
    const el = document.getElementById(id);
    if (el) el.remove();
  };
}

export { SITE_URL };
