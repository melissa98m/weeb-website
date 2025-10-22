import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import Button from "../components/Button";
import BlogCard from "../components/Blog/BlogCard";
import blogEn from "../../locales/en/blog.json";
import blogFr from "../../locales/fr/blog.json";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

/* ---------- helpers ---------- */
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
function makeExcerpt(text = "", maxWords = 40) {
  const words = String(text).trim().split(/\s+/);
  const cut = words.slice(0, maxWords).join(" ");
  return words.length > maxWords ? `${cut}…` : cut;
}
function textColorFor(bgHex) {
  if (!bgHex || !/^#[0-9A-Fa-f]{6}$/.test(bgHex)) return "#111827";
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? "#111827" : "#ffffff";
}

/* ---------- skeleton ---------- */
function CardSkeleton({ theme }) {
  const card = theme === "dark" ? "bg-[#1c1c1c] border-[#333]" : "bg-white border-gray-200";
  return (
    <div className={`rounded-xl border shadow p-4 ${card} animate-pulse`}>
      <div className="h-40 w-full rounded-lg mb-4 bg-gray-300/30" />
      <div className="h-4 w-3/4 rounded bg-gray-300/30 mb-2" />
      <div className="h-3 w-2/3 rounded bg-gray-300/30 mb-4" />
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-gray-300/30" />
        <div className="h-6 w-12 rounded-full bg-gray-300/30" />
      </div>
    </div>
  );
}

/* ---------- modal ---------- */
function SummaryModal({ open, onClose, post, theme, language, t }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !post) return null;

  const title = (language === "fr" ? post.title_fr : post.title) || post.title;
  const excerpt = (language === "fr" ? post.excerpt_fr : post.excerpt) || post.excerpt;

  const card = theme === "dark" ? "bg-[#1c1c1c] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200";
  const metaColor = theme === "dark" ? "text-white/70" : "text-gray-600";
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

          {/* Plusieurs genres colorés */}
          {post._genres?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post._genres.map((g) => (
                <span
                  key={g.id}
                  className="px-2 py-1 rounded-full border text-xs"
                  style={{
                    backgroundColor: g.color,
                    color: textColorFor(g.color),
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
          <ul className={` pl-5 space-y-1 ${metaColor}`}>
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

/* ---------- page ---------- */
export default function Blog() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? blogFr : blogEn;

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [q, setQ] = useState("");
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [visible, setVisible] = useState(6);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Charge les articles depuis l'API, et normalise pour BlogCard/Modal
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`${API_BASE}/articles/`, {
          credentials: "omit",
          signal: ac.signal,
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const items = Array.isArray(data) ? data : data.results || [];

        const normalized = items.map((a) => {
          const genres = Array.isArray(a.genres) ? a.genres : [];
          const title = a.title || "";
          const excerpt = makeExcerpt(a.article_content || "");
          const cover =
            a.link_image ||
            `https://picsum.photos/seed/article-${a.id}/600/400`;
          const author = a.user ? a.author.username : (language === "fr" ? "Auteur" : "Author");
          const date = a.created_at || a.updated_at || new Date().toISOString();
          return {
            id: a.id,
            title,
            title_fr: title,         
            excerpt,
            excerpt_fr: excerpt,   
            cover,
            author,
            date,
            tags: genres.map((g) => g.name), 
            _genres: genres,                  
            _genreIds: genres.map((g) => g.id),
          };
        });

        setPosts(normalized);
      } catch (e) {
        console.error("Failed to load articles:", e);
        setPosts([]); // fallback
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [language]);

  const openSummary = useCallback((post) => {
    setSelected(post);
    setOpen(true);
  }, []);
  const closeSummary = useCallback(() => {
    setOpen(false);
    setSelected(null);
  }, []);

  // Genres dérivés depuis les posts (évite un fetch séparé)
  const allGenres = useMemo(() => {
    const m = new Map();
    posts.forEach((p) => p._genres?.forEach((g) => m.set(g.id, g)));
    return [{ id: null, name: t.all_genres, color: null }, ...Array.from(m.values())];
  }, [posts, t.all_genres]);

  // Filtrage: texte + genre
  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return posts.filter((p) => {
      const title = p.title;
      const excerpt = p.excerpt;
      const text = `${title} ${excerpt} ${p.author}`.toLowerCase();

      const genreOk =
        selectedGenreId === null || p._genreIds?.includes(selectedGenreId);

      return genreOk && (!lower || text.includes(lower));
    });
  }, [posts, q, selectedGenreId]);

  const card = theme === "dark" ? "bg-[#1c1c1c] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200";
  const input = theme === "dark" ? "bg-[#1c1c1c] border-[#333] text-white placeholder-white/50" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

  return (
    <main className="px-6 py-16 max-w-6xl mx-auto">
      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t.title}</h1>
        <p className={`text-sm md:text-base ${theme === "dark" ? "text-white/70" : "text-gray-600"}`}>
          {t.subtitle}
        </p>
      </motion.header>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-8">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search_placeholder}
            className={`w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60">⌘K</span>
        </div>

        {/* Genre chips (couleurs DB) */}
        <div className="flex flex-wrap gap-2">
          {allGenres.map((g) => {
            const active = selectedGenreId === g.id;
            const style = active && g.color
              ? { backgroundColor: g.color, color: textColorFor(g.color), borderColor: g.color }
              : {
                  backgroundColor: "transparent",
                  color: g.color || (theme === "dark" ? "#ffffff" : "#111827"),
                  borderColor: g.color || (theme === "dark" ? "#333333" : "#e5e7eb"),
                };
            return (
              <button
                key={g.id ?? "all"}
                onClick={() => setSelectedGenreId(active ? null : g.id)}
                className="px-3 py-1.5 text-sm rounded-full border transition hover:scale-105"
                style={style}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} theme={theme} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={`rounded-xl border p-8 text-center ${card}`}>
          <p className="opacity-80">{t.empty}</p>
        </div>
      ) : (
        <>
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.slice(0, visible).map((post, idx) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  language={language}
                  theme={theme}
                  idx={idx}
                  onViewSummary={openSummary}
                  labels={{ viewSummary: t.view_summary }}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {visible < filtered.length && (
            <div className="flex justify-center mt-10">
              <Button
                type="button"
                onClick={() => setVisible((v) => v + 6)}
                className={`px-5 py-2 rounded-md shadow hover:brightness-110 ${
                  theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
                }`}
              >
                {language === "fr" ? "Charger plus" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <SummaryModal
        open={open}
        onClose={closeSummary}
        post={selected}
        theme={theme}
        language={language}
        t={t}
      />
    </main>
  );
}
