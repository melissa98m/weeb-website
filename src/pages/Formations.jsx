import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { setCanonical, setOgMeta, setHreflang, setJsonLd, setTwitterMeta, SITE_URL, DEFAULT_OG_IMAGE } from "../lib/seo";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import formationsEn from "../../locales/en/formations.json";
import formationsFr from "../../locales/fr/formations.json";
import FormationCard from "../components/Formations/FormationCard";
import FormationModal from "../components/Formations/FormationModal";
import SkeletonCard from "../components/Formations/SkeletonCard";
import { getEnv } from "../lib/env";

const API_BASE = getEnv("VITE_API_URL", "http://localhost:8000/api");

function IconSearch({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconPlay({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

// ── Resume section (for authenticated users with in-progress formations) ────

function ResumeSection({ userFormations, allFormations, theme, t, language, onView }) {
  const isDark = theme === "dark";
  const prefersReducedMotion = useReducedMotion();

  // Find formations that are in progress (progress > 0 and < 100)
  const inProgress = useMemo(() => {
    if (!Array.isArray(userFormations) || !Array.isArray(allFormations)) return [];
    return userFormations
      .filter((uf) => uf.progress_percent > 0 && uf.progress_percent < 100)
      .map((uf) => {
        const base = allFormations.find((f) => f.id === uf.formation_id || f.id === uf.formation) || {};
        return { ...base, ...uf, id: uf.formation_id ?? uf.formation ?? base.id };
      })
      .slice(0, 3);
  }, [userFormations, allFormations]);

  if (inProgress.length === 0) return null;

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-16"
      aria-label={language === "fr" ? "Reprendre" : "Resume"}
    >
      <div className="flex items-center gap-3 mb-5">
        <span className={`w-2 h-2 rounded-full bg-primary flex-shrink-0 ${prefersReducedMotion ? "" : "animate-pulse"}`} aria-hidden="true" />
        <h2 className={`font-display font-bold text-xl ${isDark ? "text-white" : "text-dark"}`}>
          {language === "fr" ? "Reprendre où vous en étiez" : "Resume where you left off"}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {inProgress.map((f) => (
          <FormationCard key={f.id} f={f} theme={theme} onView={onView} />
        ))}
      </div>

      <div className={`mt-6 border-t ${isDark ? "border-border" : "border-gray-200"}`} />
    </motion.section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Formations() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
  const t = language === "fr" ? formationsFr : formationsEn;
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [userFormations, setUserFormations] = useState([]);
  const [q, setQ] = useState("");
  const [visible, setVisible] = useState(6);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Fetch formations catalogue
  useEffect(() => {
    if (typeof window !== "undefined" && window.Cypress) {
      const mock = window.__formationsMock__;
      if (Array.isArray(mock)) {
        setItems(mock);
        setLoading(false);
        return;
      }
    }

    const ctr = new AbortController();
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/formations/`, {
          credentials: "omit",
          signal: ctr.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        if (active) setItems(list);
      } catch (e) {
        if (e?.name === "AbortError" || ctr.signal.aborted) return;
        console.error("Failed to load formations", e);
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; ctr.abort(); };
  }, []);

  // Fetch user's formations progress (only if authenticated)
  useEffect(() => {
    if (!user) { setUserFormations([]); return; }
    const ctr = new AbortController();
    fetch(`${API_BASE}/user-formations/`, { credentials: "include", signal: ctr.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setUserFormations(list);
      })
      .catch((e) => { if (e?.name !== "AbortError") setUserFormations([]); });
    return () => ctr.abort();
  }, [user]);

  // SEO
  useEffect(() => {
    const prev = document.title;
    const isFr = language === "fr";
    const title = isFr ? "Formations | Weeb — Apprendre le développement web" : "Trainings | Weeb — Learn Web Development";
    const desc = isFr
      ? "Découvrez nos formations en développement web. Progressez à votre rythme avec des modules interactifs et des exercices pratiques."
      : "Discover our web development trainings. Progress at your own pace with interactive modules and practical exercises.";

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute("content", "index, follow");

    const cleanCanonical = setCanonical("/formations");
    const cleanHreflang = setHreflang("/formations");
    const cleanOgUrl = setOgMeta("og:url", `${SITE_URL}/formations`);
    const cleanOgTitle = setOgMeta("og:title", title);
    const cleanOgDesc = setOgMeta("og:description", desc);
    const cleanOgImg = setOgMeta("og:image", DEFAULT_OG_IMAGE);
    const cleanTwTitle = setTwitterMeta("twitter:title", title);
    const cleanTwDesc = setTwitterMeta("twitter:description", desc);
    const cleanTwImg = setTwitterMeta("twitter:image", DEFAULT_OG_IMAGE);
    const cleanJsonLd = setJsonLd("jsonld-formations", {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: title,
      description: desc,
      url: `${SITE_URL}/formations`,
      numberOfItems: items.length || undefined,
      itemListElement: items.slice(0, 10).map((f, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: f.name,
        url: `${SITE_URL}/formation/${f.id}`,
      })),
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
  }, [language, items]);

  const openSummary = useCallback((f) => { setSelected(f); setOpen(true); }, []);
  const closeSummary = useCallback(() => { setOpen(false); setSelected(null); }, []);

  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return items.filter((f) => {
      const name = f?.name?.toLowerCase?.() || "";
      const desc = f?.description?.toLowerCase?.() || "";
      return !lower || name.includes(lower) || desc.includes(lower);
    });
  }, [items, q]);

  const inputClass = isDark
    ? "bg-surface-3/60 border-border-2 text-white placeholder-white/40 focus:border-primary"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary";

  const emptyCard = isDark
    ? "bg-surface border-border text-white"
    : "bg-white border-gray-200 text-gray-900";

  return (
    <main className="max-w-6xl mx-auto px-6 pt-28 pb-20">

      {/* Page header with integrated search + counter */}
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1
              className={`font-display font-extrabold tracking-tight leading-tight ${isDark ? "text-white" : "text-dark"}`}
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
            >
              {t.title}
            </h1>
            <p className={`mt-3 text-base md:text-lg max-w-xl ${isDark ? "text-white/50" : "text-dark/50"}`}>
              {t.subtitle}
            </p>
          </div>

          {/* Formation count */}
          {!loading && items.length > 0 && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className={`flex-shrink-0 self-start mt-1 px-4 py-2 rounded-xl border text-sm font-semibold tabular-nums ${
                isDark
                  ? "border-border bg-surface text-white/70"
                  : "border-gray-200 bg-white text-dark/70"
              }`}
            >
              {items.length} {language === "fr" ? "formations" : "courses"}
            </motion.div>
          )}
        </div>

        {/* Search — inline with header */}
        <div className="relative mt-6 max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <IconSearch size={16} />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search_placeholder}
            aria-label={t.search_placeholder}
            className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${inputClass}`}
          />
        </div>
      </motion.header>

      {/* Resume section — authenticated users with in-progress formations */}
      {user && !loading && (
        <ResumeSection
          userFormations={userFormations}
          allFormations={items}
          theme={theme}
          t={t}
          language={language}
          onView={openSummary}
        />
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} theme={theme} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${emptyCard}`}>
          <p className="opacity-70 text-sm">{t.empty}</p>
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className={`mt-4 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                isDark
                  ? "border-border text-white/60 hover:bg-surface-2"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {language === "fr" ? "Effacer la recherche" : "Clear search"}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Section title for the full catalogue */}
          {user && (
            <h2 className={`font-display font-semibold text-lg mb-5 ${isDark ? "text-white/70" : "text-dark/70"}`}>
              {language === "fr" ? "Catalogue complet" : "Full catalogue"}
            </h2>
          )}

          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AnimatePresence>
              {filtered.slice(0, visible).map((f, idx) => (
                <motion.div
                  key={f.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.22, delay: idx * 0.04 }}
                >
                  <FormationCard f={f} theme={theme} onView={openSummary} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Load more */}
          {visible < filtered.length && (
            <div className="flex justify-center mt-10">
              <Button
                type="button"
                variant="ghost"
                isDark={isDark}
                onClick={() => setVisible((v) => v + 6)}
                className="px-6 py-2.5"
              >
                {language === "fr" ? "Charger plus" : "Load more"}
                <span className={`ml-2 text-xs ${isDark ? "text-white/40" : "text-dark/40"}`}>
                  ({filtered.length - visible} {language === "fr" ? "restantes" : "remaining"})
                </span>
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <FormationModal
        open={open}
        onClose={closeSummary}
        formation={selected}
        theme={theme}
        t={t}
      />
    </main>
  );
}
