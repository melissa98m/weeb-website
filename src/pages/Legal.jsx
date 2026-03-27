import { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import legalEn from "../../locales/en/legal.json";
import legalFr from "../../locales/fr/legal.json";
import { setCanonical, setOgMeta, setHreflang, SITE_URL } from "../lib/seo";

export default function Legal() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? legalFr : legalEn;

  useEffect(() => {
    const prev = document.title;
    const isFr = language === "fr";
    const title = isFr
      ? "Mentions légales | Weeb"
      : "Legal Notice | Weeb";
    const desc = isFr
      ? "Mentions légales du site Weeb : éditeur, hébergeur, propriété intellectuelle et conditions d'utilisation."
      : "Legal notice for Weeb: publisher, host, intellectual property and terms of use.";

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute("content", "index, follow");

    const cleanCanonical = setCanonical("/mentions-legales");
    const cleanHreflang = setHreflang("/mentions-legales");
    const cleanOgUrl = setOgMeta("og:url", `${SITE_URL}/mentions-legales`);
    const cleanOgTitle = setOgMeta("og:title", title);
    const cleanOgDesc = setOgMeta("og:description", desc);

    return () => {
      document.title = prev;
      cleanCanonical();
      cleanHreflang();
      cleanOgUrl();
      cleanOgTitle();
      cleanOgDesc();
    };
  }, [language]);

  const sectionClass = theme === "dark" ? "bg-background text-white" : "bg-light text-dark";
  const cardClass = theme === "dark" ? "bg-surface border-border" : "bg-white border-gray-200";
  const mutedTextClass = theme === "dark" ? "text-slate-300" : "text-slate-600";
  const titleAccentClass = theme === "dark" ? "text-primary" : "text-secondary";

  return (
    <div className={`min-h-screen ${sectionClass}`}>
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className={`rounded-2xl border p-6 md:p-10 shadow-lg ${cardClass}`}>
          <p className={`text-xs uppercase tracking-[0.2em] ${mutedTextClass}`}>{t.updated}</p>
          <h1 className={`text-3xl md:text-4xl font-bold mt-3 ${titleAccentClass}`}>{t.title}</h1>
          <p className={`mt-4 text-base md:text-lg ${mutedTextClass}`}>{t.intro}</p>
        </div>
      </section>

      <section className="px-6 pb-16 max-w-4xl mx-auto space-y-6">
        {t.sections.map((section) => (
          <div key={section.title} className={`rounded-xl border p-6 ${cardClass}`}>
            <h2 className={`text-xl font-semibold mb-3 ${titleAccentClass}`}>{section.title}</h2>
            <ul className={`list-disc ml-5 space-y-2 ${mutedTextClass}`}>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
