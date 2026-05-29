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

function getTitle(article, language) {
  return (language === "fr" ? article.title_fr : article.title) || article.title;
}

function getCover(article) {
  return article.link_image || `https://picsum.photos/seed/article-${article.id}/900/500`;
}

function getAuthor(article) {
  return (
    article.author && typeof article.author === "object"
      ? article.author.username || article.author.email
      : article.author
  ) || "—";
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
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`${API_BASE}/articles/?page_size=3&ordering=-created_at`, {
      credentials: "omit",
      signal: ac.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        const items = Array.isArray(data) ? data : (data.results ?? []);
        setArticles(items.slice(0, 3));
      })
      .catch((e) => {
        if (e?.name !== "AbortError") console.error("FeaturedArticle fetch:", e);
      });
    return () => ac.abort();
  }, []);

  if (articles.length === 0) return null;

  const isFr = language === "fr";
  const [main, ...secondary] = articles;
  const cardBase = `rounded-2xl border overflow-hidden flex flex-col ${isDark ? "bg-surface border-border" : "bg-white border-gray-200"}`;
  const ctaClass = `inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded ${isDark ? "text-primary hover:text-white" : "text-secondary hover:text-dark"}`;
  const metaClass = `flex items-center gap-2 text-xs ${isDark ? "text-white/60" : "text-dark/40"}`;

  return (
    <section
      className="px-6 py-6 max-w-6xl mx-auto"
      aria-label={isFr ? "Derniers articles" : "Latest articles"}
    >
      {/* Label */}
      <motion.p
        initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className={`text-xs uppercase tracking-widest font-semibold mb-6 ${isDark ? "text-white/60" : "text-dark/40"}`}
      >
        {isFr ? "Derniers articles" : "Latest articles"}
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-stretch">

        {/* ── Main article — large (2/3) ───────────────────────────────── */}
        <motion.article
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className={`lg:col-span-2 ${cardBase}`}
        >
          {/* Image */}
          <Link
            to={`/blog/${main.id}`}
            className="block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
            tabIndex={-1}
            aria-hidden="true"
          >
            <img
              src={getCover(main)}
              alt=""
              width={900}
              height={500}
              loading="lazy"
              decoding="async"
              className="w-full aspect-video object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          </Link>

          {/* Content */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-5">
            <div>
              {/* Genres */}
              {Array.isArray(main.genres) && main.genres.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {main.genres.slice(0, 2).map((g) => (
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

              <h2 className={`font-display font-extrabold text-2xl md:text-3xl leading-snug tracking-tight ${isDark ? "text-white" : "text-dark"}`}>
                {getTitle(main, language)}
              </h2>

              <p className={`mt-3 text-base leading-relaxed line-clamp-3 ${isDark ? "text-white/55" : "text-dark/55"}`}>
                {makeExcerpt(main.article_content || "", 35)}
              </p>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className={metaClass}>
                <span>{getAuthor(main)}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={main.created_at || main.updated_at}>
                  {formatDate(main.created_at || main.updated_at, language)}
                </time>
                <span aria-hidden="true">·</span>
                <span>~{estimateReadingMinutes(main.article_content || "")} min</span>
              </div>
              <Link to={`/blog/${main.id}`} className={ctaClass}>
                {isFr ? "Lire l'article" : "Read article"}
                <IconArrowRight />
              </Link>
            </div>
          </div>
        </motion.article>

        {/* ── Secondary articles — stacked (1/3) ──────────────────────── */}
        <div className="flex flex-col gap-4">
          {secondary.map((article, i) => {
            const title = getTitle(article, language);
            const genres = Array.isArray(article.genres) ? article.genres.slice(0, 1) : [];
            const dateIso = article.created_at || article.updated_at;

            return (
              <motion.article
                key={article.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i + 1) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className={`flex-1 ${cardBase}`}
              >
                {/* Image */}
                <Link
                  to={`/blog/${article.id}`}
                  className="block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <img
                    src={getCover(article)}
                    alt=""
                    width={600}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-36 object-cover transition-transform duration-700 hover:scale-[1.02]"
                  />
                </Link>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                  <div>
                    {genres.length > 0 && (
                      <div className="flex gap-1.5 mb-2">
                        {genres.map((g) => (
                          <span
                            key={g.id ?? g.name}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                            style={safeChipStyle(g.color || null, theme)}
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <h3 className={`font-display font-bold text-base leading-snug line-clamp-2 ${isDark ? "text-white" : "text-dark"}`}>
                      {title}
                    </h3>

                    <p className={`mt-1.5 text-sm leading-relaxed line-clamp-2 ${isDark ? "text-white/70" : "text-dark/50"}`}>
                      {makeExcerpt(article.article_content || "", 18)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className={metaClass}>
                      <time dateTime={dateIso}>{formatDate(dateIso, language)}</time>
                      <span aria-hidden="true">·</span>
                      <span>~{estimateReadingMinutes(article.article_content || "")} min</span>
                    </div>
                    <Link to={`/blog/${article.id}`} className={ctaClass}>
                      {isFr ? "Lire" : "Read"}
                      <IconArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
