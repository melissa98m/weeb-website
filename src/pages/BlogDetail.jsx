import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getCookie } from "../lib/cookies";
import { highlightContainer } from "../lib/hljs";
import Button from "../components/Button";
import blogEn from "../../locales/en/blog.json";
import blogFr from "../../locales/fr/blog.json";
import RelatedCarousel from "../components/Blog/RelatedCarousel";
import { safeChipStyle } from "../utils/colors";
import { getEnv } from "../lib/env";
import { setCanonical, setOgMeta, setJsonLd, setHreflang, setTwitterMeta, SITE_URL, DEFAULT_OG_IMAGE } from "../lib/seo";

const API_BASE = getEnv("VITE_API_URL", "http://localhost:8000/api");

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatDate(iso, lang) {
  try {
    return new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  } catch { return iso; }
}

function estimateReadingMinutes(text = "") {
  return Math.max(1, Math.ceil(String(text).trim().split(/\s+/).filter(Boolean).length / 200));
}

const API_HOST = (API_BASE || "").replace(/\/api\/?$/, "");
function resolveImageUrl(src) {
  if (!src) return null;
  return /^https?:\/\//i.test(src) ? src : `${API_HOST}${src}`;
}

function getInitials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconHeart({ filled = false, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconShare({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function IconChevronLeft({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconChevronRight({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ theme }) {
  const isDark = theme === "dark";
  return (
    <div className="animate-pulse">
      {/* Hero */}
      <div className={`w-full ${isDark ? "bg-surface" : "bg-gray-200"}`} style={{ height: "55vh" }} />
      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pt-10 space-y-4">
        <div className={`h-3 w-32 rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
        <div className={`h-10 w-3/4 rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
        <div className={`h-10 w-1/2 rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
        <div className={`h-4 w-48 rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
        <div className={`h-px w-full ${isDark ? "bg-border" : "bg-gray-200"}`} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-4 rounded ${isDark ? "bg-white/8" : "bg-gray-100"}`} style={{ width: `${75 + Math.random() * 25}%` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Comment ──────────────────────────────────────────────────────────────────

function CommentItem({ comment: c, theme, language, user, txt, onReply, onDelete, depth = 0 }) {
  const isDark = theme === "dark";
  const authorName = c.author?.username || c.author?.first_name || "—";
  const initials = getInitials(authorName);
  const dateStr = (() => {
    try { return new Date(c.created_at).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short" }); }
    catch { return ""; }
  })();

  return (
    <div className={depth > 0 ? "ml-10 mt-3" : ""}>
      <div
        className={`rounded-xl p-4 ${
          isDark
            ? depth > 0 ? "bg-surface-raised border border-border/50" : "bg-surface-2"
            : depth > 0 ? "bg-white border border-gray-100" : "bg-gray-50"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div
            aria-hidden="true"
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
              isDark ? "bg-primary/15 text-primary" : "bg-secondary/10 text-secondary"
            }`}
          >
            {initials || "?"}
          </div>
          <div className="flex items-baseline gap-2 min-w-0">
            <span className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-dark"}`}>
              {authorName}
            </span>
            <span className={`text-xs flex-shrink-0 ${isDark ? "text-white/35" : "text-dark/35"}`}>
              {dateStr}
            </span>
          </div>
        </div>

        <p className={`text-sm leading-relaxed ${isDark ? "text-white/80" : "text-dark/80"}`}>
          {c.content}
        </p>

        {/* Actions */}
        <div className={`flex gap-4 mt-2.5 text-xs ${isDark ? "text-white/35" : "text-dark/35"}`}>
          {user && depth === 0 && (
            <button
              type="button"
              onClick={() => onReply({ id: c.id, username: authorName })}
              className="hover:text-primary transition-colors"
            >
              {txt.comment_reply}
            </button>
          )}
          {user && (user.id === c.author?.id || user.is_staff) && (
            <button
              type="button"
              onClick={() => onDelete(c.id)}
              className="hover:text-red-400 transition-colors"
            >
              {txt.comment_delete}
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {c.replies?.length > 0 && (
        <div>
          {c.replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              theme={theme}
              language={language}
              user={user}
              txt={txt}
              onReply={onReply}
              onDelete={onDelete}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function BlogDetail() {
  const { id } = useParams();
  const currId = Number(id);
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const txt = language === "fr" ? blogFr : blogEn;
  const reduceMotion = useReducedMotion();
  const isDark = theme === "dark";

  const [loadingPost, setLoadingPost] = useState(true);
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [prevId, setPrevId] = useState(null);
  const [nextId, setNextId] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const articleBodyRef = useRef(null);

  // Track window-level scroll for reading progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  // Read tracking
  useEffect(() => {
    if (!user || !currId) return;
    const csrfToken = getCookie("csrftoken");
    fetch(`${API_BASE}/articles/${currId}/view/`, {
      method: "POST",
      credentials: "include",
      headers: csrfToken ? { "X-CSRFToken": csrfToken } : {},
    }).catch(() => {});
  }, [currId, user]);

  const fetchComments = useCallback(async () => {
    if (!currId) return;
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const r = await fetch(`${API_BASE}/articles/${currId}/comments/`, { credentials: "omit" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setComments(Array.isArray(data) ? data : data.results ?? []);
    } catch {
      setCommentsError(true);
    } finally {
      setCommentsLoading(false);
    }
  }, [currId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const submitComment = useCallback(async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    setCommentSubmitting(true);
    setCommentError(null);
    const csrfToken = getCookie("csrftoken");
    try {
      const r = await fetch(`${API_BASE}/articles/${currId}/comments/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
        },
        body: JSON.stringify({
          content: text,
          ...(replyTo ? { parent: replyTo.id } : {}),
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const newComment = await r.json();
      setCommentText("");
      setReplyTo(null);
      if (replyTo) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTo.id
              ? { ...c, replies: [...(c.replies ?? []), newComment] }
              : c
          )
        );
      } else {
        setComments((prev) => [...prev, newComment]);
      }
    } catch {
      setCommentError(true);
    } finally {
      setCommentSubmitting(false);
    }
  }, [commentText, currId, replyTo]);

  const deleteComment = useCallback(async (commentId) => {
    const csrfToken = getCookie("csrftoken");
    try {
      await fetch(`${API_BASE}/comments/${commentId}/`, {
        method: "DELETE",
        credentials: "include",
        headers: csrfToken ? { "X-CSRFToken": csrfToken } : {},
      });
      setComments((prev) =>
        prev
          .filter((c) => c.id !== commentId)
          .map((c) => ({ ...c, replies: (c.replies ?? []).filter((r) => r.id !== commentId) }))
      );
    } catch { /* noop */ }
  }, []);

  // Fetch article
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
        setIsLiked(data.is_liked ?? false);
        setLikesCount(data.likes_count ?? 0);
      } catch {
        if (!alive) return;
        setError("Unable to load the article.");
        setPost(null);
      } finally {
        if (alive) setLoadingPost(false);
      }
    })();
    return () => { alive = false; };
  }, [currId]);

  // SEO
  useEffect(() => {
    if (!post) return;
    const prev = document.title;
    document.title = `${post.title} | Weeb`;

    const excerpt = String(post.content || post.excerpt || post.article_content || "")
      .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 155);

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && excerpt) metaDesc.setAttribute("content", excerpt);

    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute("content", "index, follow");

    const articlePath = `/blog/${post.id}`;
    const articleUrl = `${SITE_URL}${articlePath}`;
    const imgUrl = resolveImageUrl(post.cover_image_url || post.link_image || post.cover || post.image);
    const ogImg = imgUrl || DEFAULT_OG_IMAGE;

    const cleanCanonical = setCanonical(articlePath);
    const cleanHreflang = setHreflang(articlePath);
    const cleanOgUrl = setOgMeta("og:url", articleUrl);
    const cleanOgTitle = setOgMeta("og:title", document.title);
    const cleanOgDesc = excerpt ? setOgMeta("og:description", excerpt) : () => {};
    const cleanOgImg = setOgMeta("og:image", ogImg);
    const cleanOgType = setOgMeta("og:type", "article");
    const cleanTwTitle = setTwitterMeta("twitter:title", document.title);
    const cleanTwDesc = excerpt ? setTwitterMeta("twitter:description", excerpt) : () => {};
    const cleanTwImg = setTwitterMeta("twitter:image", ogImg);

    const authorName =
      (post.author && typeof post.author === "object"
        ? post.author.username || post.author.email
        : typeof post.author === "string" ? post.author : null) || "Weeb";

    const cleanArticle = setJsonLd("jsonld-article", {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: excerpt,
      datePublished: post.created_at || post.date || undefined,
      dateModified: post.updated_at || post.created_at || undefined,
      author: { "@type": "Person", name: authorName },
      publisher: { "@type": "Organization", name: "Weeb", url: SITE_URL },
      url: articleUrl,
      ...(imgUrl ? { image: imgUrl } : {}),
    });

    const cleanBreadcrumb = setJsonLd("jsonld-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
      ],
    });

    return () => {
      document.title = prev;
      cleanCanonical(); cleanHreflang(); cleanOgUrl(); cleanOgTitle();
      cleanOgDesc(); cleanOgImg(); cleanOgType();
      cleanTwTitle(); cleanTwDesc(); cleanTwImg();
      cleanArticle(); cleanBreadcrumb();
    };
  }, [post]);

  // Prev/Next
  useEffect(() => {
    if (!currId) return;
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/articles/${currId}/neighbors/`, { credentials: "omit" });
        if (!r.ok) return;
        const data = await r.json();
        if (!alive) return;
        setPrevId(data.prev_id ?? null);
        setNextId(data.next_id ?? null);
      } catch { /* noop */ }
    })();
    return () => { alive = false; };
  }, [currId]);

  // Cover preload
  const coverUrl = useMemo(() => {
    return (
      resolveImageUrl(post?.link_image || post?.cover || post?.image || post?.image_url) ||
      `https://picsum.photos/seed/article-${post?.id ?? currId}/1400/700`
    );
  }, [post, currId]);

  useEffect(() => {
    if (!coverUrl) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = coverUrl;
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, [coverUrl]);

  // Syntax highlight
  useEffect(() => { highlightContainer(articleBodyRef.current); }, [post?.article_content]);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const title = useMemo(() => post?.title ?? "", [post]);
  const readingMin = useMemo(() => estimateReadingMinutes(post?.article_content ?? ""), [post]);

  const authorLabel = useMemo(() => {
    return (
      (post?.author && typeof post.author === "object" && (post.author.username || post.author.email)) ||
      (typeof post?.author === "string" ? post.author : null) ||
      "—"
    );
  }, [post]);

  const dateIso = post?.created_at || post?.updated_at || post?.date;
  const chips = Array.isArray(post?.genres) ? post.genres : [];

  // ── Like handler ──────────────────────────────────────────────────────────────

  const handleLike = useCallback(async () => {
    const method = isLiked ? "DELETE" : "POST";
    const csrfToken = getCookie("csrftoken");
    try {
      const r = await fetch(`${API_BASE}/articles/${currId}/like/`, {
        method,
        credentials: "include",
        headers: csrfToken ? { "X-CSRFToken": csrfToken } : {},
      });
      if (r.ok) {
        const data = await r.json();
        setIsLiked(data.is_liked);
        setLikesCount(data.likes_count);
      }
    } catch { /* noop */ }
  }, [isLiked, currId]);

  // ── Share handler ─────────────────────────────────────────────────────────────

  const handleShare = useCallback(async () => {
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title, url: window.location.href }); }
      catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch { /* noop */ }
    }
  }, [title]);

  // ── Shared button styles ──────────────────────────────────────────────────────

  const actionBtn = [
    "inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[36px]",
    isDark
      ? "border-border bg-surface-2 text-white/65 hover:text-white hover:border-border-2"
      : "border-gray-200 bg-white text-dark/60 hover:text-dark hover:border-gray-300",
  ].join(" ");

  const likedBtn = [
    "inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[36px]",
    "border-rose-500/40 bg-rose-500/10 text-rose-500",
  ].join(" ");

  // ── Loading / error ───────────────────────────────────────────────────────────

  if (loadingPost) {
    return (
      <main>
        {!reduceMotion && (
          <motion.div
            className="fixed left-0 right-0 h-[2px] origin-left z-50"
            style={{ top: "64px", scaleX, background: "linear-gradient(90deg, #9333ea, #c084fc)" }}
          />
        )}
        <Skeleton theme={theme} />
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="pt-28 px-6 pb-20">
        <div className={`max-w-lg mx-auto rounded-2xl border p-10 text-center ${
          isDark ? "bg-surface border-border text-white" : "bg-white border-gray-200"
        }`}>
          <h1 className={`font-display font-bold text-xl mb-2 ${isDark ? "text-white" : "text-dark"}`}>
            {txt.not_found_title}
          </h1>
          <p className={`text-sm mb-6 ${isDark ? "text-white/55" : "text-dark/55"}`}>
            {txt.not_found_desc}
          </p>
          <Button variant="primary" size="md" to="/blog">
            ← {txt.back}
          </Button>
        </div>
      </main>
    );
  }

  // ── Article content helpers ───────────────────────────────────────────────────

  const raw = post?.article_content ?? "";
  const isHtml = /^\s*</.test(raw);

  return (
    <main>
      {/* Reading progress bar — sits just below the fixed header */}
      {!reduceMotion && (
        <motion.div
          className="fixed left-0 right-0 h-[2px] origin-left z-50"
          style={{ top: "64px", scaleX, background: "linear-gradient(90deg, #9333ea, #c084fc)" }}
        />
      )}

      {/* ── Hero cover ────────────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "clamp(280px, 55vh, 600px)" }}
        aria-hidden="true"
      >
        <img
          src={coverUrl}
          alt=""
          width={1400}
          height={700}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          onError={(e) => {
            const fallback = `https://picsum.photos/seed/article-${post?.id ?? currId}/1400/700`;
            if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
          }}
        />
        {/* Gradient overlay — top (for the eventual header blur) + bottom (for content) */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(to bottom, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0) 30%, rgba(15,23,42,0.7) 80%, #0f172a 100%)"
              : "linear-gradient(to bottom, rgba(242,242,242,0) 40%, rgba(242,242,242,0.9) 90%, #f2f2f2 100%)",
          }}
        />
      </div>

      {/* ── Article content ────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 pb-0">

        {/* Breadcrumb */}
        <nav
          aria-label="Fil d'Ariane"
          className={`flex items-center gap-1.5 text-xs mb-6 ${isDark ? "text-white/35" : "text-dark/35"}`}
        >
          <Link to="/" className="hover:text-primary transition-colors">
            {language === "fr" ? "Accueil" : "Home"}
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <span aria-hidden="true">/</span>
          <span className={`truncate max-w-[200px] ${isDark ? "text-white/55" : "text-dark/55"}`}>
            {title}
          </span>
        </nav>

        {/* Genre chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {chips.map((g) => (
              <span
                key={g.id}
                className="text-[11px] font-mono px-2.5 py-1 rounded-full border"
                style={safeChipStyle(g.color, theme)}
              >
                {g.name}
              </span>
            ))}
          </div>
        )}

        {/* h1 */}
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`font-display font-extrabold tracking-tight leading-tight ${isDark ? "text-white" : "text-dark"}`}
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 3rem)" }}
        >
          {title}
        </motion.h1>

        {/* Meta row */}
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 ${
          isDark ? "text-white/45" : "text-dark/45"
        }`}>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span>{authorLabel}</span>
            <span aria-hidden="true">·</span>
            {dateIso && <time dateTime={dateIso}>{formatDate(dateIso, language)}</time>}
            <span aria-hidden="true">·</span>
            <span>~{readingMin} {txt.min}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={handleLike}
                aria-label={isLiked ? txt.unlike : txt.like}
                aria-pressed={isLiked}
                className={isLiked ? likedBtn : actionBtn}
              >
                <IconHeart filled={isLiked} size={14} />
                <span>{likesCount}</span>
              </button>
            ) : likesCount > 0 ? (
              <span className={`flex items-center gap-1.5 text-sm ${isDark ? "text-white/35" : "text-dark/35"}`}>
                <IconHeart size={13} /> {likesCount}
              </span>
            ) : null}

            <button
              type="button"
              onClick={handleShare}
              aria-label={typeof navigator.share === "function" ? txt.share : txt.copy_link}
              className={actionBtn}
            >
              <IconShare size={14} />
              <span>{typeof navigator.share === "function" ? txt.share : copied ? txt.copied : txt.copy_link}</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className={`mt-8 mb-8 border-t ${isDark ? "border-border" : "border-gray-200"}`} />

        {/* ── Article body ────────────────────────────────────────────────────── */}
        <article>
          <div
            ref={articleBodyRef}
            className={`article-body max-w-none leading-[1.85] ${
              isDark ? "text-white/80" : "text-dark/80"
            }`}
            style={{ fontSize: "1.0625rem" }}
          >
            {isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: raw }} />
            ) : (
              <AnimatePresence>
                {raw
                  .split(/\n{2,}|\r?\n\r?\n/)
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((p, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                      className={i === 0 ? "mt-0" : "mt-5"}
                    >
                      {p}
                    </motion.p>
                  ))}
              </AnimatePresence>
            )}
          </div>
        </article>

        {/* Divider */}
        <div className={`mt-10 mb-8 border-t ${isDark ? "border-border" : "border-gray-200"}`} />

        {/* Footer actions row */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-12">
          <div className="flex items-center gap-3">
            {user && (
              <button
                type="button"
                onClick={handleLike}
                aria-label={isLiked ? txt.unlike : txt.like}
                aria-pressed={isLiked}
                className={isLiked ? likedBtn : actionBtn}
              >
                <IconHeart filled={isLiked} size={14} />
                <span>{likesCount} {txt.likes}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              aria-label={typeof navigator.share === "function" ? txt.share : txt.copy_link}
              className={actionBtn}
            >
              <IconShare size={14} />
              <span>{typeof navigator.share === "function" ? txt.share : copied ? txt.copied : txt.copy_link}</span>
            </button>
          </div>

          <Link
            to="/blog"
            className={`text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded ${
              isDark ? "text-white/40 hover:text-white" : "text-dark/40 hover:text-dark"
            }`}
          >
            ← {txt.back}
          </Link>
        </div>

        {/* ── Prev / Next navigation ──────────────────────────────────────────── */}
        {(prevId || nextId) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
            {prevId ? (
              <Link
                to={`/blog/${prevId}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "auto" })}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isDark
                    ? "border-border bg-surface hover:border-border-2"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isDark ? "bg-white/5 text-white/50 group-hover:bg-white/10" : "bg-dark/5 text-dark/50 group-hover:bg-dark/10"
                }`}>
                  <IconChevronLeft />
                </span>
                <span className="min-w-0">
                  <span className={`block text-[11px] uppercase tracking-wider mb-0.5 ${isDark ? "text-white/35" : "text-dark/35"}`}>
                    {txt.prev ?? (language === "fr" ? "Précédent" : "Previous")}
                  </span>
                  <span className={`block text-sm font-medium truncate ${isDark ? "text-white/80" : "text-dark/80"}`}>
                    {language === "fr" ? "Article précédent" : "Previous article"}
                  </span>
                </span>
              </Link>
            ) : <div />}

            {nextId ? (
              <Link
                to={`/blog/${nextId}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "auto" })}
                className={`flex items-center justify-end gap-3 p-4 rounded-xl border transition-colors group text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isDark
                    ? "border-border bg-surface hover:border-border-2"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="min-w-0">
                  <span className={`block text-[11px] uppercase tracking-wider mb-0.5 ${isDark ? "text-white/35" : "text-dark/35"}`}>
                    {txt.next ?? (language === "fr" ? "Suivant" : "Next")}
                  </span>
                  <span className={`block text-sm font-medium truncate ${isDark ? "text-white/80" : "text-dark/80"}`}>
                    {language === "fr" ? "Article suivant" : "Next article"}
                  </span>
                </span>
                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isDark ? "bg-white/5 text-white/50 group-hover:bg-white/10" : "bg-dark/5 text-dark/50 group-hover:bg-dark/10"
                }`}>
                  <IconChevronRight />
                </span>
              </Link>
            ) : <div />}
          </div>
        )}
      </div>

      {/* ── Comments ─────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 mb-16">
        <section aria-labelledby="comments-heading">
          <h2
            id="comments-heading"
            className={`font-display font-bold text-xl mb-6 ${isDark ? "text-white" : "text-dark"}`}
          >
            {txt.comments_title}
            {comments.length > 0 && (
              <span className={`ml-2 text-base font-normal ${isDark ? "text-white/35" : "text-dark/35"}`}>
                ({comments.length})
              </span>
            )}
          </h2>

          {/* Comment form */}
          {user ? (
            <form onSubmit={submitComment} className="mb-8">
              {replyTo && (
                <div className={`text-xs mb-2 flex items-center gap-2 ${isDark ? "text-white/45" : "text-dark/45"}`}>
                  <span>↩ {txt.comment_reply} @{replyTo.username}</span>
                  <button type="button" onClick={() => setReplyTo(null)} className="underline hover:text-primary transition-colors">
                    {txt.comment_cancel}
                  </button>
                </div>
              )}
              <label htmlFor="comment-textarea" className="sr-only">
                {replyTo ? txt.comment_reply_placeholder : txt.comment_placeholder}
              </label>
              <textarea
                id="comment-textarea"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyTo ? txt.comment_reply_placeholder : txt.comment_placeholder}
                rows={3}
                maxLength={2000}
                className={`w-full rounded-xl border px-4 py-3 text-sm resize-none transition-colors outline-none focus:ring-2 focus:ring-primary/30 ${
                  isDark
                    ? "bg-surface-2 border-border text-white placeholder-white/35 focus:border-border-2"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300"
                }`}
              />
              {commentError && (
                <p role="alert" className="text-red-400 text-xs mt-1.5">{txt.comment_submit_error}</p>
              )}
              <div className="flex justify-end mt-2.5">
                <button
                  type="submit"
                  disabled={commentSubmitting || !commentText.trim()}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDark ? "bg-secondary text-white hover:bg-primary" : "bg-secondary text-white hover:bg-primary"
                  }`}
                >
                  {commentSubmitting ? "…" : txt.comment_submit}
                </button>
              </div>
            </form>
          ) : (
            <p className={`text-sm mb-6 ${isDark ? "text-white/45" : "text-dark/45"}`}>
              {txt.comment_login_required}
            </p>
          )}

          {/* Comment list */}
          {commentsLoading && (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className={`h-20 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
              ))}
            </div>
          )}
          {commentsError && !commentsLoading && (
            <p className="text-red-400 text-sm">{txt.comment_error}</p>
          )}
          {!commentsLoading && !commentsError && comments.length === 0 && (
            <p className={`text-sm ${isDark ? "text-white/40" : "text-dark/40"}`}>{txt.comment_empty}</p>
          )}
          {!commentsLoading && !commentsError && comments.length > 0 && (
            <ul className="space-y-4" aria-label={txt.comments_title}>
              {comments.map((c) => (
                <li key={c.id}>
                  <CommentItem
                    comment={c}
                    theme={theme}
                    language={language}
                    user={user}
                    txt={txt}
                    onReply={setReplyTo}
                    onDelete={deleteComment}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── Related carousel ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
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
