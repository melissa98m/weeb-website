import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const RELATED_PAGE_SIZE = 60;

/* ---------- utils ---------- */
function asList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}
const API_HOST = (API_BASE || "").replace(/\/api\/?$/, "");
function resolveImageUrl(src) {
  if (!src) return null;
  return /^https?:\/\//i.test(src) ? src : `${API_HOST}${src}`;
}
function formatDate(iso, lang) {
  try {
    return new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* ---------- carte ---------- */
const RelatedCard = React.memo(function RelatedCard({ item, theme, language }) {
  const cover =
    resolveImageUrl(
      item.link_image || item.cover || item.image || item.image_url
    ) || `https://picsum.photos/seed/article-${item.id}/500/300`;

  const authorLabel =
    (item.author &&
      typeof item.author === "object" &&
      (item.author.username || item.author.email)) ||
    (typeof item.author === "string" ? item.author : null) ||
    "—";

  const dateIso = item.created_at || item.updated_at || item.date;

  const frame =
    theme === "dark"
      ? "bg-[#1c1c1c] border-[#333] text-white"
      : "bg-white border-gray-200 text-gray-900";

  return (
    <Link
      to={`/blog/${item.id}`}
      className={`block min-w-[260px] w-[260px] rounded-xl border shadow hover:shadow-md transition overflow-hidden ${frame}`}
    >
      {cover && (
        <div className="h-36 w-full overflow-hidden">
          <img
            src={cover}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-3">
        <h4 className="text-sm font-semibold line-clamp-2">{item.title}</h4>
        <div className={`text-xs mt-2 ${theme === "dark" ? "text-white/70" : "text-gray-600"}`}>
          {authorLabel} • {formatDate(dateIso, language)}
        </div>

        {/* genres (bordure/texte colorés) */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(Array.isArray(item.genres) ? item.genres : []).slice(0, 3).map((g) => (
            <span
              key={`${item.id}-${g.id}`}
              className="px-1.5 py-0.5 rounded-full border text-[11px]"
              style={{
                backgroundColor: "transparent",
                borderColor: g.color || (theme === "dark" ? "#333333" : "#e5e7eb"),
                color: g.color || (theme === "dark" ? "#ffffff" : "#111827"),
              }}
            >
              {g.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
});

/* ---------- carrousel ---------- */
export default function RelatedCarousel({ currentId, currentGenres, theme, language }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const scrollerRef = useRef(null);

  const genreIds = useMemo(
    () => (Array.isArray(currentGenres) ? currentGenres.map((g) => g.id) : []),
    [currentGenres]
  );

  useEffect(() => {
    if (!genreIds.length) {
      setItems([]);
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const r = await fetch(
          `${API_BASE}/articles/?ordering=-id&page_size=${RELATED_PAGE_SIZE}`,
          { credentials: "omit", signal: ac.signal }
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const list = asList(data);

        const filtered = list
          .filter((a) => Number(a.id) !== Number(currentId))
          .filter((a) => {
            const gs = Array.isArray(a.genres) ? a.genres : [];
            return gs.some((g) => genreIds.includes(g.id));
          });

        setItems(filtered.slice(0, 20));
      } catch (e) {
        if (e.name !== "AbortError") setErr("Failed to load related articles.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [currentId, genreIds.join(",")]);

  const scrollBy = (delta) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  if (loading || !genreIds.length) return null;
  if (err || items.length === 0) return null;

  const barMask =
    theme === "dark"
      ? "from-[#1c1c1c] via-transparent to-[#1c1c1c]"
      : "from-white via-transparent to-white";

  // CSS pour masquer les barres de défilement (Firefox, WebKit, Edge/IE)
  const HIDE_SCROLLBAR_CSS = `
    .related-scroll { -ms-overflow-style: none; scrollbar-width: none; }
    .related-scroll::-webkit-scrollbar { display: none; }
  `;

  return (
    <section className="mt-10">
      <style>{HIDE_SCROLLBAR_CSS}</style>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">
          {language === "fr" ? "Articles du même genre" : "More in this genre"}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-320)}
            aria-label={language === "fr" ? "Faire défiler vers la gauche" : "Scroll left"}
            className={`px-3 py-1.5 rounded-md border text-sm ${
              theme === "dark"
                ? "bg-[#262626] text-white border-[#333] hover:bg-[#303030]"
                : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
            }`}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollBy(320)}
            aria-label={language === "fr" ? "Faire défiler vers la droite" : "Scroll right"}
            className={`px-3 py-1.5 rounded-md border text-sm ${
              theme === "dark"
                ? "bg-[#262626] text-white border-[#333] hover:bg-[#303030]"
                : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
            }`}
          >
            →
          </button>
        </div>
      </div>

      <div className="relative">
      

        <div
          ref={scrollerRef}
          className="related-scroll flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth px-1 pb-2"
          role="list"
          aria-label={language === "fr" ? "Carrousel d’articles similaires" : "Related articles carousel"}
        >
          {items.map((it) => (
            <div role="listitem" key={it.id}>
              <RelatedCard item={it} theme={theme} language={language} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}