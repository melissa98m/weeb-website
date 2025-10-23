import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function SummaryModal({ open, onClose, post, theme, language, t }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !post) return null;

  const title = (language === "fr" ? post.title_fr : post.title) || post.title;
  const excerpt = (language === "fr" ? post.excerpt_fr : post.excerpt) || post.excerpt;
  const metaColor = theme === "dark" ? "text-white/70" : "text-gray-600";
  const card = theme === "dark" ? "bg-[#1c1c1c] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200";
  const readingMin = Math.max(1, Math.ceil(String(excerpt).split(/\s+/).length / 200));

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        key="dialog"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.18 }}
        className={`fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl rounded-xl border shadow-lg ${card}`}
      >
        {post.cover && (
          <div className="overflow-hidden rounded-t-xl">
            <img src={post.cover} alt={title} className="h-56 w-full object-cover" loading="lazy" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-xl md:text-2xl font-semibold">{title}</h3>
          </div>

          <div className={`text-xs mb-4 ${metaColor}`}>
            {post.author} • {formatDate(post.date, language)} • ~{readingMin} min
          </div>

          {post._genres?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post._genres.map((g) => (
                <span
                  key={g.id}
                  className="px-2 py-1 rounded-full border text-xs"
                  style={{
                    backgroundColor: "transparent",
                    color: g.color,
                    borderColor: g.color,
                  }}
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          <h4 className="font-semibold mb-2">{t.summary_title}</h4>
          <p className={`${metaColor}`}>{excerpt}</p>

          <h4 className="font-semibold mt-5 mb-2">{t.key_points}</h4>
          <ul className={`pl-5 space-y-1 ${metaColor}`}>
            <li>{language === "fr" ? "Auteur :" : "Author:"} {post.author}</li>
            <li>{language === "fr" ? "Date :" : "Date:"} {formatDate(post.date, language)}</li>
            <li>{language === "fr" ? "Genres :" : "Genres:"} {post._genres.map(g => g.name).join(", ") || "-"}</li>
            <li>{language === "fr" ? "Lecture estimée :" : "Estimated reading:"} ~{readingMin} {language === "fr" ? "min" : "min"}</li>
          </ul>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md border text-sm ${
                theme === "dark"
                  ? "bg-[#262626] text-white border-[#333] hover:bg-[#303030]"
                  : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {t.close}
            </Button>
            <Button
              to={`/blog/${post.id}`}
              className={`px-4 py-2 rounded-md shadow text-sm hover:brightness-110 ${
                theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
              }`}
            >
              {t.read_more}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
