import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import Button from "../components/Button";
import blogEn from "../../locales/en/blog.json";
import blogFr from "../../locales/fr/blog.json";


// --- Données de test (ids alignés avec la page Blog) ---
const MOCK_POSTS = [
  {
    id: 1,
    title: "Building a Performant React App",
    title_fr: "Construire une application React performante",
    cover: "https://picsum.photos/seed/react-perf/1200/600",
    tags: ["React", "Frontend", "Performance"],
    author: "Alex Morgan",
    date: "2025-08-21",
    content: [
      "Performance in React goes beyond memoization. It starts with modeling data flow correctly and rendering only what matters.",
      "Use list virtualization, split components wisely, and lean on Suspense/Transitions for perceived responsiveness.",
      "Measure, don’t guess. Start with the browser Performance tab and React DevTools Profiler to catch expensive updates."
    ],
    content_fr: [
      "La performance dans React dépasse la simple mémoïsation. Tout commence par un bon modèle de flux de données et un rendu ciblé.",
      "Utilisez la virtualisation des listes, découpez judicieusement vos composants, et exploitez Suspense/Transitions pour la réactivité perçue.",
      "Mesurez, ne supposez pas. Débutez avec l’onglet Performance du navigateur et le Profiler de React DevTools pour repérer les mises à jour coûteuses."
    ]
  },
  {
    id: 2,
    title: "JWT Cookies vs LocalStorage",
    title_fr: "JWT Cookies vs LocalStorage",
    cover: "https://picsum.photos/seed/jwt-cookies/1200/600",
    tags: ["Security", "Auth", "Django"],
    author: "Morgan Scholz",
    date: "2025-07-12",
    content: [
      "Cookies (HttpOnly, Secure, SameSite) reduce XSS exfiltration risk, while LocalStorage is easier but exposes tokens to JS.",
      "Rotate refresh tokens, keep access tokens short-lived, and enforce CSRF protections when needed.",
      "On the server, validate audience/issuer, and prefer HTTPS everywhere."
    ],
    content_fr: [
      "Les cookies (HttpOnly, Secure, SameSite) réduisent le risque d’exfiltration via XSS, tandis que LocalStorage expose les tokens au JS.",
      "Faites tourner les refresh tokens, gardez les access tokens de courte durée et appliquez la protection CSRF si nécessaire.",
      "Côté serveur, validez audience/issuer et privilégiez l’HTTPS partout."
    ]
  },
  // Ajoute d'autres si besoin…
];

// --- Utils ---
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
function estimateReadingMinutes(paragraphs = []) {
  const text = paragraphs.join(" ");
  const words = String(text).trim().split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
}

function Skeleton({ theme }) {
  const base = theme === "dark"
    ? "bg-[#1c1c1c] border-[#333]"
    : "bg-white border-gray-200";
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
  const { theme } = useTheme();
  const { language } = useLanguage();
  const txt = language === "fr" ? blogFr : blogEn;
  //const txt = language === "fr" ? T_FR : T_EN;

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [copied, setCopied] = useState(false);

  // Simule un fetch DB
  useEffect(() => {
    const timer = setTimeout(() => {
      const found = MOCK_POSTS.find(p => String(p.id) === String(id));
      setPost(found || null);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  const title = useMemo(() => {
    if (!post) return "";
    return (language === "fr" ? post.title_fr : post.title) || post.title;
  }, [post, language]);

  const paragraphs = useMemo(() => {
    if (!post) return [];
    const arr = (language === "fr" ? post.content_fr : post.content) || post.content || [];
    return Array.isArray(arr) ? arr : [String(arr)];
  }, [post, language]);

  const readingMin = useMemo(() => estimateReadingMinutes(paragraphs), [paragraphs]);

  // Progress bar (lecture)
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    container: containerRef
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });

  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  const meta = theme === "dark" ? "text-white/70" : "text-gray-600";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  if (loading) {
    return (
      <main className="px-6 py-16 max-w-4xl mx-auto">
        <Skeleton theme={theme} />
      </main>
    );
  }

  if (!post) {
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

  return (
    <main className="px-0 md:px-6 py-12 md:py-16">
      {/* Barre de progression de lecture */}
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

        {/* Card article */}
        <article className={`rounded-xl border shadow overflow-hidden ${card}`}>
          {post.cover && (
            <div className="overflow-hidden">
              <img
                src={post.cover}
                alt={title}
                className="h-64 md:h-[22rem] w-full object-cover"
                loading="lazy"
              />
            </div>
          )}

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
                {post.author} • {formatDate(post.date, language)} • {txt.read_time} ~{readingMin} {txt.min}
              </div>
              <div className="flex items-center gap-2">
                {/* Tags */}
                <div className="hidden md:flex flex-wrap gap-2">
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

                {/* Copier le lien */}
                <Button
                  type="button"
                  onClick={copyLink}
                  className={`px-3 py-1.5 rounded-md shadow text-sm hover:brightness-110 ${
                    theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
                  }`}
                >
                  {copied ? txt.copied : txt.copy_link}
                </Button>
              </div>
            </div>

            {/* Tags (mobile) */}
            <div className="md:hidden flex flex-wrap gap-2 mb-4">
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

            {/* Contenu */}
            <div
              ref={containerRef}
              className={`prose max-w-none leading-relaxed ${
                theme === "dark" ? "prose-invert prose-headings:text-white" : ""
              }`}
            >
              <AnimatePresence>
                {paragraphs.map((p, i) => (
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

        {/* Navigation simple (placeholder) */}
        <div className="px-6 flex justify-between">
          <span className={`${meta}`}>—</span>
          <span className={`${meta}`}>—</span>
        </div>
      </div>
    </main>
  );
}
