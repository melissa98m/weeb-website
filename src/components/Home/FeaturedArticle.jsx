import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { getEnv } from "../../lib/env";
import { safeChipStyle } from "../../utils/colors";

const API_BASE = getEnv("VITE_API_URL", "http://localhost:8000/api");

const TAG_REGEX = /<[^>]+>/g;
const WS_REGEX = /\s+/g;

function stripHtml(html = "") {
  return String(html).replace(TAG_REGEX, " ").replace(WS_REGEX, " ").trim();
}

function makeExcerpt(html = "", maxWords = 30) {
  const words = stripHtml(html).split(/\s+/);
  const cut = words.slice(0, maxWords).join(" ");
  return words.length > maxWords ? `${cut}…` : cut;
}

function estimateReadingMinutes(html = "") {
  return Math.max(1, Math.ceil(stripHtml(html).split(/\s+/).filter(Boolean).length / 200));
}

function formatDate(iso, lang) {
  try {
    return new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return iso;
  }
}

function IconArrowRight({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function FeaturedArticle() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";
  const prefersReducedMotion = useReducedMotion();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`${API_BASE}/articles/?page_size=1&ordering=-created_at`, {
      credentials: "omit",
      signal: ac.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        const items = Array.isArray(data) ? data : (data.results ?? []);
        if (items.length > 0) setArticle(items[0]);
      })
      .catch((e) => {
        if (e?.name !== "AbortError") console.error("FeaturedArticle fetch:", e);
      });
    return () => ac.abort();
  }, []);

  if (!article) return null;

  const title = (language === "fr" ? article.title_fr : article.title) || article.title;
  const excerpt = makeExcerpt(article.article_content || "");
  const cover = article.link_image || `https://picsum.photos/seed/article-${article.id}/900/500`;
  const author =
    (article.author && typeof article.author === "object"
      ? article.author.username || article.author.email
      : article.author) || "—";
  const genres = Array.isArray(article.genres) ? article.genres.slice(0, 2) : [];
  const readingMin = estimateReadingMinutes(article.article_content || "");
  const dateIso = article.created_at || article.updated_at;

  return (
    <section
      className="px-6 py-6 max-w-6xl mx-auto"
      aria-label={language === "fr" ? "Article à la une" : "Featured article"}
    >
      {/* Section label */}
      <motion.p
        initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className={`text-xs uppercase tracking-widest font-semibold mb-6 ${isDark ? "text-white/40" : "text-dark/40"}`}
      >
        {language === "fr" ? "À la une" : "Featured"}
      </motion.p>

      <motion.article
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={`rounded-2xl border overflow-hidden grid grid-cols-1 lg:grid-cols-5 ${
          isDark ? "bg-surface border-border" : "bg-white border-gray-200"
        }`}
      >
        {/* Image — 40% */}
        <Link
          to={`/blog/${article.id}`}
          className="block lg:col-span-2 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            src={cover}
            alt=""
            width={900}
            height={500}
            loading="lazy"
            decoding="async"
            className="w-full h-56 lg:h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
          />
        </Link>

        {/* Content — 60% */}
        <div className="lg:col-span-3 p-8 flex flex-col justify-between gap-6">
          <div>
            {/* Genre chips */}
            {genres.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {genres.map((g) => (
                  <span
                    key={g.id ?? g.name}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-full border"
                    style={safeChipStyle(g.color || null, theme)}
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <h2
              className={`font-display font-extrabold text-2xl md:text-3xl leading-snug tracking-tight ${
                isDark ? "text-white" : "text-dark"
              }`}
            >
              {title}
            </h2>

            <p className={`mt-3 text-base leading-relaxed line-clamp-3 ${isDark ? "text-white/55" : "text-dark/55"}`}>
              {excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Meta */}
            <div className={`flex items-center gap-3 text-xs ${isDark ? "text-white/40" : "text-dark/40"}`}>
              <span>{author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={dateIso}>{formatDate(dateIso, language)}</time>
              <span aria-hidden="true">·</span>
              <span>~{readingMin} min</span>
            </div>

            {/* CTA */}
            <Link
              to={`/blog/${article.id}`}
              className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded ${
                isDark ? "text-primary hover:text-white" : "text-secondary hover:text-dark"
              }`}
            >
              {language === "fr" ? "Lire l'article" : "Read article"}
              <IconArrowRight />
            </Link>
          </div>
        </div>
      </motion.article>
    </section>
  );
}
