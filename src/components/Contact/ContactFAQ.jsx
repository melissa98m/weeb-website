import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import faqEn from "../../../locales/en/faq.json";
import faqFr from "../../../locales/fr/faq.json";

export default function ContactFAQ() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? faqFr : faqEn;
  const isDark = theme === "dark";

  const [openItems, setOpenItems] = useState(new Set());

  const toggle = (key) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const card = isDark ? "bg-surface border-border" : "bg-white border-gray-200";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const accent = isDark ? "text-primary" : "text-secondary";
  const divider = isDark ? "border-border" : "border-gray-100";

  return (
    <section className="px-4 sm:px-6 pb-12 max-w-3xl mx-auto w-full" aria-labelledby="faq-heading">
      {/* Header */}
      <div className="text-center mb-10">
        <h2
          id="faq-heading"
          className={`font-display text-2xl md:text-3xl font-bold ${
            isDark ? "text-white" : "text-dark"
          }`}
        >
          {t.faq_title}
        </h2>
        <p className={`mt-2 text-sm ${muted}`}>{t.faq_subtitle}</p>
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {t.faq_categories.map((cat, ci) => (
          <div key={ci}>
            <h3
              className={`text-xs font-semibold uppercase tracking-widest mb-3 ${muted}`}
            >
              {cat.category}
            </h3>
            <div className={`rounded-xl border overflow-hidden ${card}`}>
              {cat.items.map((item, ii) => {
                const key = `${ci}-${ii}`;
                const isOpen = openItems.has(key);
                return (
                  <div
                    key={ii}
                    className={ii > 0 ? `border-t ${divider}` : ""}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      aria-expanded={isOpen}
                      className={`w-full text-left px-5 py-4 flex items-center justify-between gap-4 text-sm font-medium transition-colors duration-150 ${
                        isDark
                          ? "text-white hover:bg-white/5"
                          : "text-dark hover:bg-gray-50"
                      }`}
                    >
                      <span>{item.q}</span>
                      <span
                        className={`shrink-0 text-xl leading-none font-light transition-transform duration-300 ${accent} ${
                          isOpen ? "rotate-45" : ""
                        }`}
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <p
                        className={`px-5 pb-5 pt-1 text-sm leading-relaxed ${muted}`}
                      >
                        {item.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* CTA vers le formulaire */}
      <div className={`mt-10 rounded-xl border p-6 text-center ${card}`}>
        <p className={`text-sm ${muted}`}>{t.faq_not_found}</p>
        <a
          href="#contact-form"
          className={`inline-block mt-3 text-sm font-medium underline underline-offset-4 transition-opacity duration-150 hover:opacity-75 ${accent}`}
        >
          {t.faq_cta}
        </a>
      </div>
    </section>
  );
}
