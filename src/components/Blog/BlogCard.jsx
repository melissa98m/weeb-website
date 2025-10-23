import React from "react";
import { motion } from "framer-motion";
import Button from "../Button";

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

function estimateReadingMinutes(text = "") {
  const words =
    String(text || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length || 0;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * BlogCard — carte réutilisable pour un article
 * Props:
 * - post: {
 *     id, title, title_fr, excerpt, excerpt_fr, cover,
 *     author?: { username?: string, email?: string } | string,
 *     created_at?: string, date?: string,
 *     tags?: string[],
 *     _genres?: Array<{ id:number; name:string; color:string }>
 *   }
 * - language: "fr" | "en"
 * - theme: "dark" | "light"
 * - idx: index pour décaler l’animation
 * - onViewSummary: (post) => void — ouvre la modal de résumé
 * - labels: { viewSummary: string }
 */
export default function BlogCard({
  post,
  language,
  theme,
  idx = 0,
  onViewSummary,
  labels = { viewSummary: "View summary" },
}) {
  const title = (language === "fr" ? post.title_fr : post.title) || post.title;
  const excerpt =
    (language === "fr" ? post.excerpt_fr : post.excerpt) ||
    post.excerpt ||
    title;

  const readingMin = estimateReadingMinutes(excerpt);

  // Auteur: priorise author.username si l'API renvoie un objet, sinon string/fallback
  const authorLabel =
    (post.author &&
      typeof post.author === "object" &&
      (post.author.username || post.author.email)) ||
    (typeof post.author === "string" ? post.author : null) ||
    "—";

  // Date: priorise created_at, sinon date (fallback ancien champ)
  const dateIso = post.created_at || post.date;

  const cardClass =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  const metaColor = theme === "dark" ? "text-white/60" : "text-gray-500";

  // Chips: genres (couleur) sinon tags (sans couleur)
  const chips = (
    Array.isArray(post._genres) && post._genres.length
      ? post._genres.map((g) => ({
          key: g.id ?? g.name,
          label: g.name,
          color: g.color || null,
        }))
      : Array.isArray(post.tags)
      ? post.tags.map((name) => ({
          key: name,
          label: name,
          color: null,
        }))
      : []
  ).slice(0, 6);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, delay: idx * 0.04 }}
      className={`rounded-xl overflow-hidden border shadow ${cardClass} group`}
    >
      {/* Barre d'accent (fine, en haut) — AJOUT */}
      <div
        className={
          theme === "dark"
            ? "h-1 bg-gradient-to-r from-secondary/80 via-secondary/50 to-transparent"
            : "h-1 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent"
        }
      />

      <div className="relative overflow-hidden">
        <img
          src={post.cover}
          alt={title}
          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badge temps de lecture */}
        <div
          className={`absolute left-3 top-3 px-2 py-0.5 rounded-md text-xs shadow ${
            theme === "dark"
              ? "bg-black/60 text-white"
              : "bg-white/80 text-gray-800"
          }`}
        >
          ~{readingMin} {language === "fr" ? "min" : "min"}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
        <p
          className={`text-sm mb-4 line-clamp-3 ${
            theme === "dark" ? "text-white/70" : "text-gray-600"
          }`}
        >
          {excerpt}
        </p>

        <div className="flex items-center justify-between text-xs mb-4">
          <div className="flex gap-2 flex-wrap">
            {chips.map((c) => (
              <span
                key={c.key}
                title={c.label}
                className="px-2 py-1 rounded-full border"
                style={{
                  backgroundColor: "transparent",
                  borderColor:
                    c.color || (theme === "dark" ? "#333333" : "#e5e7eb"),
                  color: c.color || (theme === "dark" ? "#ffffff" : "#111827"),
                }}
              >
                {c.label}
              </span>
            ))}
          </div>

          <div className={metaColor}>
            {authorLabel} • {formatDate(dateIso, language)} • ~{readingMin}{" "}
            {language === "fr" ? "min" : "min"}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button
            type="button"
            onClick={() => onViewSummary?.(post)}
            className={`text-sm px-3 py-2 rounded-md shadow hover:brightness-110 ${
              theme === "dark"
                ? "bg-secondary text-white"
                : "bg-primary text-dark"
            }`}
            aria-label={labels.viewSummary}
            title={labels.viewSummary}
          >
            {labels.viewSummary}
          </Button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={theme === "dark" ? "text-white/40" : "text-gray-400"}
          >
            ★
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}
