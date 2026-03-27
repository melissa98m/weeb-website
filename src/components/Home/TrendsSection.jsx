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
          width={240}
          height={240}
          loading="lazy"
          className="w-60 h-60 motion-safe:animate-spin"
        />
      </div>
      <div className="lg:w-1/2 text-center lg:text-left">
        <p className={`text-sm uppercase tracking-widest mb-2 font-medium ${
          theme === "dark" ? "text-primary" : "text-secondary"
        }`}>
          {language === "fr" ? homeFr.home_title_8 : homeEn.home_title_8}
        </p>
        <h2 className="text-5xl md:text-6xl font-bold">
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
        <Link to="/blog" className="mt-6 hover:underline">
          {language === "fr" ? homeFr.link_3 : homeEn.link_3}
        </Link>
      </div>
    </section>
  );
}
