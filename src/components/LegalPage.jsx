import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

function renderText(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = emailRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <a
        key={match.index}
        href={`mailto:${match[0]}`}
        className="underline underline-offset-2 hover:opacity-75 focus:ring-2 focus:ring-current focus:outline-none rounded transition-opacity duration-150"
      >
        {match[0]}
      </a>
    );
    lastIndex = emailRegex.lastIndex;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 1 ? parts : text;
}

function sectionId(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function LegalPage({ content }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showBackTop, setShowBackTop] = useState(false);
  const [activeId, setActiveId] = useState("");

  const sectionIds = useMemo(
    () => content.sections.map((s) => sectionId(s.title)),
    [content]
  );

  // Throttle scroll with rAF
  useEffect(() => {
    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setShowBackTop(window.scrollY > 320);
        rafId = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleIntersect = useCallback((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActiveId(entry.target.id);
    });
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "0px 0px -65% 0px",
      threshold: 0,
    });
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sectionIds, handleIntersect]);

  const scrollToTop = useCallback(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, []);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const pageBg    = isDark ? "bg-background text-white"   : "bg-light text-gray-900";
  const card      = isDark ? "bg-surface border-border"   : "bg-white border-gray-200";
  const divider   = isDark ? "border-border"              : "border-gray-100";
  const mutedText = isDark ? "text-slate-400"             : "text-slate-500";
  const itemText  = isDark ? "text-slate-300"             : "text-slate-600";
  const dotColor  = isDark ? "bg-primary/50"              : "bg-secondary/40";
  const floatBtn  = isDark
    ? "bg-surface border border-border text-primary hover:bg-surface-raised shadow-lg shadow-black/30"
    : "bg-white border border-gray-200 text-secondary hover:bg-gray-50 shadow-md";

  const tocItemClass = (isActive) =>
    [
      "text-sm py-1 pl-3 block border-l-2 transition-all duration-200",
      isActive
        ? isDark
          ? "text-primary border-primary font-medium"
          : "text-secondary border-secondary font-medium"
        : isDark
        ? "text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-600"
        : "text-slate-500 border-transparent hover:text-slate-700 hover:border-gray-300",
    ].join(" ");

  const accentText = isDark ? "text-primary" : "text-secondary";

  return (
    <div className={`min-h-screen ${pageBg}`}>

      {/* ── Gradient header ───────────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary">
        {/* Orbs */}
        <motion.div
          className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none"
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none"
          animate={{ y: [0, 16, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24 text-white text-center"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-white/60 mb-4 px-3 py-1 rounded-full border border-white/20 bg-white/5">
            {content.updated}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-5">
            {content.title}
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {content.intro}
          </p>
        </motion.div>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-12 pb-28">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-14 lg:items-start">

          {/* Sticky TOC — desktop */}
          <aside className="hidden lg:block" aria-label={content.tocLabel}>
            <nav className="sticky top-8">
              <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${mutedText}`}>
                {content.tocLabel}
              </p>
              <ol className="space-y-0.5">
                {content.sections.map((s, i) => (
                  <li key={sectionIds[i]}>
                    <a href={`#${sectionIds[i]}`} className={tocItemClass(activeId === sectionIds[i])}>
                      <span className={`mr-1.5 tabular-nums text-xs ${mutedText}`}>{i + 1}.</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Content */}
          <main>
            {/* Mobile TOC */}
            <details className={`lg:hidden mb-6 rounded-2xl border ${card}`}>
              <summary
                className={`px-5 py-4 text-sm font-semibold cursor-pointer select-none list-none flex items-center justify-between ${accentText}`}
              >
                {content.tocLabel}
                <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <ol className={`px-5 pb-5 pt-2 space-y-2.5 border-t ${divider}`}>
                {content.sections.map((s, i) => (
                  <li key={sectionIds[i]}>
                    <a
                      href={`#${sectionIds[i]}`}
                      className={`text-sm transition-colors duration-150 ${
                        isDark ? "text-slate-300 hover:text-primary" : "text-slate-600 hover:text-secondary"
                      }`}
                    >
                      <span className={`mr-1.5 tabular-nums text-xs ${mutedText}`}>{i + 1}.</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </details>

            {/* Sections */}
            <div className="space-y-4">
              {content.sections.map((section, i) => (
                <section
                  key={sectionIds[i]}
                  id={sectionIds[i]}
                  className={`rounded-2xl border p-6 md:p-8 scroll-mt-8 ${card}`}
                >
                  {/* Section heading */}
                  <h2 className="flex items-baseline gap-3 mb-5">
                    <span
                      className={`font-display text-xs font-bold tabular-nums shrink-0 ${
                        isDark ? "text-primary/50" : "text-secondary/50"
                      }`}
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`font-display text-lg font-semibold ${accentText}`}>
                      {section.title}
                    </span>
                  </h2>

                  {section.type === "paragraphs" ? (
                    <div className={`space-y-3.5 ${itemText}`}>
                      {section.items.map((item, j) => (
                        <p key={j} className="text-sm leading-relaxed">
                          {renderText(item)}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <ul className={`space-y-2.5 ${itemText}`} role="list">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed">
                          <span
                            className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`}
                            aria-hidden="true"
                          />
                          <span>{renderText(item)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* ── Floating back to top ──────────────────────────────────────────── */}
      <button
        onClick={scrollToTop}
        aria-label={content.backToTop}
        title={content.backToTop}
        className={[
          "fixed bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center",
          "text-sm font-medium z-50 transition-all duration-300",
          floatBtn,
          showBackTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none",
        ].join(" ")}
      >
        ↑
      </button>
    </div>
  );
}
