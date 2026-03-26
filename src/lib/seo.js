/**
 * Helpers SEO — canonical, Open Graph, Twitter Cards, robots
 *
 * Ces fonctions manipulent le <head> de manière impérative depuis les useEffect
 * des pages. Elles retournent un cleanup pour le démontage du composant.
 *
 * Utilisation dans un useEffect :
 *   const cleanCanonical = setCanonical("/blog");
 *   return cleanCanonical;
 */

const SITE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  "https://weeb.melissa-mangione.com";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/** Ajoute ou met à jour <link rel="canonical">. */
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

/** Ajoute ou met à jour une <meta property="og:*">. */
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

/** Ajoute ou met à jour une <meta name="twitter:*">. */
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
 * Injecte les balises hreflang pour un site bilingue FR/EN sur une même URL.
 * Utilise uniquement x-default car les deux langues partagent le même chemin.
 * path — chemin de la page (ex: "/blog").
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

/** Injecte ou met à jour un script JSON-LD dans le <head>. */
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
