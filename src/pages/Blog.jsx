import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import Button from "../components/Button";
import BlogCard from "../components/Blog/BlogCard";
import blogEn from "../../locales/en/blog.json";
import blogFr from "../../locales/fr/blog.json";

// --- Données de test (a remplacer par l'api) ---
const MOCK_POSTS = [
  {
    id: 1,
    title: "Building a Performant React App",
    title_fr: "Construire une application React performante",
    excerpt:
      "Key techniques to keep your app smooth and responsive with modern patterns.",
    excerpt_fr:
      "Techniques clés pour garder votre app fluide et réactive avec les patterns modernes.",
    cover: "https://picsum.photos/seed/react-perf/600/400",
    tags: ["React", "Frontend", "Performance"],
    author: "Alex Morgan",
    date: "2025-08-21"
  },
  {
    id: 2,
    title: "JWT Cookies vs LocalStorage",
    title_fr: "JWT Cookies vs LocalStorage",
    excerpt:
      "Comparing security trade-offs and DX when storing tokens on the client.",
    excerpt_fr:
      "Comparer les compromis de sécurité et l’DX pour stocker des tokens côté client.",
    cover: "https://picsum.photos/seed/jwt-cookies/600/400",
    tags: ["Security", "Auth", "Django"],
    author: "Test test",
    date: "2025-07-12"
  },
  {
    id: 3,
    title: "Styling Systems with Tailwind",
    title_fr: "Systèmes de design avec Tailwind",
    excerpt:
      "How to structure tokens, utilities and components for scalable UIs.",
    excerpt_fr:
      "Comment structurer tokens, utilitaires et composants pour des UI évolutives.",
    cover: "https://picsum.photos/seed/tailwind-system/600/400",
    tags: ["Tailwind", "Design", "Frontend"],
    author: "Lina Tran",
    date: "2025-06-05"
  },
  {
    id: 4,
    title: "Caching REST APIs",
    title_fr: "Mettre en cache des APIs REST",
    excerpt:
      "From ETags to stale-while-revalidate: practical recipes you can use today.",
    excerpt_fr:
      "Des ETags au stale-while-revalidate : des recettes pratiques à utiliser dès maintenant.",
    cover: "https://picsum.photos/seed/cache-rest/600/400",
    tags: ["Backend", "API"],
    author: "Diego Ramos",
    date: "2025-05-18"
  },
  {
    id: 5,
    title: "Accessible UI Patterns",
    title_fr: "Patrons d’interface accessibles",
    excerpt:
      "Common pitfalls and how to ship inclusive experiences without friction.",
    excerpt_fr:
      "Erreurs courantes et comment livrer des expériences inclusives sans friction.",
    cover: "https://picsum.photos/seed/a11y-ui/600/400",
    tags: ["A11y", "Frontend", "Design"],
    author: "Sara Chen",
    date: "2025-04-11"
  },
  {
    id: 6,
    title: "Django + DRF Best Practices",
    title_fr: "Bonnes pratiques Django + DRF",
    excerpt:
      "Auth, pagination, filters and how to keep your API maintainable.",
    excerpt_fr:
      "Auth, pagination, filtres et comment garder votre API maintenable.",
    cover: "https://picsum.photos/seed/django-drf/600/400",
    tags: ["Django", "Backend", "API"],
    author: "Noah Idris",
    date: "2025-03-03"
  },
  {
    id: 7,
    title: "State Machines for UI",
    title_fr: "Machines à états pour l’UI",
    excerpt:
      "Modeling complex flows with xstate and keeping bugs at bay.",
    excerpt_fr:
      "Modéliser des flux complexes avec xstate et tenir les bugs à distance.",
    cover: "https://picsum.photos/seed/xstate-ui/600/400",
    tags: ["Frontend", "Architecture"],
    author: "Eva Müller",
    date: "2025-02-10"
  },
  {
    id: 8,
    title: "Micro-animations that Matter",
    title_fr: "Micro-animations qui comptent",
    excerpt:
      "Small motion details that drastically improve perceived quality.",
    excerpt_fr:
      "De petits détails d’animation qui améliorent fortement la qualité perçue.",
    cover: "https://picsum.photos/seed/micro-anim/600/400",
    tags: ["Motion", "Design", "Frontend"],
    author: "Kenji Watanabe",
    date: "2025-01-22"
  }
];

function formatDate(iso, lang) {
  try {
    return new Date(iso).toLocaleDateString(
      lang === "fr" ? "fr-FR" : "en-US",
      { year: "numeric", month: "short", day: "2-digit" }
    );
  } catch {
    return iso;
  }
}
function estimateReadingMinutes(text = "") {
  const words = String(text).trim().split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
}

function CardSkeleton({ theme }) {
  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] border-[#333]"
      : "bg-white border-gray-200";
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

function SummaryModal({ open, onClose, post, theme, language, t }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !post) return null;

  const title = (language === "fr" ? post.title_fr : post.title) || post.title;
  const excerpt =
    (language === "fr" ? post.excerpt_fr : post.excerpt) || post.excerpt;

  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  const metaColor = theme === "dark" ? "text-white/70" : "text-gray-600";
  const readingMin = estimateReadingMinutes(excerpt);

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
            <img
              src={post.cover}
              alt={title}
              className="h-56 w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-xl md:text-2xl font-semibold">{title}</h3>
            <Button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-md border text-sm ${
                theme === "dark"
                  ? "bg-[#262626] text-white border-[#333] hover:bg-[#303030]"
                  : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
              }`}
              aria-label={t.close}
              title={t.close}
            >
              ✕ {t.close}
            </Button>
          </div>
          <div className={`text-xs mb-4 ${metaColor}`}>
            {post.author} • {formatDate(post.date, language)} • ~{readingMin} min
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tg) => (
              <span
                key={tg}
                className={`px-2 py-1 rounded-full border text-xs ${
                  theme === "dark"
                    ? "bg-[#262626] text-white border-[#333]"
                    : "bg-white text-gray-900 border-gray-200"
                }`}
              >
                {tg}
              </span>
            ))}
          </div>
          <h4 className="font-semibold mb-2">{t.summary_title}</h4>
          <p className={`${metaColor}`}>{excerpt}</p>
          <h4 className="font-semibold mt-5 mb-2">{t.key_points}</h4>
          <ul className={`list-disc pl-5 space-y-1 ${metaColor}`}>
            <li>{language === "fr" ? "Auteur :" : "Author:"} {post.author}</li>
            <li>{language === "fr" ? "Date :" : "Date:"} {formatDate(post.date, language)}</li>
            <li>{language === "fr" ? "Thèmes :" : "Topics:"} {post.tags.join(", ")}</li>
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

export default function Blog() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? blogFr : blogEn;

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState(t.all_tags);
  const [visible, setVisible] = useState(6);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setPosts(MOCK_POSTS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(id);
  }, []);

  const openSummary = useCallback((post) => {
    setSelected(post);
    setOpen(true);
  }, []);
  const closeSummary = useCallback(() => {
    setOpen(false);
    setSelected(null);
  }, []);

  const allTags = useMemo(() => {
    const set = new Set();
    MOCK_POSTS.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return [t.all_tags, ...Array.from(set)];
  }, [t.all_tags]);

  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return posts.filter((p) => {
      const title = (language === "fr" ? p.title_fr : p.title) || p.title;
      const excerpt = (language === "fr" ? p.excerpt_fr : p.excerpt) || p.excerpt;
      const tagOk = tag === t.all_tags || p.tags.includes(tag);
      const text = `${title} ${excerpt} ${p.author}`.toLowerCase();
      return tagOk && (!lower || text.includes(lower));
    });
  }, [posts, q, tag, language, t.all_tags]);

  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  const chip =
    theme === "dark"
      ? "bg-[#262626] text-white hover:bg-[#303030]"
      : "bg-white text-gray-900 hover:bg-gray-100";

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
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search_placeholder}
            className={`w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60">⌘K</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {allTags.map((name) => {
            const active = tag === name;
            return (
              <button
                key={name}
                onClick={() => setTag(name)}
                className={`px-3 py-1.5 text-sm rounded-full border transition ${
                  active
                    ? theme === "dark"
                      ? "bg-primary text-white border-primary"
                      : "bg-secondary text-white border-secondary"
                    : `${chip} border-gray-200 dark:border-[#333]`
                }`}
              >
                {name}
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
