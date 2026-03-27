import contactEn from "../../../locales/en/contact.json";
import contactFr from "../../../locales/fr/contact.json";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

export default function ContactIntro() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = language === "fr" ? contactFr : contactEn;
  return (
    <section className="text-center px-4 sm:px-6 py-10 md:py-16 max-w-3xl mx-auto">
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase mb-4 px-3 py-1 rounded-full border ${
        theme === "dark"
          ? "text-primary border-primary/30 bg-primary/10"
          : "text-secondary border-secondary/25 bg-secondary/5"
      }`}>
        Contact
      </span>
      <h1 className={`text-3xl md:text-4xl font-bold mb-4 leading-tight ${theme === "dark" ? "text-white" : "text-dark"}`}>
        {t.contact_title}
      </h1>
      <p className={`text-sm md:text-base max-w-xl mx-auto leading-relaxed ${theme === "dark" ? "text-white/60" : "text-dark/60"}`}>
        {t.contact_intro}
      </p>
    </section>
  );
}
