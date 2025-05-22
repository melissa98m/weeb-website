import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import homeEn from "../../../locales/en/home.json";
import homeFr from "../../../locales/fr/home.json";
import { useLanguage } from "../../context/LanguageContext";
import { Link } from "react-router-dom";

export default function LearningSection() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  return (
    <section className="flex flex-col lg:flex-row items-center gap-10 px-6 py-20 max-w-6xl mx-auto text-left">
      <div className="lg:w-1/2">
        <h3
          className={`text-sm uppercase mb-2 ${
            theme === "dark" ? "text-white" : "text-dark"
          }`}
        >
          {language === "fr" ? homeFr.home_title_4 : homeEn.home_title_4}
        </h3>
        <h2 className="text-6xl font-bold">
          <span
            className={`${
              theme === "dark" ? "text-primary" : "text-secondary"
            }`}
          >
            {language === "fr" ? homeFr.home_title_5 : homeEn.home_title_5}
          </span>{" "}
          {language === "fr" ? homeFr.home_title_6 : homeEn.home_title_6}{" "}
          <span
            className={`${
              theme === "dark" ? "text-primary" : "text-secondary"
            }`}
          >
            {language === "fr" ? homeFr.home_title_7 : homeEn.home_title_7}
          </span>
        </h2>
        <p className="mt-4">
          {language === "fr" ? homeFr.learning : homeEn.learning}
        </p>
        <Link to="/articles" className="mt-6 hover:underline">
          {language === "fr" ? homeFr.link_2 : homeEn.link_2}
        </Link>
      </div>
      <motion.img
        src="/home/mokup.png"
        alt="Mockup 2"
        className="w-full max-w-md rounded-md"
        initial={{ x: 100, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: false }}
        transition={{ type: "spring", stiffness: 30, damping: 10, mass: 1 }}
      />
    </section>
  );
}
