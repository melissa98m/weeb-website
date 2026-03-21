import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getCookie } from "../lib/cookies";
import Button from "../components/Button";
import blogEn from "../../locales/en/blog.json";
import blogFr from "../../locales/fr/blog.json";
import RelatedCarousel from "../components/Blog/RelatedCarousel";
import { safeChipStyle } from "../utils/colors";
import { getEnv } from "../lib/env";
import { setCanonical, setOgMeta, setJsonLd, SITE_URL } from "../lib/seo";

const API_BASE = getEnv("VITE_API_URL", "http://localhost:8000/api");


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
  const { user } = useAuth();
  const txt = language === "fr" ? blogFr : blogEn;
  const reduceMotion = useReducedMotion();

  const [loadingPost, setLoadingPost] = useState(true);
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [_coverBroken, setCoverBroken] = useState(false);
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
  const [replyTo, setReplyTo] = useState(null); // { id, username }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setCoverBroken(false);
  }, [id]);

  // Tracking de lecture (fire-and-forget, uniquement si connecté)
  useEffect(() => {
    if (!user || !currId) return;
    const csrfToken = getCookie("csrftoken");
    fetch(`${API_BASE}/articles/${currId}/view/`, {
      method: "POST",
      credentials: "include",
      headers: csrfToken ? { "X-CSRFToken": csrfToken } : {},
    }).catch(() => {
      // silencieux — ne pas bloquer la lecture en cas d'erreur réseau
    });
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

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

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
        setIsLiked(data.is_liked ?? false);
        setLikesCount(data.likes_count ?? 0);
      } catch (_e) {
        if (!alive) return;
        setError("Unable to load the article.");
        setPost(null);
      } finally {
        if (alive) setLoadingPost(false);
      }
    })();
    return () => { alive = false; };
  }, [currId]);

  // SEO dynamique : titre, description, robots, canonical, og:*, JSON-LD Article + Breadcrumb
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

    const cleanCanonical = setCanonical(articlePath);
    const cleanOgUrl = setOgMeta("og:url", articleUrl);
    const cleanOgTitle = setOgMeta("og:title", document.title);
    const cleanOgDesc = excerpt ? setOgMeta("og:description", excerpt) : () => {};
    const cleanOgImg = imgUrl ? setOgMeta("og:image", imgUrl) : () => {};
    const cleanOgType = setOgMeta("og:type", "article");

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
      cleanCanonical();
      cleanOgUrl();
      cleanOgTitle();
      cleanOgDesc();
      cleanOgImg();
      cleanOgType();
      cleanArticle();
      cleanBreadcrumb();
    };
  }, [post]);

  // Prev/next IDs via endpoint dédié (1 requête au lieu de N pages)
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
      } catch { /* noop — navigation prev/next non critique */ }
    })();
    return () => { alive = false; };
  }, [currId]);

  const loading = loadingPost;

  const title = useMemo(() => post?.title ?? "", [post]);
  const _paragraphs = useMemo(() => {
    const raw = post?.article_content ?? "";
    const parts = raw.split(/\n{2,}|\r?\n\r?\n/).map(s => s.trim()).filter(Boolean);
    return parts.length ? parts : raw ? [raw] : [];
  }, [post]);
  const readingMin = useMemo(() => estimateReadingMinutes(post?.article_content ?? ""), [post]);

  const coverUrl = useMemo(() => {
    return (
      resolveImageUrl(post?.link_image || post?.cover || post?.image || post?.image_url) ||
      `https://picsum.photos/seed/article-${post?.id ?? currId}/1200/600`
    );
  }, [post, currId]);

  // Inject a <link rel="preload"> as soon as the cover URL is known so the
  // browser can start fetching it without waiting for the <img> to render.
  useEffect(() => {
    if (!coverUrl) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = coverUrl;
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, [coverUrl]);

  // voisins
  // prevId et nextId viennent du state (initialisé par le useEffect neighbors)

  const card = theme === "dark" ? "bg-[#1c1c1c] text-white border-[#333]" : "bg-white text-gray-900 border-gray-200";
  const meta = theme === "dark" ? "text-white/70" : "text-gray-600";

  if (loading) {
    return (
      <main className="px-0 md:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6">
          <Skeleton theme={theme} />
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="px-0 md:px-6 py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
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

  return (
    <main className="px-0 md:px-6 py-12 md:py-16">
      {/* Barre de progression — masquée si prefers-reduced-motion */}
      {!reduceMotion && (
        <motion.div
          style={{ scaleX }}
          className="fixed left-0 top-0 right-0 h-1 origin-left bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 z-40"
        />
      )}

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
              width={1200}
              height={528}
              className="h-64 md:h-[22rem] w-full object-cover"
              loading="eager"
              fetchpriority="high"
              onError={(e) => {
                const fallback = `https://picsum.photos/seed/article-${post?.id ?? currId}/1200/600`;
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                }
              }}
            />
          </div>

          <div className="p-6 md:p-8">
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={reduceMotion ? false : { opacity: 1 }}
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
                      style={safeChipStyle(g.color, theme)}
                    >
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Like */}
                {user && (
                  <Button
                    type="button"
                    onClick={async () => {
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
                    }}
                    className={`px-3 py-1.5 rounded-md shadow text-sm hover:brightness-110 flex items-center gap-1.5 transition-colors ${
                      isLiked
                        ? "bg-rose-500 text-white"
                        : theme === "dark"
                        ? "bg-[#2a2a2a] text-white/70 border border-[#444]"
                        : "bg-white text-gray-600 border border-gray-200"
                    }`}
                    aria-label={isLiked ? txt.unlike : txt.like}
                    aria-pressed={isLiked}
                  >
                    <span aria-hidden="true">{isLiked ? "♥" : "♡"}</span>
                    <span>{likesCount}</span>
                  </Button>
                )}
                {!user && likesCount > 0 && (
                  <span className={`text-sm flex items-center gap-1 ${theme === "dark" ? "text-white/50" : "text-gray-400"}`}>
                    <span aria-hidden="true">♥</span> {likesCount}
                  </span>
                )}

                {/* Partager / Copier le lien */}
                <Button
                  type="button"
                  onClick={async () => {
                    if (typeof navigator.share === "function") {
                      try {
                        await navigator.share({ title, url: window.location.href });
                      } catch { /* annulé par l'utilisateur — noop */ }
                    } else {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1200);
                      } catch { /* noop */ }
                    }
                  }}
                  className={`px-3 py-1.5 rounded-md shadow text-sm hover:brightness-110 ${
                    theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
                  }`}
                  aria-label={typeof navigator.share === "function" ? txt.share : txt.copy_link}
                >
                  {typeof navigator.share === "function"
                    ? txt.share
                    : copied ? txt.copied : txt.copy_link}
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
                    style={safeChipStyle(g.color, theme)}
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Contenu — HTML (Tiptap) ou texte brut (rétro-compatibilité) */}
            {(() => {
              const raw = post?.article_content ?? "";
              const isHtml = /^\s*</.test(raw);
              return (
                <div
                  ref={containerRef}
                  className={`prose max-w-none leading-relaxed ${
                    theme === "dark" ? "prose-invert prose-headings:text-white" : ""
                  }`}
                >
                  {isHtml ? (
                    // Contenu HTML sanitisé côté serveur (bleach)
                    <div dangerouslySetInnerHTML={{ __html: raw }} />
                  ) : (
                    // Texte brut (anciens articles)
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
                            transition={{ duration: 0.25, delay: i * 0.05 }}
                            className={`${i === 0 ? "mt-0" : "mt-4"}`}
                          >
                            {p}
                          </motion.p>
                        ))}
                    </AnimatePresence>
                  )}
                </div>
              );
            })()}
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

        {/* Section commentaires */}
        <section
          aria-labelledby="comments-heading"
          className={`rounded-xl border shadow p-6 md:p-8 ${card}`}
        >
          <h2 id="comments-heading" className="text-xl font-semibold mb-6">
            {txt.comments_title}
            {comments.length > 0 && (
              <span className={`ml-2 text-base font-normal ${meta}`}>({comments.length})</span>
            )}
          </h2>

          {/* Formulaire */}
          {user ? (
            <form onSubmit={submitComment} className="mb-8">
              {replyTo && (
                <div className={`text-sm mb-2 flex items-center gap-2 ${meta}`}>
                  <span>{txt.comment_reply} @{replyTo.username}</span>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="underline text-xs"
                  >
                    {txt.comment_cancel}
                  </button>
                </div>
              )}
              <label
                htmlFor="comment-textarea"
                className="sr-only"
              >
                {replyTo ? txt.comment_reply_placeholder : txt.comment_placeholder}
              </label>
              <textarea
                id="comment-textarea"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyTo ? txt.comment_reply_placeholder : txt.comment_placeholder}
                rows={3}
                maxLength={2000}
                className={`w-full rounded-lg border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  theme === "dark"
                    ? "bg-[#252525] border-[#444] text-white placeholder-white/40"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
              {commentError && (
                <p role="alert" className="text-red-500 text-sm mt-1">{txt.comment_submit_error}</p>
              )}
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={commentSubmitting || !commentText.trim()}
                  className={`px-4 py-2 rounded-md text-sm font-medium shadow hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
                  }`}
                >
                  {commentSubmitting ? "…" : txt.comment_submit}
                </button>
              </div>
            </form>
          ) : (
            <p className={`text-sm mb-6 ${meta}`}>{txt.comment_login_required}</p>
          )}

          {/* Liste des commentaires */}
          {commentsLoading && (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className={`h-16 rounded-lg ${theme === "dark" ? "bg-white/5" : "bg-gray-100"}`} />
              ))}
            </div>
          )}
          {commentsError && !commentsLoading && (
            <p className="text-red-500 text-sm">{txt.comment_error}</p>
          )}
          {!commentsLoading && !commentsError && comments.length === 0 && (
            <p className={`text-sm ${meta}`}>{txt.comment_empty}</p>
          )}
          {!commentsLoading && !commentsError && comments.length > 0 && (
            <ul className="space-y-6">
              {comments.map((c) => (
                <li key={c.id}>
                  {/* Commentaire racine */}
                  <div className={`rounded-lg p-4 ${theme === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-medium text-sm">
                        {c.author?.username || c.author?.first_name || "—"}
                      </span>
                      <span className={`text-xs ${meta}`}>
                        {new Date(c.created_at).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US")}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{c.content}</p>
                    <div className={`flex gap-3 mt-2 text-xs ${meta}`}>
                      {user && (
                        <button
                          type="button"
                          onClick={() => setReplyTo({ id: c.id, username: c.author?.username || "?" })}
                          className="hover:underline"
                        >
                          {txt.comment_reply}
                        </button>
                      )}
                      {user && (user.id === c.author?.id || user.is_staff) && (
                        <button
                          type="button"
                          onClick={() => deleteComment(c.id)}
                          className="hover:underline text-red-400"
                        >
                          {txt.comment_delete}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Réponses (niveau 1) */}
                  {c.replies?.length > 0 && (
                    <ul className="ml-6 mt-3 space-y-3">
                      {c.replies.map((r) => (
                        <li
                          key={r.id}
                          className={`rounded-lg p-3 ${theme === "dark" ? "bg-white/3 border border-white/10" : "bg-white border border-gray-100"}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {r.author?.username || r.author?.first_name || "—"}
                            </span>
                            <span className={`text-xs ${meta}`}>
                              {new Date(r.created_at).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US")}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{r.content}</p>
                          {user && (user.id === r.author?.id || user.is_staff) && (
                            <button
                              type="button"
                              onClick={() => deleteComment(r.id)}
                              className={`mt-1 text-xs hover:underline text-red-400`}
                            >
                              {txt.comment_delete}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Carrousel "même genre" (composant séparé) */}
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
