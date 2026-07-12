import { useTheme } from "../../context/ThemeContext";
import { motion, useReducedMotion } from "framer-motion";
import homeEn from "../../../locales/en/home.json";
import homeFr from "../../../locales/fr/home.json";
import { useLanguage } from "../../context/LanguageContext";
import Button from "../Button";

function IconChevronDown({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconCheck({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const STATS_FR = [
  { value: "100%", label: "Gratuit" },
  { value: "RGPD", label: "Conforme" },
  { value: "✦", label: "Mis à jour chaque semaine" },
];

const STATS_EN = [
  { value: "100%", label: "Free" },
  { value: "GDPR", label: "Compliant" },
  { value: "✦", label: "Updated every week" },
];

export default function HeroSection() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";
  const prefersReducedMotion = useReducedMotion();
  const isFr = language === "fr";

  const stats = isFr ? STATS_FR : STATS_EN;

  const anim = (extra = {}) =>
    prefersReducedMotion ? {} : extra;

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-0 overflow-hidden"
      style={{ minHeight: "100svh" }}
      aria-label={isFr ? "Section héros" : "Hero section"}
    >

      {/* ── Background ─────────────────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">

        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: isDark
              ? "radial-gradient(circle, rgba(192,132,252,0.07) 1px, transparent 1px)"
              : "radial-gradient(circle, rgba(147,51,234,0.05) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Orb — top left */}
        <motion.div
          className="absolute -top-48 -left-48 w-[560px] h-[560px] rounded-full blur-3xl"
          style={{ background: isDark ? "rgba(192,132,252,0.14)" : "rgba(192,132,252,0.10)" }}
          {...anim({
            animate: { y: [0, 28, 0], opacity: [0.5, 0.75, 0.5] },
            transition: { duration: 9, repeat: Infinity, ease: "easeInOut" },
          })}
        />

        {/* Orb — top right */}
        <motion.div
          className="absolute -top-24 -right-36 w-[420px] h-[420px] rounded-full blur-3xl"
          style={{ background: isDark ? "rgba(147,51,234,0.12)" : "rgba(147,51,234,0.07)" }}
          {...anim({
            animate: { y: [0, -22, 0], opacity: [0.4, 0.65, 0.4] },
            transition: { duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
          })}
        />

        {/* Orb — bottom center */}
        <motion.div
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[640px] h-[300px] rounded-full blur-3xl"
          style={{ background: isDark ? "rgba(192,132,252,0.08)" : "rgba(147,51,234,0.05)" }}
          {...anim({
            animate: { x: [0, 24, 0], opacity: [0.3, 0.5, 0.3] },
            transition: { duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 },
          })}
        />

        {/* Center radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(192,132,252,0.10), transparent 65%)"
              : "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(147,51,234,0.06), transparent 65%)",
          }}
        />
      </div>

      {/* ── Badge ──────────────────────────────────────────────────────── */}
      <motion.div
        {...anim({ initial: { opacity: 0, scale: 0.88 }, animate: { opacity: 1, scale: 1 } })}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-8"
        style={{
          background: isDark ? "rgba(192,132,252,0.08)" : "rgba(147,51,234,0.06)",
          border: "1px solid",
          borderColor: isDark ? "rgba(192,132,252,0.25)" : "rgba(147,51,234,0.20)",
          color: isDark ? "#c084fc" : "#9333ea",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        {isFr ? "Plateforme d'apprentissage web" : "Web learning platform"}
      </motion.div>

      {/* ── Title ──────────────────────────────────────────────────────── */}
      <motion.h1
        {...anim({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } })}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className={`font-display font-extrabold leading-[1.05] tracking-tight max-w-4xl ${
          isDark ? "text-white" : "text-dark"
        }`}
        style={{ fontSize: "clamp(2.75rem, 7vw, 5.5rem)" }}
      >
        {isFr ? homeFr.home_title_1 : homeEn.home_title_1}{" "}
        <span className="text-primary">Web</span>{" "}
        {isFr ? homeFr.home_title_2 : homeEn.home_title_2}{" "}
        <br className="hidden sm:block" />
        <span
          style={{
            background: "linear-gradient(135deg, #c084fc 0%, #9333ea 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {isFr ? homeFr.home_title_3 : homeEn.home_title_3}
        </span>
      </motion.h1>

      {/* ── Subtitle ───────────────────────────────────────────────────── */}
      <motion.p
        {...anim({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } })}
        transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className={`mt-6 max-w-xl text-base md:text-lg leading-relaxed ${
          isDark ? "text-white/55" : "text-dark/55"
        }`}
      >
        {isFr ? homeFr.web_world : homeEn.web_world}
      </motion.p>

      {/* ── CTAs ───────────────────────────────────────────────────────── */}
      <motion.div
        {...anim({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } })}
        transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center"
      >
        <Button variant="primary" size="lg" to="/blog">
          {isFr ? homeFr.link_1 : homeEn.link_1}
        </Button>
        <Button variant="ghost" size="lg" isDark={isDark} to="/formations">
          {isFr ? homeFr.link_1_secondary : homeEn.link_1_secondary}
        </Button>
      </motion.div>

      {/* ── Stats strip ────────────────────────────────────────────────── */}
      <motion.div
        {...anim({ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } })}
        transition={{ duration: 0.5, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        aria-label={isFr ? "Points forts" : "Key highlights"}
      >
        {stats.map((stat, i) => (
          <span
            key={i}
            className={`flex items-center gap-1.5 text-xs font-medium ${
              isDark ? "text-white/60" : "text-dark/40"
            }`}
          >
            <span
              className={`flex items-center justify-center w-4 h-4 rounded-full ${
                isDark ? "bg-primary/15 text-primary" : "bg-secondary/10 text-secondary"
              }`}
              aria-hidden="true"
            >
              <IconCheck size={9} />
            </span>
            <span>
              <strong className={`font-bold ${isDark ? "text-white/70" : "text-dark/70"}`}>
                {stat.value}
              </strong>{" "}
              {stat.label}
            </span>
          </span>
        ))}
      </motion.div>

      {/* ── Scroll indicator ───────────────────────────────────────────── */}
      <motion.div
        {...anim({
          animate: { y: [0, 6, 0] },
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        })}
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 ${
          isDark ? "text-white/60" : "text-dark/25"
        }`}
        aria-hidden="true"
      >
        <span className="text-[10px] font-medium tracking-widest uppercase">Scroll</span>
        <IconChevronDown size={16} />
      </motion.div>

      {/* ── Mockup ─────────────────────────────────────────────────────── */}
      <motion.div
        {...anim({ initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } })}
        transition={{ duration: 0.85, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mt-16 relative"
        aria-hidden="true"
      >
        {/* Fade mask at top to blend with background */}
        <div
          className="absolute top-0 left-0 right-0 h-24 z-10 pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(to bottom, #0f172a, transparent)"
              : "linear-gradient(to bottom, #f2f2f2, transparent)",
          }}
        />
        <img
          src="/home/mokup-1176.webp"
          srcSet="/home/mokup-400.webp 400w, /home/mokup-800.webp 800w, /home/mokup-1176.webp 1176w"
          sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1176px"
          alt="Interface Weeb — aperçu de la plateforme"
          width={1176}
          height={780}
          fetchPriority="high"
          decoding="sync"
          className="w-full rounded-t-xl"
          style={{
            filter: isDark
              ? "drop-shadow(0 -8px 56px rgba(147,51,234,0.22))"
              : "drop-shadow(0 -4px 28px rgba(0,0,0,0.09))",
          }}
        />
      </motion.div>
    </section>
  );
}
