import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import homeEn from "../../../locales/en/home.json";
import homeFr from "../../../locales/fr/home.json";
import { useLanguage } from "../../context/LanguageContext";
import Button from "../Button";

export default function LearningSection() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";

  return (
    <section className="flex flex-col lg:flex-row items-center gap-12 px-6 py-20 max-w-6xl mx-auto text-left">
      <div className="lg:w-1/2">
        <span className="font-mono text-xs text-muted tracking-[.2em]">01</span>
        <p className="text-xs uppercase tracking-widest font-medium text-muted mt-2 mb-3">
          {language === "fr" ? homeFr.home_title_4 : homeEn.home_title_4}
        </p>
        <h2 className={`font-display font-extrabold tracking-tight text-3xl md:text-4xl leading-tight ${isDark ? "text-white" : "text-dark"}`}>
          {language === "fr" ? homeFr.home_title_5 : homeEn.home_title_5}{" "}
          {language === "fr" ? homeFr.home_title_6 : homeEn.home_title_6}{" "}
          {language === "fr" ? homeFr.home_title_7 : homeEn.home_title_7}
        </h2>
        <p className={`mt-4 leading-relaxed ${isDark ? "text-white/60" : "text-dark/60"}`}>
          {language === "fr" ? homeFr.learning : homeEn.learning}
        </p>
        <Button variant="text" isDark={isDark} to="/formations" className="mt-5">
          {language === "fr" ? homeFr.link_2 : homeEn.link_2}
        </Button>
      </div>

      <motion.img
        src="/home/mokup-800.webp"
        srcSet="/home/mokup-400.webp 400w, /home/mokup-800.webp 800w"
        sizes="(max-width: 640px) 400px, 800px"
        alt="Mockup 2"
        width={800}
        height={531}
        loading="lazy"
        decoding="async"
        className="w-full max-w-md rounded-lg"
        style={{
          filter: isDark
            ? "drop-shadow(0 4px 24px rgba(147,51,234,0.10))"
            : "drop-shadow(0 4px 16px rgba(0,0,0,0.06))",
        }}
        initial={{ x: 100, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: false }}
        transition={{ type: "spring", stiffness: 30, damping: 10, mass: 1 }}
      />
    </section>
  );
}
