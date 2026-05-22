import { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import AboutIntro from "../components/About/AboutIntro";
import aboutEn from "../../locales/en/about.json";
import aboutFr from "../../locales/fr/about.json";
import { motion } from "framer-motion";
import { setCanonical, setOgMeta, setHreflang, setJsonLd, setTwitterMeta, SITE_URL, DEFAULT_OG_IMAGE } from "../lib/seo";
import Button from "../components/Button";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconAward({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

function IconRocket({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function IconUsers({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconGlobe({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// ─── Value card ───────────────────────────────────────────────────────────────

function ValueCard({ icon: Icon, title, desc, isDark, accentColor, delay = 0 }) {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-4 p-6 rounded-2xl border transition-colors duration-200 ${
        isDark
          ? "bg-surface border-border hover:border-border-2"
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${accentColor}15`, color: accentColor }}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <h3 className={`font-display font-bold text-base mb-1.5 ${isDark ? "text-white" : "text-dark"}`}>
          {title}
        </h3>
        <p className={`text-sm leading-relaxed ${isDark ? "text-white/55" : "text-dark/55"}`}>
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children, isDark }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[.15em] mb-3 ${
      isDark ? "text-white/35" : "text-dark/35"
    }`}>
      {children}
    </p>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function About() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? aboutFr : aboutEn;
  const isDark = theme === "dark";
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // SEO
  useEffect(() => {
    const prev = document.title;
    const isFr = language === "fr";
    const title = isFr
      ? "À propos | Weeb — Notre mission et notre équipe"
      : "About | Weeb — Our Mission and Team";
    const desc = isFr
      ? "Découvrez la mission de Weeb : rendre l'apprentissage du développement web accessible à tous, avec des formations pratiques et des articles de qualité."
      : "Discover Weeb's mission: making web development learning accessible to everyone, with practical courses and quality articles.";

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute("content", "index, follow");

    const cleanCanonical = setCanonical("/about-us");
    const cleanHreflang = setHreflang("/about-us");
    const cleanOgUrl = setOgMeta("og:url", `${SITE_URL}/about-us`);
    const cleanOgTitle = setOgMeta("og:title", title);
    const cleanOgDesc = setOgMeta("og:description", desc);
    const cleanOgImg = setOgMeta("og:image", DEFAULT_OG_IMAGE);
    const cleanTwTitle = setTwitterMeta("twitter:title", title);
    const cleanTwDesc = setTwitterMeta("twitter:description", desc);
    const cleanTwImg = setTwitterMeta("twitter:image", DEFAULT_OG_IMAGE);

    const cleanJsonLd = setJsonLd("jsonld-org", {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Weeb",
      url: SITE_URL,
      description: desc,
      sameAs: [],
    });

    return () => {
      document.title = prev;
      cleanCanonical(); cleanHreflang(); cleanOgUrl(); cleanOgTitle();
      cleanOgDesc(); cleanOgImg(); cleanTwTitle(); cleanTwDesc(); cleanTwImg();
      cleanJsonLd();
    };
  }, [language]);

  const VALUES = [
    { key: "quality",       icon: IconAward,  title: t.value_quality,       desc: t.value_quality_desc,       accentColor: "#c084fc" },
    { key: "innovation",    icon: IconRocket, title: t.value_innovation,    desc: t.value_innovation_desc,    accentColor: "#38bdf8" },
    { key: "community",     icon: IconUsers,  title: t.value_community,     desc: t.value_community_desc,     accentColor: "#34d399" },
    { key: "accessibility", icon: IconGlobe,  title: t.value_accessibility, desc: t.value_accessibility_desc, accentColor: "#fb923c" },
  ];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <AboutIntro />

      {/* ── Manifesto: Mission + Vision ──────────────────────────────────── */}
      <section
        className="max-w-2xl mx-auto px-6 py-16"
        aria-label={language === "fr" ? "Mission et vision" : "Mission and vision"}
      >
        {/* Mission */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionLabel isDark={isDark}>
            {language === "fr" ? "Mission" : "Mission"}
          </SectionLabel>
          <motion.h2
            className={`font-display font-extrabold text-2xl md:text-3xl tracking-tight leading-snug mb-5 ${
              isDark ? "text-white" : "text-dark"
            }`}
          >
            {t.mission_title}
          </motion.h2>
          <motion.p
            className={`text-base md:text-lg leading-[1.8] ${isDark ? "text-white/65" : "text-dark/65"}`}
          >
            {t.mission_text}
          </motion.p>
        </motion.div>

        {/* Divider */}
        <div
          aria-hidden="true"
          className={`my-12 border-t ${isDark ? "border-border" : "border-gray-200"}`}
        />

        {/* Vision */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionLabel isDark={isDark}>
            {language === "fr" ? "Vision" : "Vision"}
          </SectionLabel>
          <motion.h2
            className={`font-display font-extrabold text-2xl md:text-3xl tracking-tight leading-snug mb-5 ${
              isDark ? "text-white" : "text-dark"
            }`}
          >
            {t.vision_title}
          </motion.h2>
          <motion.p
            className={`text-base md:text-lg leading-[1.8] ${isDark ? "text-white/65" : "text-dark/65"}`}
          >
            {t.vision_text}
          </motion.p>
        </motion.div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-10 pb-16">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <motion.h2
            className={`font-display font-extrabold text-3xl tracking-tight ${isDark ? "text-white" : "text-dark"}`}
          >
            {t.values_title}
          </motion.h2>
          <p className={`mt-2 text-sm ${isDark ? "text-white/40" : "text-dark/40"}`}>
            {language === "fr"
              ? "Les principes qui guident chaque décision."
              : "The principles that guide every decision."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VALUES.map(({ key, icon, title, desc, accentColor }, idx) => (
            <ValueCard
              key={key}
              icon={icon}
              title={title}
              desc={desc}
              isDark={isDark}
              accentColor={accentColor}
              delay={idx * 0.07}
            />
          ))}
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-12 text-center">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          {/* Large decorative quote mark */}
          <div
            aria-hidden="true"
            className="font-display font-extrabold text-8xl leading-none mb-4 select-none"
            style={{ color: isDark ? "rgba(192,132,252,0.18)" : "rgba(147,51,234,0.12)" }}
          >
            "
          </div>

          <motion.h2
            className={`font-display font-extrabold text-2xl md:text-3xl tracking-tight mb-5 ${
              isDark ? "text-white" : "text-dark"
            }`}
          >
            {t.team_title}
          </motion.h2>

          <motion.p
            className={`text-base md:text-lg leading-[1.8] max-w-xl mx-auto ${
              isDark ? "text-white/65" : "text-dark/65"
            }`}
          >
            {t.team_text}
          </motion.p>
        </motion.div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-10 pb-20">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl px-8 py-16 md:py-20 text-center"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(192,132,252,0.08) 0%, rgba(147,51,234,0.12) 100%)"
              : "linear-gradient(135deg, rgba(192,132,252,0.06) 0%, rgba(147,51,234,0.09) 100%)",
            border: isDark ? "1px solid rgba(192,132,252,0.15)" : "1px solid rgba(147,51,234,0.12)",
          }}
        >
          {/* Decorative glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isDark
                ? "radial-gradient(ellipse 60% 40% at 50% 110%, rgba(192,132,252,0.10), transparent)"
                : "radial-gradient(ellipse 60% 40% at 50% 110%, rgba(147,51,234,0.05), transparent)",
            }}
          />

          <div className="relative">
            <motion.h2
              className={`font-display font-extrabold tracking-tight ${isDark ? "text-white" : "text-dark"}`}
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
            >
              {t.cta_title}
            </motion.h2>

            <motion.p
              className={`mt-4 text-base max-w-md mx-auto ${isDark ? "text-white/55" : "text-dark/55"}`}
            >
              {t.cta_text}
            </motion.p>

            {/* CTAs — links tested by href and accessible name */}
            <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Link
                to="/blog"
                className={`inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isDark
                    ? "bg-primary text-dark hover:bg-white"
                    : "bg-secondary text-white hover:bg-primary"
                }`}
              >
                {t.cta_blog}
              </Link>

              <Link
                to="/formations"
                className={`inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isDark
                    ? "bg-primary text-dark hover:bg-white"
                    : "bg-secondary text-white hover:bg-primary"
                }`}
              >
                {t.cta_formations}
              </Link>

              <Link
                to="/contact"
                className={`inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold border transition-colors duration-150 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isDark
                    ? "border-border text-white/70 hover:text-white hover:border-border-2"
                    : "border-gray-300 text-dark/70 hover:text-dark hover:border-gray-400"
                }`}
              >
                {t.cta_contact}
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
