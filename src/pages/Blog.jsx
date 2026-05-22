import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import BlogCard from "../components/Blog/BlogCard";
import GenreChips from "../components/Blog/GenreChips";
import Pagination from "../components/ui/Pagination";
import blogEn from "../../locales/en/blog.json";
import blogFr from "../../locales/fr/blog.json";
import { getEnv } from "../lib/env";
import { setCanonical, setOgMeta, setHreflang, setJsonLd, setTwitterMeta, SITE_URL, DEFAULT_OG_IMAGE } from "../lib/seo";
import { safeChipStyle } from "../utils/colors";

const API_BASE = getEnv("VITE_API_URL", "http://localhost:8000/api");
const PAGE_SIZE = 9;
const TAG_REGEX = /<[^>]+>/g;
const WHITESPACE_REGEX = /\s+/g;

function stripHtml(html = "") {
  return String(html).replace(TAG_REGEX, " ").replace(WHITESPACE_REGEX, " ").trim();
}

function makeExcerpt(html = "", maxWords = 40) {
  const words = stripHtml(html).split(/\s+/);
  const cut = words.slice(0, maxWords).join(" ");
  return words.length > maxWords ? `${cut}…` : cut;
}

function estimateReadingMinutes(html = "") {
  return Math.max(1, Math.ceil(stripHtml(html).split(/\s+/).filter(Boolean).length / 200));
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
    readingMin: estimateReadingMinutes(a.article_content || ""),
    likes_count: a.likes_count,
  };
}

function formatDate(iso, lang) {
  try {
    return new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      year: "numeric", month: "short", day: "2-digit",
    });
  } catch { return iso; }
}

// ── Featured card (first article) ───────────────────────────────────────────

function FeaturedCard({ post, language, theme }) {
  const isDark = theme === "dark";
  const prefersReducedMotion = useReducedMotion();
  const title = (language === "fr" ? post.title_fr : post.title) || post.title;
  const chips = (
    Array.isArray(post._genres) && post._genres.length
      ? post._genres
      : []
  ).slice(0, 2);

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border overflow-hidden group ${
        isDark ? "bg-surface border-border" : "bg-white border-gray-200"
      }`}
    >
      <Link
        to={`/blog/${post.id}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      >
        {/* Image with overlay title */}
        <div className="relative overflow-hidden" style={{ paddingBottom: "45%" }}>
          <img
            src={post.cover}
            alt={title}
            width={1200}
            height={540}
            fetchPriority="high"
            loading="eager"
            decoding="sync"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          {/* Gradient overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
            }}
          />
          {/* Title + meta overlaid on bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            {chips.length > 0 && (
              <div className="flex gap-2 mb-3">
                {chips.map((g) => (
                  <span
                    key={g.id ?? g.name}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-full border"
                    style={safeChipStyle(g.color || null, "dark")}
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}
            <h2 className="font-display font-extrabold text-white text-2xl md:text-3xl lg:text-4xl leading-snug tracking-tight line-clamp-2">
              {title}
            </h2>
            <div className="flex items-center gap-3 mt-3 text-white/60 text-sm">
              {typeof post.author === "string" && <span>{post.author}</span>}
              {post.date && (
                <>
                  <span aria-hidden="true">·</span>
                  <time dateTime={post.date}>{formatDate(post.date, language)}</time>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>~{post.readingMin} min</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton({ theme, large = false }) {
  const card = theme === "dark" ? "bg-surface border-border" : "bg-white border-gray-200";
  return (
    <div className={`rounded-2xl border ${card} animate-pulse overflow-hidden`}>
      <div className={`w-full bg-gray-300/20 ${large ? "h-64" : "h-44"}`} />
      <div className="p-5 space-y-2">
        <div className="h-5 w-3/4 bg-gray-300/20 rounded" />
        <div className="h-4 w-2/3 bg-gray-300/20 rounded" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-16 bg-gray-300/20 rounded-full" />
          <div className="h-5 w-12 bg-gray-300/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Blog() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? blogFr : blogEn;
  const isDark = theme === "dark";
  const prefersReducedMotion = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [genres, setGenres] = useState([]);

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [page, setPage] = useState(1);

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

  // Fetch genres
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

  // Fetch articles
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

  useEffect(() => { setPage(1); }, [selectedGenreId]);

  const allGenres = useMemo(
    () => [{ id: null, name: t.all_genres, color: null }, ...genres],
    [genres, t.all_genres]
  );

  const filtered = useMemo(() => {
    if (selectedGenreId === null) return posts;
    return posts.filter((p) => p._genreIds?.includes(selectedGenreId));
  }, [posts, selectedGenreId]);

  const pageCount = Math.ceil(totalCount / PAGE_SIZE);

  // Split: first = featured, rest = grid
  const [featuredPost, ...gridPosts] = filtered;

  const emptyCard = isDark
    ? "bg-surface border-border text-white"
    : "bg-white border-gray-200 text-gray-900";

  const inputClass = isDark
    ? "bg-surface-3/60 border-border-2 text-white placeholder-white/40 focus:border-primary"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary";

  return (
    <main className="max-w-6xl mx-auto px-6 pt-28 pb-20">

      {/* Page header */}
      <motion.header
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1
          className={`font-display font-extrabold tracking-tight leading-tight ${isDark ? "text-white" : "text-dark"}`}
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
        >
          {t.title}
        </h1>
        <p className={`mt-3 text-base md:text-lg max-w-xl ${isDark ? "text-white/50" : "text-dark/50"}`}>
          {t.subtitle}
        </p>
      </motion.header>

      {/* Loading state */}
      {loading && (
        <div className="space-y-6">
          <CardSkeleton theme={theme} large />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} theme={theme} />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {/* Featured article */}
          {featuredPost && !debouncedQ && selectedGenreId === null && page === 1 && (
            <div className="mb-8">
              <FeaturedCard post={featuredPost} language={language} theme={theme} />
            </div>
          )}

          {/* Genre chips + search — inline in the flow */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-8">
            <GenreChips
              genres={allGenres}
              selectedId={selectedGenreId}
              onChange={setSelectedGenreId}
              theme={theme}
            />
            <div className="relative sm:flex-shrink-0 sm:w-64">
              <input
                value={q}
                onChange={handleSearchChange}
                placeholder={t.search_placeholder}
                aria-label={t.search_placeholder}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${inputClass}`}
              />
            </div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className={`rounded-2xl border p-10 text-center ${emptyCard}`}>
              <p className="opacity-70 mb-5 text-sm">{t.empty}</p>
              <div className="flex justify-center gap-3 flex-wrap">
                {debouncedQ && (
                  <button
                    type="button"
                    onClick={() => { setQ(""); setDebouncedQ(""); setPage(1); }}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      isDark
                        ? "border-border text-white/60 hover:bg-surface-2"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {language === "fr" ? "Effacer la recherche" : "Clear search"}
                  </button>
                )}
                {selectedGenreId !== null && (
                  <button
                    type="button"
                    onClick={() => setSelectedGenreId(null)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      isDark
                        ? "border-border text-white/60 hover:bg-surface-2"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {language === "fr" ? "Voir tous les articles" : "View all articles"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Editorial grid */}
          {filtered.length > 0 && (
            <>
              {/* If we have a featured card (first post removed from grid), use gridPosts; otherwise full filtered */}
              {(() => {
                const displayPosts =
                  featuredPost && !debouncedQ && selectedGenreId === null && page === 1
                    ? gridPosts
                    : filtered;

                if (displayPosts.length === 0) return null;

                // Row 1: 2 large cards (col-span half each)
                const row1 = displayPosts.slice(0, 2);
                // Rest: standard 3-col grid
                const rest = displayPosts.slice(2);

                return (
                  <motion.div layout className="space-y-5">
                    <AnimatePresence>
                      {/* First row: 2 wide cards */}
                      {row1.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {row1.map((post, idx) => (
                            <BlogCard
                              key={post.id}
                              post={post}
                              language={language}
                              theme={theme}
                              idx={idx}
                              isLcp={false}
                            />
                          ))}
                        </div>
                      )}

                      {/* Rest: 3-col grid */}
                      {rest.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {rest.map((post, idx) => (
                            <BlogCard
                              key={post.id}
                              post={post}
                              language={language}
                              theme={theme}
                              idx={idx + 2}
                              isLcp={false}
                            />
                          ))}
                        </div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })()}

              {/* Pagination */}
              {pageCount > 1 && (
                <div className="mt-12 flex justify-center">
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
        </>
      )}
    </main>
  );
}
