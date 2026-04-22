import { useTheme } from "../../context/ThemeContext";
import { motion, useReducedMotion } from "framer-motion";
import homeEn from "../../../locales/en/home.json";
import homeFr from "../../../locales/fr/home.json";
import { useLanguage } from "../../context/LanguageContext";
import { Link } from "react-router-dom";

export default function HeroSection() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  // Idle float animation — disabled when the user prefers reduced motion
  const idleFloat = prefersReducedMotion
    ? {}
    : { y: [0, -4, 0], transition: { duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "loop" } };

  return (
    <section className="px-6 py-16 text-center md:text-left max-w-5xl mx-auto">
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
        {language === "fr" ? homeFr.home_title_1 : homeEn.home_title_1}{" "}
        <span
          className={`${theme === "dark" ? "text-primary" : "text-secondary"}`}
        >
          Web
        </span>{" "}
        {language === "fr" ? homeFr.home_title_2 : homeEn.home_title_2}
        <span
          className={`underline underline-offset-8 ${
            theme === "dark" ? "decoration-primary" : "decoration-secondary"
          }`}
        >
          {" "}
          {language === "fr" ? homeFr.home_title_3 : homeEn.home_title_3}
        </span>
      </h1>
      <p
        className={`mt-4 max-w-2xl mx-auto md:mx-0 ${
          theme === "dark" ? "text-white/80" : "text-dark/80"
        }`}
      >
        {language === "fr" ? homeFr.web_world : homeEn.web_world}
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
        <Link
          to="/blog"
          className={`px-6 py-2.5 rounded-md shadow transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${
            theme === "dark"
              ? "bg-secondary text-white hover:bg-secondary/80"
              : "bg-primary text-dark hover:bg-primary/80"
          }`}
        >
          {language === "fr" ? homeFr.link_1 : homeEn.link_1}
        </Link>
        <Link
          to="/formations"
          className={`border px-6 py-2.5 rounded-md transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${
            theme === "dark"
              ? "border-white/30 hover:border-white/60 hover:bg-white/5 text-white"
              : "border-dark/30 hover:border-dark/60 hover:bg-dark/5 text-dark"
          }`}
        >
          {language === "fr" ? homeFr.link_1_secondary : homeEn.link_1_secondary}
        </Link>
      </div>
      <motion.img
        src="/home/mokup-1176.webp"
        srcSet="/home/mokup-400.webp 400w, /home/mokup-800.webp 800w, /home/mokup-1176.webp 1176w"
        sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1176px"
        alt="Mockup de l'interface Weeb sur desktop"
        width={1176}
        height={780}
        fetchPriority="high"
        decoding="sync"
        className="mt-12 w-full max-w-5xl mx-auto rounded-md"
        style={{ cursor: "grab" }}
        animate={idleFloat}
        whileDrag={{ y: 0, transition: { duration: 0 } }}
        whileTap={{ cursor: "grabbing" }}
        drag
        dragDirectionLock
        dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
        dragTransition={{ timeConstant: 200, power: 0.3 }}
        dragElastic={0.15}
      />
    </section>
  );
}
