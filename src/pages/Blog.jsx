import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import Button from "../components/Button";
import BlogCard from "../components/Blog/BlogCard";
import SummaryModal from "../components/Blog/SummaryModal";
import GenreChips from "../components/Blog/GenreChips";
import Pagination from "../components/ui/Pagination";
import blogEn from "../../locales/en/blog.json";
import blogFr from "../../locales/fr/blog.json";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

function makeExcerpt(text = "", maxWords = 40) {
  const words = String(text).trim().split(/\s+/);
  const cut = words.slice(0, maxWords).join(" ");
  return words.length > maxWords ? `${cut}…` : cut;
}
function asList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

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

export default function Blog() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? blogFr : blogEn;

  const [loading, setLoading] = useState(true);
  const [allPosts, setAllPosts] = useState([]);
  const [q, setQ] = useState("");
  const [selectedGenreId, setSelectedGenreId] = useState(null);

  // "Load more" pour petites listes
  const [visible, setVisible] = useState(6);

  // Pagination pour > 10 après filtre
  const PAGE_SIZE = 9;
  const [page, setPage] = useState(1);

  // Modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Fetch toutes les pages (DRF)
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        let url = `${API_BASE}/articles/?page_size=50&page=1`;
        const items = [];
        while (url) {
          const r = await fetch(url, { credentials: "omit", signal: ac.signal });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const data = await r.json();
          const chunk = asList(data);
          items.push(...chunk);
          url = data.next || null;
          if (!data.next && !Array.isArray(data.results)) break;
        }

        const normalized = items.map((a) => {
          const genres = Array.isArray(a.genres) ? a.genres : [];
          const title = a.title || "";
          const excerpt = makeExcerpt(a.article_content || "");
          const cover =
            a.link_image ||
            `https://picsum.photos/seed/article-${a.id}/600/400`;
          const author = a.author?.username || a.author || (language === "fr" ? "Auteur" : "Author");
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

        setAllPosts(normalized);
        setPage(1);
        setVisible(6);
      } catch (e) {
        console.error("Failed to load articles:", e);
        setAllPosts([]);
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

  // Genres dérivés
  const allGenres = useMemo(() => {
    const m = new Map();
    allPosts.forEach((p) => p._genres?.forEach((g) => m.set(g.id, g)));
    return [{ id: null, name: t.all_genres, color: null }, ...Array.from(m.values())];
  }, [allPosts, t.all_genres]);

  // Filtre texte + genre
  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return allPosts.filter((p) => {
      const title = p.title;
      const excerpt = p.excerpt;
      const text = `${title} ${excerpt} ${p.author}`.toLowerCase();
      const genreOk = selectedGenreId === null || p._genreIds?.includes(selectedGenreId);
      return genreOk && (!lower || text.includes(lower));
    });
  }, [allPosts, q, selectedGenreId]);

  // Basculer pagination si > 10
  const usePagination = filtered.length > 10;

  // Reset quand filtres changent
  useEffect(() => {
    setVisible(6);
    setPage(1);
  }, [q, selectedGenreId]);

  // Slice d’affichage
  const pageCount = useMemo(
    () => (usePagination ? Math.ceil(filtered.length / PAGE_SIZE) : 1),
    [filtered.length, usePagination]
  );
  const pageSlice = useMemo(() => {
    if (!usePagination) return filtered.slice(0, visible);
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, visible, usePagination, page]);

  const card =
    theme === "dark" ? "bg-[#1c1c1c] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200";
  const input =
    theme === "dark"
      ? "bg-[#1c1c1c] border-[#333] text-white placeholder-white/50"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

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

        {/* Genres */}
        <GenreChips
          genres={allGenres}
          selectedId={selectedGenreId}
          onChange={setSelectedGenreId}
          theme={theme}
        />
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
              {pageSlice.map((post, idx) => (
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

          {/* Footer liste: Load more OU Pagination */}
          {!usePagination ? (
            visible < filtered.length && (
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
            )
          ) : (
            <div className="mt-10">
              <Pagination
                page={page}
                pageCount={pageCount}
                onPageChange={setPage}
                theme={theme}
              />
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
