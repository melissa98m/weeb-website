import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../Button";
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

export default function SummaryModal({ open, onClose, post, theme, language, t }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusables = Array.from(dialog.querySelectorAll(focusableSelector));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    const autofocus = dialog.querySelector("[data-autofocus]");
    (autofocus || first)?.focus();

    const onKeyDown = (e) => {
      if (e.key !== "Tab" || focusables.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
        return;
      }
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    dialog.addEventListener("keydown", onKeyDown);
    return () => dialog.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open || !post) return null;

  const title = (language === "fr" ? post.title_fr : post.title) || post.title;
  const excerpt = (language === "fr" ? post.excerpt_fr : post.excerpt) || post.excerpt;
  const metaColor = theme === "dark" ? "text-white/70" : "text-gray-600";
  const card = theme === "dark" ? "bg-[#1c1c1c] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200";
  const readingMin = Math.max(1, Math.ceil(String(excerpt).split(/\s+/).length / 200));
  const formattedDate = formatDate(post.date, language);
  const genres = post._genres || [];
  const labels = {
    author: t.author_label,
    date: t.date_label,
    genres: t.genres_label,
    reading: t.reading_time_label,
    minutes: t.minutes_label,
  };
  const titleId = "summary-modal-title";

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
        aria-labelledby={titleId}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.18 }}
        ref={dialogRef}
        className={`fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl rounded-xl border shadow-lg ${card}`}
      >
        {post.cover && (
          <div className="overflow-hidden rounded-t-xl">
            <img
              src={post.cover}
              alt={title}
              className="h-56 w-full object-cover"
              loading="lazy"
              onError={(e) => {
                const fallback = `https://picsum.photos/seed/article-${post.id}/600/400`;
                if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
              }}
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 id={titleId} className="text-xl md:text-2xl font-semibold">{title}</h3>
          </div>

          <div className={`text-xs mb-4 ${metaColor}`}>
            {post.author} • {formattedDate} • ~{readingMin} min
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {genres.map((g) => (
                <span
                  key={g.id}
                  className="px-2 py-1 rounded-full border text-xs"
                  style={safeChipStyle(g.color, theme)}
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
            <li>{labels.author} {post.author}</li>
            <li>{labels.date} {formattedDate}</li>
            <li>{labels.genres} {genres.map((g) => g.name).join(", ") || "-"}</li>
            <li>{labels.reading} ~{readingMin} {labels.minutes}</li>
          </ul>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              data-autofocus
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
