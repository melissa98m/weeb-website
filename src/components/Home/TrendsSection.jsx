import { useTheme } from "../../context/ThemeContext";
import homeEn from "../../../locales/en/home.json";
import homeFr from "../../../locales/fr/home.json";
import { useLanguage } from "../../context/LanguageContext";
import Button from "../Button";

export default function TrendsSection() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";

  return (
    <section className="px-6 py-20 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
      {/* Code snippet visual — left side */}
      <div className="w-full max-w-xs flex-shrink-0">
        <div
          className={`font-mono text-xs rounded-lg border p-5 leading-relaxed select-none ${
            isDark
              ? "bg-surface border-border text-white/45"
              : "bg-gray-50 border-gray-200 text-dark/45"
          }`}
          aria-hidden="true"
        >
          <div className={`mb-2 ${isDark ? "text-white/20" : "text-dark/20"}`}>
            {language === "fr" ? "// derniers articles" : "// latest articles"}
          </div>
          <div>const articles = await</div>
          <div className="pl-3">fetch("/api/articles/",</div>
          <div className="pl-3">{"{ cache: \"no-store\" }"}</div>
          <div>)</div>
          <div className="mt-3 mb-1 border-t border-current opacity-10" />
          <div className={isDark ? "text-white/20" : "text-dark/20"}>
            {language === "fr" ? "// résultats →" : "// results →"}
          </div>
          <div>articles.map(a =&gt; {"{"}</div>
          <div className="pl-3">render(&lt;Article {"{"}{"{"}...a{"}"}{"}"}  /&gt;)</div>
          <div>{"}"}</div>
        </div>
      </div>

      {/* Text content — right side */}
      <div className="lg:w-1/2 text-center lg:text-left">
        <span className="font-mono text-xs text-muted tracking-[.2em]">02</span>
        <p className="text-xs uppercase tracking-widest font-medium text-muted mt-2 mb-3">
          {language === "fr" ? homeFr.home_title_8 : homeEn.home_title_8}
        </p>
        <h2 className={`font-display font-extrabold tracking-tight text-3xl md:text-4xl leading-tight ${isDark ? "text-white" : "text-dark"}`}>
          {language === "fr" ? homeFr.home_title_9 : homeEn.home_title_9}{" "}
          <span className={isDark ? "text-primary" : "text-secondary"}>
            {language === "fr" ? homeFr.home_title_10 : homeEn.home_title_10}
          </span>
        </h2>
        <p className={`mt-4 leading-relaxed ${isDark ? "text-white/60" : "text-dark/60"}`}>
          {language === "fr" ? homeFr.last_articles : homeEn.last_articles}
        </p>
        <Button variant="text" isDark={isDark} to="/blog" className="mt-5">
          {language === "fr" ? homeFr.link_3 : homeEn.link_3}
        </Button>
      </div>
    </section>
  );
}
