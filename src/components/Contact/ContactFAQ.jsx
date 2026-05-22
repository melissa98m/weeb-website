import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

  const muted = isDark ? "text-white/50" : "text-dark/50";
  const accent = isDark ? "text-primary" : "text-secondary";
  const divider = isDark ? "border-border" : "border-gray-100";
  const cardBg = isDark ? "bg-surface border-border" : "bg-white border-gray-200";

  return (
    <section aria-labelledby="faq-heading" className="pb-12">
      {/* Section label */}
      <p
        className={`text-[11px] uppercase tracking-[.15em] font-semibold mb-3 ${
          isDark ? "text-primary/70" : "text-secondary/70"
        }`}
      >
        FAQ
      </p>

      <h2
        id="faq-heading"
        className={`font-display font-bold text-2xl md:text-3xl mb-2 ${
          isDark ? "text-white" : "text-dark"
        }`}
      >
        {t.faq_title}
      </h2>
      <p className={`text-sm mb-8 ${muted}`}>{t.faq_subtitle}</p>

      <div className="space-y-6">
        {t.faq_categories.map((cat, ci) => (
          <div key={ci}>
            <h3
              className={`text-[11px] uppercase tracking-[.15em] font-semibold mb-3 ${muted}`}
            >
              {cat.category}
            </h3>
            <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
              {cat.items.map((item, ii) => {
                const key = `${ci}-${ii}`;
                const isOpen = openItems.has(key);
                return (
                  <div key={ii} className={ii > 0 ? `border-t ${divider}` : ""}>
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      aria-expanded={isOpen}
                      className={`w-full text-left px-5 py-4 flex items-center justify-between gap-4 text-sm font-medium transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                        isDark
                          ? "text-white hover:bg-white/5"
                          : "text-dark hover:bg-gray-50"
                      }`}
                    >
                      <span>{item.q}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className={`shrink-0 text-xl leading-none font-light select-none ${accent}`}
                        aria-hidden="true"
                      >
                        +
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          style={{ overflow: "hidden" }}
                        >
                          <p className={`px-5 pb-5 pt-1 text-sm leading-relaxed ${muted}`}>
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* CTA to form */}
      <div className={`mt-8 rounded-xl border p-5 text-center ${cardBg}`}>
        <p className={`text-sm ${muted}`}>{t.faq_not_found}</p>
        <a
          href="#contact-form"
          className={`inline-block mt-3 text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded ${accent}`}
        >
          {t.faq_cta}
        </a>
      </div>
    </section>
  );
}
