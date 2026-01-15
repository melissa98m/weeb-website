import aboutEn from "../../../locales/en/about.json";
import aboutFr from "../../../locales/fr/about.json";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";

export default function AboutIntro() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = language === "fr" ? aboutFr : aboutEn;

  return (
    <section className="text-center px-6 py-16 max-w-4xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15,
          duration: 0.8 
        }}
        className={`text-7xl md:text-5xl font-bold mb-4 ${
          theme === "dark" ? "text-white" : "text-dark"
        }`}
      >
        {t.about_title}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: 0.3,
          type: "spring", 
          stiffness: 100, 
          damping: 15,
          duration: 0.6 
        }}
        className={`text-lg md:text-xl ${
          theme === "dark" ? "text-white/80" : "text-dark/80"
        }`}
      >
        {t.about_subtitle}
      </motion.p>
    </section>
  );
}

