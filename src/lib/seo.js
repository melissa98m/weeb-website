/**
 * Helpers SEO — canonical, Open Graph, robots
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
  "https://weeb.fr";

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

/**
 * Injecte les balises hreflang pour une page bilingue FR/EN.
 * path — chemin commun à la version FR et EN (ex: "/blog").
 * Crée 3 balises : hreflang="fr", hreflang="en", hreflang="x-default" (→ FR).
 */
export function setHreflang(path) {
  const langs = [
    { hreflang: "fr", href: `${SITE_URL}${path}` },
    { hreflang: "en", href: `${SITE_URL}${path}` },
    { hreflang: "x-default", href: `${SITE_URL}${path}` },
  ];
  const created = [];
  for (const { hreflang, href } of langs) {
    let link = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
    if (!link) {
      link = document.createElement("link");
      link.rel = "alternate";
      link.setAttribute("hreflang", hreflang);
      document.head.appendChild(link);
      created.push(link);
    }
    link.setAttribute("href", href);
  }
  return () => {
    for (const link of created) {
      if (document.head.contains(link)) link.remove();
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
