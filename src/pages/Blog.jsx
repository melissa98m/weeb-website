import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import Button from "../components/Button";
import blogFr from "../../locales/fr/blog.json";
import blogEn from "../../locales/en/blog.json";

// --- Données de test (a remplacer par l'api) ---
const MOCK_POSTS = [
  {
    id: 1,
    title: "Refactoriser son design system sans tout casser",
    date: "2025-09-15",
    author: { name: "Alice Martin" },
    tags: ["Design", "Frontend"],
    excerpt:
      "Comment migrer un design system existant vers une architecture plus modulable en limitant les régressions.",
    content:
      "Long contenu factice pour estimer le temps de lecture. ".repeat(80),
    cover:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Optimiser les perfs React côté UI et réseau",
    date: "2025-08-02",
    author: { name: "Yannis Ben" },
    tags: ["React", "Performance"],
    excerpt:
      "Du batching concurrent aux stratégies de cache HTTP, tout ce qu’il faut pour rendre l’UI plus fluide.",
    content:
      "Texte pour simuler la lecture et obtenir un temps réaliste. ".repeat(120),
    cover:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Django + DRF : patterns d’auth à cookie HttpOnly",
    date: "2025-07-10",
    author: { name: "Mei Chen" },
    tags: ["Django", "Backend", "Security"],
    excerpt:
      "JWT en cookies HttpOnly, rotation de tokens, CSRF : un guide pas à pas avec exemples.",
    content:
      "Encore du contenu pour calculer un temps de lecture plausible. ".repeat(
        60
      ),
    cover:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop",
  },
];

// --- Utils ---
function readingTime(text) {
  const words = String(text || "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200)); // ~200 wpm
}
function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function Blog() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? blogFr : blogEn;

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState([]);

  // Simule un fetch (pour l’animation + skeleton)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(MOCK_POSTS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(needle) ||
        p.excerpt.toLowerCase().includes(needle) ||
        p.tags.join(" ").toLowerCase().includes(needle) ||
        p.author.name.toLowerCase().includes(needle)
    );
  }, [q, posts]);

  const pageBg =
    theme === "dark"
      ? "text-white"
      : "text-background";

  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] border-[#333] text-white"
      : "bg-white border-gray-200 text-gray-900";

  const chip =
    theme === "dark"
      ? "bg-white/10 text-white"
      : "bg-gray-100 text-gray-700";

  // Variants framer-motion
  const containerV = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemV = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } },
  };

  return (
    <main className={`min-h-screen px-6 py-16 ${pageBg}`}>
      <section className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{t.title}</h1>
            <p className={`mt-2 opacity-70`}>
              {t.subtitle}
            </p>
          </div>
          <div className="w-full md:w-80">
            <label className="sr-only">{t.search_placeholder}</label>
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                theme === "dark" ? "border-[#333] bg-[#111]" : "border-gray-200 bg-white"
              }`}
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.search_placeholder}
                className={`w-full bg-transparent outline-none text-sm`}
              />
              <span className="opacity-60">⌘K</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerV}
          initial="hidden"
          animate={loading ? "hidden" : "show"}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* Skeletons */}
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className={`animate-pulse rounded-2xl overflow-hidden border ${card}`}
              >
                <div className="h-40 bg-gray-300/20" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-300/20 rounded" />
                  <div className="h-4 bg-gray-300/20 rounded w-2/3" />
                  <div className="h-4 bg-gray-300/20 rounded w-1/2" />
                  <div className="h-9 bg-gray-300/20 rounded" />
                </div>
              </div>
            ))}

          {/* Cards */}
          {!loading && filtered.length === 0 && (
            <p className="opacity-70">{t.no_posts}</p>
          )}

          {!loading &&
            filtered.map((p) => {
              const minutes = readingTime(p.content);
              const slug = slugify(p.title);
              return (
                <motion.article
                  key={p.id}
                  variants={itemV}
                  whileHover={{ y: -4 }}
                  className={`group rounded-2xl overflow-hidden border ${card} shadow-sm`}
                >
                  {/* Cover */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={p.cover}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs opacity-70">
                      <span>{new Date(p.date).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US")}</span>
                      <span>
                        {t.by} {p.author.name} • {minutes} {t.min_read}
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg font-semibold leading-snug">
                      {p.title}
                    </h3>

                    <p className="mt-2 text-sm opacity-80 line-clamp-3">
                      {p.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-1 rounded-full text-xs ${chip}`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-4">
                      <Button
                        to={`/blog/${slug}`}
                        className={`text-sm px-3 py-2 rounded-md shadow hover:brightness-110 ${
                          theme === "dark"
                            ? "bg-secondary text-white"
                            : "bg-primary text-dark"
                        }`}
                        aria-label={`${t.read_more} ${p.title}`}
                        title={`${t.read_more} ${p.title}`}
                      >
                        {t.read_more}
                      </Button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
        </motion.div>
      </section>
    </main>
  );
}
