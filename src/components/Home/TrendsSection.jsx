import { useTheme } from "../../context/ThemeContext";
import homeEn from "../../../locales/en/home.json";
import homeFr from "../../../locales/fr/home.json";
import { useLanguage } from "../../context/LanguageContext";
import { Link } from "react-router-dom";

export default function TrendsSection() {
  const { theme } = useTheme();
  const { language } = useLanguage();

  return (
    <section className="px-6 py-20 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10">
      <div className="w-full max-w-xs flex justify-center">
        <img
          src="/home/Shapes.svg"
          alt="Visuel geometrique"
          className="w-60 h-60 animate-spin"
        />
      </div>
      <div className="lg:w-1/2 text-center lg:text-left">
        <h3 className="text-sm uppercase mb-2">
          {language === "fr" ? homeFr.home_title_8 : homeEn.home_title_8}
        </h3>
        <h2 className="text-6xl font-bold">
          {language === "fr" ? homeFr.home_title_9 : homeEn.home_title_9}{" "}
          <span
            className={`${
              theme === "dark" ? "text-primary" : "text-secondary"
            }`}
          >
            {language === "fr" ? homeFr.home_title_10 : homeEn.home_title_10}
          </span>
        </h2>
        <p className="mt-4 ">
          {language === "fr" ? homeFr.last_articles : homeEn.last_articles}
        </p>
        <Link to="/articles" className="mt-6 hover:underline">
          {language === "fr" ? homeFr.link_3 : homeEn.link_3}
        </Link>
      </div>
    </section>
  );
}
