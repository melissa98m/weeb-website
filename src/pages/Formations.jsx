import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { setCanonical, setOgMeta, setHreflang, setJsonLd, setTwitterMeta, SITE_URL, DEFAULT_OG_IMAGE } from "../lib/seo";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import Button from "../components/Button";
import formationsEn from "../../locales/en/formations.json";
import formationsFr from "../../locales/fr/formations.json";
import FormationCard from "../components/Formations/FormationCard";
import FormationModal from "../components/Formations/FormationModal";
import SkeletonCard from "../components/Formations/SkeletonCard";
import { getEnv } from "../lib/env";

const API_BASE = getEnv("VITE_API_URL", "http://localhost:8000/api");

export default function Formations() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const reduceMotion = useReducedMotion();
  const t = language === "fr" ? formationsFr : formationsEn;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]); // [{ id, name, description }]
  const [q, setQ] = useState("");
  const [visible, setVisible] = useState(6);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

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
        if (active) {
          setItems(list);
        }
      } catch (e) {
        if (e?.name === "AbortError" || ctr.signal.aborted) return;
        console.error("Failed to load formations", e);
        if (active) {
          setItems([]); // pas de mock -> strict
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
      ctr.abort();
    };
  }, []);

  // ── SEO ──────────────────────────────────────────────────────────────────────
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

  const card =
    theme === "dark"
      ? "bg-surface text-white border-border"
      : "bg-white text-gray-900 border-gray-200";
  const input =
    theme === "dark"
      ? "bg-surface border-border text-white placeholder-white/50"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

  return (
    <main className="px-6 py-16 max-w-6xl mx-auto">
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className={`text-xs uppercase tracking-widest font-medium mb-3 ${
          theme === "dark" ? "text-primary" : "text-secondary"
        }`}>
          {language === "fr" ? "Catalogue" : "Catalog"}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">{t.title}</h1>
        <p className={`text-base md:text-lg max-w-2xl ${theme === "dark" ? "text-white/60" : "text-gray-500"}`}>{t.subtitle}</p>
      </motion.header>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-8">
        <div className="relative w-full md:max-w-md">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search_placeholder}
            className={`w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-primary ${input}`}
            aria-label={t.search_placeholder}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60">⌘K</span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} theme={theme} />
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
              {filtered.slice(0, visible).map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <FormationCard f={f} theme={theme} onView={openSummary} />
                </motion.div>
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
