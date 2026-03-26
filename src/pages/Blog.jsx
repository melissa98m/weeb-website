import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
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
import { getEnv } from "../lib/env";
import { setCanonical, setOgMeta, setHreflang, setJsonLd, setTwitterMeta, SITE_URL, DEFAULT_OG_IMAGE } from "../lib/seo";

const API_BASE = getEnv("VITE_API_URL", "http://localhost:8000/api");
const PAGE_SIZE = 9;

function makeExcerpt(html = "", maxWords = 40) {
  const text = String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(/\s+/);
  const cut = words.slice(0, maxWords).join(" ");
  return words.length > maxWords ? `${cut}…` : cut;
}

function normalizeArticle(a, language) {
  const genres = Array.isArray(a.genres) ? a.genres : [];
  return {
    id: a.id,
    title: a.title || "",
    excerpt: makeExcerpt(a.article_content || ""),
    cover: a.link_image || `https://picsum.photos/seed/article-${a.id}/600/400`,
    author: a.author?.username || a.author || (language === "fr" ? "Auteur" : "Author"),
    date: a.created_at || a.updated_at || new Date().toISOString(),
    tags: genres.map((g) => g.name),
    _genres: genres,
    _genreIds: genres.map((g) => g.id),
  };
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
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [genres, setGenres] = useState([]);

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [page, setPage] = useState(1);

  // Modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Debounce search input
  const debounceRef = useRef(null);
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setQ(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQ(val);
      setPage(1);
    }, 300);
  }, []);

  // SEO
  useEffect(() => {
    const prev = document.title;
    const isFr = language === "fr";
    const title = isFr ? "Blog | Weeb — Actualités et tutoriels web" : "Blog | Weeb — Web News & Tutorials";
    const desc = isFr
      ? "Retrouvez nos articles sur le développement web, les tendances tech et nos tutoriels pratiques."
      : "Find our articles on web development, tech trends and practical tutorials.";

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute("content", "index, follow");

    const cleanCanonical = setCanonical("/blog");
    const cleanHreflang = setHreflang("/blog");
    const cleanOgUrl = setOgMeta("og:url", `${SITE_URL}/blog`);
    const cleanOgTitle = setOgMeta("og:title", title);
    const cleanOgDesc = setOgMeta("og:description", desc);
    const cleanOgImg = setOgMeta("og:image", DEFAULT_OG_IMAGE);
    const cleanTwTitle = setTwitterMeta("twitter:title", title);
    const cleanTwDesc = setTwitterMeta("twitter:description", desc);
    const cleanTwImg = setTwitterMeta("twitter:image", DEFAULT_OG_IMAGE);
    const cleanJsonLd = setJsonLd("jsonld-blog", {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description: desc,
      url: `${SITE_URL}/blog`,
      publisher: { "@type": "Organization", name: "Weeb", url: SITE_URL },
    });

    return () => {
      document.title = prev;
      cleanCanonical();
      cleanHreflang();
      cleanOgUrl();
      cleanOgTitle();
      cleanOgDesc();
      cleanOgImg();
      cleanTwTitle();
      cleanTwDesc();
      cleanTwImg();
      cleanJsonLd();
    };
  }, [language]);

  // Fetch genres once from dedicated endpoint (cached 1h server-side)
  useEffect(() => {
    const ac = new AbortController();
    fetch(`${API_BASE}/genres/?ordering=name`, { credentials: "omit", signal: ac.signal })
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setGenres(list);
      })
      .catch((e) => { if (e?.name !== "AbortError") console.error("Failed to load genres:", e); });
    return () => ac.abort();
  }, []);

  // Fetch current page — server-side search + pagination
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page_size: PAGE_SIZE,
          page,
          ordering: "-created_at",
        });
        if (debouncedQ.trim()) params.set("search", debouncedQ.trim());

        const r = await fetch(`${API_BASE}/articles/?${params}`, {
          credentials: "omit",
          signal: ac.signal,
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();

        const items = Array.isArray(data) ? data : (data.results ?? []);
        setPosts(items.map((a) => normalizeArticle(a, language)));
        setTotalCount(typeof data.count === "number" ? data.count : items.length);
      } catch (e) {
        if (e?.name === "AbortError" || ac.signal.aborted) return;
        console.error("Failed to load articles:", e);
        setPosts([]);
        setTotalCount(0);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [page, debouncedQ, language]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [selectedGenreId]);

  const openSummary = useCallback((post) => {
    setSelected(post);
    setOpen(true);
  }, []);
  const closeSummary = useCallback(() => {
    setOpen(false);
    setSelected(null);
  }, []);

  // Genre chips — all available genres + "All" option
  const allGenres = useMemo(
    () => [{ id: null, name: t.all_genres, color: null }, ...genres],
    [genres, t.all_genres]
  );

  // Client-side genre filter on visible page (API has no genre filter param)
  const filtered = useMemo(() => {
    if (selectedGenreId === null) return posts;
    return posts.filter((p) => p._genreIds?.includes(selectedGenreId));
  }, [posts, selectedGenreId]);

  const pageCount = Math.ceil(totalCount / PAGE_SIZE);

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
        <div className="relative w-full md:max-w-md">
          <input
            value={q}
            onChange={handleSearchChange}
            placeholder={t.search_placeholder}
            className={`w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60">⌘K</span>
        </div>

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
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
              {filtered.map((post, idx) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  language={language}
                  theme={theme}
                  idx={idx}
                  isLcp={idx === 0}
                  onViewSummary={openSummary}
                  labels={{ viewSummary: t.view_summary }}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {pageCount > 1 && (
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
