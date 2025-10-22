import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import Button from "../components/Button";
import blogEn from "../../locales/en/blog.json";
import blogFr from "../../locales/fr/blog.json";
import RelatedCarousel from "../components/Blog/RelatedCarousel";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const INDEX_PAGE_SIZE = 200;

// ---- Utils
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
  const words = String(text).trim().split(/\s+/).filter(Boolean).length || 0;
  return Math.max(1, Math.ceil(words / 200));
}
function asList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}
const API_HOST = (API_BASE || "").replace(/\/api\/?$/, "");
function resolveImageUrl(src) {
  if (!src) return null;
  return /^https?:\/\//i.test(src) ? src : `${API_HOST}${src}`;
}

function Skeleton({ theme }) {
  const base = theme === "dark" ? "bg-[#1c1c1c] border-[#333]" : "bg-white border-gray-200";
  return (
    <div className={`rounded-xl border shadow overflow-hidden ${base} animate-pulse`}>
      <div className="h-56 w-full bg-gray-300/20" />
      <div className="p-6">
        <div className="h-6 w-2/3 bg-gray-300/20 rounded mb-3" />
        <div className="h-4 w-1/3 bg-gray-300/20 rounded mb-6" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-300/20 rounded" />
          <div className="h-4 w-11/12 bg-gray-300/20 rounded" />
          <div className="h-4 w-10/12 bg-gray-300/20 rounded" />
          <div className="h-4 w-9/12 bg-gray-300/20 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function BlogDetail() {
  const { id } = useParams();
  const currId = Number(id);
  const { theme } = useTheme();
  const { language } = useLanguage();
  const txt = language === "fr" ? blogFr : blogEn;

  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingIndex, setLoadingIndex] = useState(true);
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [coverBroken, setCoverBroken] = useState(false);
  const [ids, setIds] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setCoverBroken(false);
  }, [id]);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });

  // Article courant
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingPost(true);
        setError(null);
        const r = await fetch(`${API_BASE}/articles/${currId}/`, { credentials: "omit" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!alive) return;
        setPost(data);
      } catch (e) {
        if (!alive) return;
        setError("Unable to load the article.");
        setPost(null);
      } finally {
        if (alive) setLoadingPost(false);
      }
    })();
    return () => { alive = false; };
  }, [currId]);

  // Index des IDs (asc)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingIndex(true);
        setError(null);
        let all = [];
        let url = `${API_BASE}/articles/?ordering=id&page_size=${INDEX_PAGE_SIZE}&page=1`;
        while (url) {
          const r = await fetch(url, { credentials: "omit" });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const data = await r.json();
          const list = asList(data);
          all.push(...list.map(a => a.id).filter(v => v != null));
          url = data.next || null;
          if (!data.next && !Array.isArray(data.results)) break;
        }
        if (!alive) return;
        const uniq = Array.from(new Set(all)).sort((a, b) => Number(a) - Number(b));
        setIds(uniq);
      } catch (e) {
        if (!alive) return;
        setError("Unable to load the article index.");
        setIds([]);
      } finally {
        if (alive) setLoadingIndex(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const loading = loadingPost || loadingIndex;

  const title = useMemo(() => post?.title ?? "", [post]);
  const paragraphs = useMemo(() => {
    const raw = post?.article_content ?? "";
    const parts = raw.split(/\n{2,}|\r?\n\r?\n/).map(s => s.trim()).filter(Boolean);
    return parts.length ? parts : raw ? [raw] : [];
  }, [post]);
  const readingMin = useMemo(() => estimateReadingMinutes(post?.article_content ?? ""), [post]);

  // voisins
  const index = useMemo(() => ids.findIndex(v => Number(v) === currId), [ids, currId]);
  const prevId = index > 0 ? ids[index - 1] : null;
  const nextId = index !== -1 && index < ids.length - 1 ? ids[index + 1] : null;

  const card = theme === "dark" ? "bg-[#1c1c1c] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200";
  const meta = theme === "dark" ? "text-white/70" : "text-gray-600";

  if (loading) {
    return (
      <main className="px-6 py-16 max-w-4xl mx-auto">
        <Skeleton theme={theme} />
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="px-6 py-16 max-w-3xl mx-auto">
        <div className={`rounded-xl border p-8 text-center ${card}`}>
          <h1 className="text-2xl font-semibold mb-2">{txt.not_found_title}</h1>
          <p className={meta}>{txt.not_found_desc}</p>
          <div className="mt-6">
            <Button
              to="/blog"
              className={`px-4 py-2 rounded-md shadow hover:brightness-110 ${
                theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
              }`}
            >
              {txt.back}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const authorLabel =
    (post.author && typeof post.author === "object" && (post.author.username || post.author.email)) ||
    (typeof post.author === "string" ? post.author : null) ||
    "—";
  const dateIso = post.created_at || post.updated_at || post.date;
  const chips = Array.isArray(post.genres) ? post.genres : [];

  const placeholderCover = `https://picsum.photos/seed/article-${post?.id ?? currId}/1200/600`;
  const coverUrl =
    resolveImageUrl(post?.link_image || post?.cover || post?.image || post?.image_url) ||
    placeholderCover;

  return (
    <main className="px-0 md:px-6 py-12 md:py-16">
      {/* Barre de progression */}
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 top-0 right-0 h-1 origin-left bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 z-40"
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Retour */}
        <div className="px-6">
          <Button
            to="/blog"
            className={`px-4 py-2 rounded-md border text-sm ${
              theme === "dark"
                ? "bg-[#262626] text-white border-[#333] hover:bg-[#303030]"
                : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
            }`}
          >
            ← {txt.back}
          </Button>
        </div>

        {/* Article */}
        <article className={`rounded-xl border shadow overflow-hidden ${card}`}>
          <div className="overflow-hidden">
            <img
              src={coverUrl}
              alt={title}
              className="h-64 md:h-[22rem] w-full object-cover"
              loading="lazy"
              onError={(e) => {
                if (e.currentTarget.src !== placeholderCover) {
                  e.currentTarget.src = placeholderCover;
                }
              }}
            />
          </div>

          <div className="p-6 md:p-8">
            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-2xl md:text-3xl font-bold mb-2"
            >
              {title}
            </motion.h1>

            {/* Meta + actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
              <div className={`text-sm ${meta}`}>
                {authorLabel} • {formatDate(dateIso, language)} • {txt.read_time} ~{readingMin} {txt.min}
              </div>
              <div className="flex items-center gap-2">
                {/* Genres (desktop) */}
                <div className="hidden md:flex flex-wrap gap-2">
                  {chips.map((g) => (
                    <span
                      key={g.id}
                      className="px-2 py-1 rounded-full border text-xs"
                      style={{
                        backgroundColor: "transparent",
                        borderColor: g.color || (theme === "dark" ? "#333333" : "#e5e7eb"),
                        color: g.color || (theme === "dark" ? "#ffffff" : "#111827"),
                      }}
                    >
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Copier le lien */}
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1200);
                    } catch {}
                  }}
                  className={`px-3 py-1.5 rounded-md shadow text-sm hover:brightness-110 ${
                    theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
                  }`}
                >
                  {copied ? txt.copied : txt.copy_link}
                </Button>
              </div>
            </div>

            {/* Genres (mobile) */}
            {chips.length > 0 && (
              <div className="md:hidden flex flex-wrap gap-2 mb-4">
                {chips.map((g) => (
                  <span
                    key={g.id}
                    className="px-2 py-1 rounded-full border text-xs"
                    style={{
                      backgroundColor: "transparent",
                      borderColor: g.color || (theme === "dark" ? "#333333" : "#e5e7eb"),
                      color: g.color || (theme === "dark" ? "#ffffff" : "#111827"),
                    }}
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Contenu */}
            <div
              ref={containerRef}
              className={`prose max-w-none leading-relaxed ${
                theme === "dark" ? "prose-invert prose-headings:text-white" : ""
              }`}
            >
              <AnimatePresence>
                {(post?.article_content ?? "")
                  .split(/\n{2,}|\r?\n\r?\n/)
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((p, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.05 }}
                      className={`${i === 0 ? "mt-0" : "mt-4"}`}
                    >
                      {p}
                    </motion.p>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        </article>

        {/* Navigation précédente / suivante */}
        <div className="px-6 flex items-center justify-between gap-3">
          {prevId ? (
            <Link
              to={`/blog/${prevId}`}
              className={`px-4 py-2 rounded-md border text-sm ${
                theme === "dark"
                  ? "bg-[#262626] text-white border-[#333] hover:bg-[#303030]"
                  : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
              }`}
              onClick={() => window.scrollTo({ top: 0, behavior: "auto" })}
            >
              ← {txt.prev ?? (language === "fr" ? "Article précédent" : "Previous article")}
            </Link>
          ) : (
            <span />
          )}

          {nextId ? (
            <Link
              to={`/blog/${nextId}`}
              className={`px-4 py-2 rounded-md border text-sm ${
                theme === "dark"
                  ? "bg-[#262626] text-white border-[#333] hover:bg-[#303030]"
                  : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
              }`}
              onClick={() => window.scrollTo({ top: 0, behavior: "auto" })}
            >
              {txt.next ?? (language === "fr" ? "Article suivant" : "Next article")} →
            </Link>
          ) : (
            <span />
          )}
        </div>

        {/* Carrousel “même genre” (composant séparé) */}
        <RelatedCarousel
          currentId={currId}
          currentGenres={chips}
          theme={theme}
          language={language}
        />
      </div>
    </main>
  );
}
