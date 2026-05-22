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

export default function HeroSection() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";
  const prefersReducedMotion = useReducedMotion();

  const titleAnim = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

  const subtitleAnim = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  const ctaAnim = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  const mockupAnim = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } };

  const scrollIndicatorAnim = prefersReducedMotion
    ? {}
    : {
        animate: { y: [0, 6, 0] },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      };

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-0"
      style={{ minHeight: "100svh" }}
      aria-label={language === "fr" ? "Section héros" : "Hero section"}
    >
      {/* Radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(192,132,252,0.12), transparent 70%)"
            : "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(147,51,234,0.06), transparent 70%)",
        }}
      />

      {/* Badge */}
      <motion.div
        {...(prefersReducedMotion ? {} : { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } })}
        transition={{ duration: 0.4 }}
        className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border mb-8 ${
          isDark
            ? "border-primary/30 text-primary bg-primary/5"
            : "border-secondary/30 text-secondary bg-secondary/5"
        }`}
      >
        <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        {language === "fr" ? "Plateforme d'apprentissage web" : "Web learning platform"}
      </motion.div>

      {/* Title */}
      <motion.h1
        {...titleAnim}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`font-display font-extrabold leading-[1.05] tracking-tight max-w-4xl ${
          isDark ? "text-white" : "text-dark"
        }`}
        style={{ fontSize: "clamp(2.75rem, 7vw, 5.5rem)" }}
      >
        {language === "fr" ? homeFr.home_title_1 : homeEn.home_title_1}{" "}
        <span className="text-primary">Web</span>{" "}
        {language === "fr" ? homeFr.home_title_2 : homeEn.home_title_2}{" "}
        <br className="hidden sm:block" />
        <span
          style={{
            background: "linear-gradient(135deg, #c084fc 0%, #9333ea 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {language === "fr" ? homeFr.home_title_3 : homeEn.home_title_3}
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        {...subtitleAnim}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={`mt-6 max-w-xl text-base md:text-lg leading-relaxed ${
          isDark ? "text-white/55" : "text-dark/55"
        }`}
      >
        {language === "fr" ? homeFr.web_world : homeEn.web_world}
      </motion.p>

      {/* CTAs */}
      <motion.div
        {...ctaAnim}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center"
      >
        <Button variant="primary" size="lg" to="/blog">
          {language === "fr" ? homeFr.link_1 : homeEn.link_1}
        </Button>
        <Button variant="ghost" size="lg" isDark={isDark} to="/formations">
          {language === "fr" ? homeFr.link_1_secondary : homeEn.link_1_secondary}
        </Button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        {...scrollIndicatorAnim}
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 ${
          isDark ? "text-white/30" : "text-dark/30"
        }`}
        aria-hidden="true"
      >
        <span className="text-[10px] font-medium tracking-widest uppercase">Scroll</span>
        <IconChevronDown size={16} />
      </motion.div>

      {/* Mockup — partially below the fold to invite scroll */}
      <motion.div
        {...mockupAnim}
        transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mt-16 relative"
        aria-hidden="true"
      >
        {/* Top edge gradient mask to create a "rising from below" effect */}
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
              ? "drop-shadow(0 -8px 48px rgba(147,51,234,0.18))"
              : "drop-shadow(0 -4px 24px rgba(0,0,0,0.08))",
          }}
        />
      </motion.div>
    </section>
  );
}
