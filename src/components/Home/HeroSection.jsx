import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import homeEn from "../../../locales/en/home.json";
import homeFr from "../../../locales/fr/home.json";
import { useLanguage } from "../../context/LanguageContext";
import { Link } from "react-router-dom";

export default function HeroSection() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  return (
    <section className="px-6 py-16 text-center max-w-5xl mx-auto">
      <h1 className="text-7xl md:text-5xl font-bold leading-tight">
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
        className={`mt-4 max-w-2xl mx-auto ${
          theme === "dark" ? "text-white" : "text-dark"
        }`}
      >
        {language === "fr" ? homeFr.web_world : homeEn.web_world}
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/articles"
          className={`px-6 py-2 rounded-md shadow transition-transform transition-colors duration-200 ease-in-out transform hover:scale-110 focus:outline-none ${
            theme === "dark"
              ? "bg-secondary text-white hover:bg-secondary/70"
              : "bg-primary text-dark hover:bg-primary/70"
          }`}
        >
          {language === "fr" ? homeFr.link_1 : homeEn.link_1}
        </Link>
        <Link
          to="/newsletter"
          className={`border px-6 py-2 rounded-md transition-transform transition-colors duration-200 ease-in-out transform hover:scale-110 focus:outline-none ${
            theme === "dark" ? "border-white" : "border-dark"
          }`}
        >
          {language === "fr" ? homeFr.newsletter : homeEn.newsletter}
        </Link>
      </div>
      <motion.img
        src="/home/mokup.png"
        alt="Mockup"
        className="mt-12 w-full max-w-5xl mx-auto rounded-md"
        style={{
          cursor: "grab",
        }}
        drag
        dragDirectionLock
        dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        dragElastic={0.5}
        whileTap={{ cursor: "grabbing" }}
      />
    </section>
  );
}
