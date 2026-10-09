import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { safeChipStyle } from "../../utils/colors";

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

/**
 * BlogCard — carte article cliquable
 * Desktop : hover sur l'image révèle l'extrait via overlay.
 * Mobile : extrait toujours visible dans le corps de la carte.
 *
 * Props:
 * - post: { id, title, title_fr?, excerpt, excerpt_fr?, cover,
 *            author?, created_at?, date?, tags?, _genres?, likes_count? }
 * - language: "fr" | "en"
 * - theme: "dark" | "light"
 * - idx: index pour décaler l'animation d'entrée
 * - isLcp: true sur la première carte (priorité de chargement image)
 */
export default function BlogCard({
  post,
  language,
  theme,
  idx = 0,
  isLcp = false,
}) {
  const title = (language === "fr" ? post.title_fr : post.title) || post.title;
  const excerpt =
    (language === "fr" ? post.excerpt_fr : post.excerpt) ||
    post.excerpt ||
    title;

  // readingMin computed from the full content inside normalizeArticle (Blog.jsx)
  const readingMin = post.readingMin ?? 1;

  const authorLabel =
    (post.author &&
      typeof post.author === "object" &&
      (post.author.username || post.author.email)) ||
    (typeof post.author === "string" ? post.author : null) ||
    "—";

  const dateIso = post.created_at || post.date;
  const shouldReduceMotion = useReducedMotion();

  const cardClass =
    theme === "dark"
      ? "bg-surface text-white border-border"
      : "bg-white text-gray-900 border-gray-200";

  const metaColor = theme === "dark" ? "text-white/60" : "text-gray-500";

  const chips = (
    Array.isArray(post._genres) && post._genres.length
      ? post._genres.map((g) => ({
          key: g.id ?? g.name,
          label: g.name,
          color: g.color || null,
        }))
      : Array.isArray(post.tags)
      ? post.tags.map((name) => ({ key: name, label: name, color: null }))
      : []
  ).slice(0, 6);

  return (
    <motion.article
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
      transition={
        shouldReduceMotion ? { duration: 0 } : { duration: 0.35, delay: idx * 0.04 }
      }
      className={`rounded-xl border ${cardClass} group hover:border-primary/40 transition-colors duration-200`}
    >
      <Link
        to={`/blog/${post.id}`}
        className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
      >
        {/* Image + hover overlay (desktop) */}
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={post.cover}
            alt={title}
            width={600}
            height={176}
            className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading={isLcp ? "eager" : "lazy"}
            fetchPriority={isLcp ? "high" : "auto"}
            decoding="async"
          />
          {/* Excerpt overlay — desktop only, hidden when reduced-motion is preferred */}
          {!shouldReduceMotion && (
            <div
              className="absolute inset-0 hidden md:flex flex-col justify-end p-4 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-hidden="true"
            >
              <p className="text-white text-sm line-clamp-3 leading-relaxed">
                {excerpt}
              </p>
            </div>
          )}
        </div>

        <div className="p-5">
          <h2 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">{title}</h2>

          {/* Excerpt visible on mobile only (shown in the overlay on desktop) */}
          <p
            className={`text-sm mb-4 line-clamp-3 md:hidden ${
              theme === "dark" ? "text-white/70" : "text-gray-600"
            }`}
          >
            {excerpt}
          </p>

          {/* Chips genres */}
          {chips.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3 text-xs">
              {chips.map((c) => (
                <span
                  key={c.key}
                  title={c.label}
                  className="font-mono text-[11px] px-2 py-0.5 rounded-full border"
                  style={safeChipStyle(c.color, theme)}
                >
                  {c.label}
                </span>
              ))}
            </div>
          )}

          {/* Meta: author · date · reading time + likes */}
          <div className={`flex items-center justify-between text-xs ${metaColor}`}>
            <span className="flex items-center gap-1.5 flex-wrap">
              {authorLabel} •{" "}
              <time dateTime={dateIso}>{formatDate(dateIso, language)}</time>
              {" "}•{" "}
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                ~{readingMin} min
              </span>
            </span>
            {(post.likes_count ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <span aria-hidden="true">♥</span> {post.likes_count}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
