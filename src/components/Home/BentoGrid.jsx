import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

function IconBook({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconZap({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconUsers({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconTrendingUp({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function BentoCard({ className, children, delay = 0, isDark }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border p-6 flex flex-col ${className} ${
        isDark
          ? "border-border"
          : "border-gray-200 bg-white"
      }`}
    >
      {children}
    </motion.div>
  );
}

export default function BentoGrid() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";

  const surface = isDark ? "bg-surface" : "bg-white";
  const surfaceRaised = isDark ? "bg-surface-raised" : "bg-gray-50";
  const surfaceDeep = isDark ? "bg-surface-deep" : "bg-gray-100";

  return (
    <section
      className="px-6 py-20 max-w-6xl mx-auto"
      aria-label={language === "fr" ? "Ce que propose Weeb" : "What Weeb offers"}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className={`font-display font-extrabold text-3xl md:text-4xl tracking-tight ${isDark ? "text-white" : "text-dark"}`}>
          {language === "fr" ? "Tout pour progresser" : "Everything to progress"}
        </h2>
        <p className={`mt-3 text-base max-w-md mx-auto ${isDark ? "text-white/70" : "text-dark/50"}`}>
          {language === "fr"
            ? "Articles, formations et communauté pour maîtriser le développement web."
            : "Articles, courses and community to master web development."}
        </p>
      </motion.div>

      {/* Bento grid — 2 cols on md, 4 cols on lg */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1 — LARGE (spans 2 cols) — Articles count */}
        <BentoCard
          className={`lg:col-span-2 min-h-[220px] justify-between ${surface}`}
          delay={0}
          isDark={isDark}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
          }`}>
            <IconBook />
          </div>
          <div>
            <p
              className={`font-display font-extrabold tracking-tight leading-none ${isDark ? "text-white" : "text-dark"}`}
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              120+
            </p>
            <p className={`mt-1 text-sm ${isDark ? "text-white/70" : "text-dark/50"}`}>
              {language === "fr" ? "articles publiés" : "published articles"}
            </p>
            <Link
              to="/blog"
              className={`inline-flex items-center gap-1.5 mt-4 text-sm font-medium transition-colors ${
                isDark ? "text-primary hover:text-white" : "text-secondary hover:text-dark"
              }`}
            >
              {language === "fr" ? "Explorer le blog" : "Browse the blog"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </BentoCard>

        {/* Card 2 — SMALL — Formations */}
        <BentoCard className={`min-h-[220px] justify-between ${surfaceRaised}`} delay={0.06} isDark={isDark}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? "bg-violet-500/10 text-violet-400" : "bg-violet-100 text-violet-600"
          }`}>
            <IconZap />
          </div>
          <div>
            <p className={`font-display font-extrabold text-4xl tracking-tight leading-none ${isDark ? "text-white" : "text-dark"}`}>
              18
            </p>
            <p className={`mt-1 text-sm ${isDark ? "text-white/70" : "text-dark/50"}`}>
              {language === "fr" ? "formations" : "courses"}
            </p>
            <Link
              to="/formations"
              className={`inline-flex items-center gap-1.5 mt-4 text-sm font-medium transition-colors ${
                isDark ? "text-violet-400 hover:text-white" : "text-violet-600 hover:text-dark"
              }`}
            >
              {language === "fr" ? "Voir tout" : "View all"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </BentoCard>

        {/* Card 3 — SMALL — Community */}
        <BentoCard className={`min-h-[220px] justify-between ${surfaceDeep}`} delay={0.1} isDark={isDark}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-600"
          }`}>
            <IconUsers />
          </div>
          <div>
            <p className={`font-display font-extrabold text-4xl tracking-tight leading-none ${isDark ? "text-white" : "text-dark"}`}>
              2k+
            </p>
            <p className={`mt-1 text-sm ${isDark ? "text-white/70" : "text-dark/50"}`}>
              {language === "fr" ? "apprenants actifs" : "active learners"}
            </p>
          </div>
        </BentoCard>

        {/* Card 4 — LARGE (spans 2 cols) — Stay up to date */}
        <BentoCard
          className={`lg:col-span-2 min-h-[180px] justify-between ${surfaceRaised}`}
          delay={0.14}
          isDark={isDark}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-600"
          }`}>
            <IconTrendingUp />
          </div>
          <div>
            <h3 className={`font-display font-bold text-xl leading-snug ${isDark ? "text-white" : "text-dark"}`}>
              {language === "fr" ? "Restez à jour" : "Stay up to date"}
            </h3>
            <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-white/70" : "text-dark/50"}`}>
              {language === "fr"
                ? "Frameworks émergents, SEO, accessibilité — chaque semaine."
                : "Emerging frameworks, SEO, accessibility — every week."}
            </p>
          </div>
        </BentoCard>

        {/* Card 5 — SMALL × 2 — Bilingue + Dark mode */}
        <BentoCard className={`min-h-[140px] justify-center items-center text-center ${surface}`} delay={0.18} isDark={isDark}>
          <span className="text-2xl mb-2" role="img" aria-label="Bilingual">🌐</span>
          <p className={`text-sm font-medium ${isDark ? "text-white/60" : "text-dark/60"}`}>
            {language === "fr" ? "Bilingue FR/EN" : "Bilingual FR/EN"}
          </p>
        </BentoCard>

        <BentoCard className={`min-h-[140px] justify-center items-center text-center ${surfaceDeep}`} delay={0.22} isDark={isDark}>
          <span className="text-2xl mb-2" role="img" aria-label="Dark mode">🌙</span>
          <p className={`text-sm font-medium ${isDark ? "text-white/60" : "text-dark/60"}`}>
            Dark mode natif
          </p>
        </BentoCard>
      </div>
    </section>
  );
}
