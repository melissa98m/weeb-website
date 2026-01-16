import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import privacyEn from "../../locales/en/privacy.json";
import privacyFr from "../../locales/fr/privacy.json";

export default function Privacy() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? privacyFr : privacyEn;

  const sectionClass = theme === "dark" ? "bg-background text-white" : "bg-light text-dark";
  const cardClass = theme === "dark" ? "bg-[#1c1c1c] border-[#333]" : "bg-white border-gray-200";
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
