import { useState, useEffect, useMemo, useCallback } from "react";
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
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function LegalPage({ content }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showBackTop, setShowBackTop] = useState(false);
  const [activeId, setActiveId] = useState("");

  // Compute section IDs once — used in TOC, sections, and observer
  const sectionIds = useMemo(
    () => content.sections.map((s) => sectionId(s.title)),
    [content]
  );

  // Throttle scroll with rAF — at most 1 state update per frame
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

  // ── Theme tokens ──────────────────────────────────────
  const bg       = isDark ? "bg-background text-white"   : "bg-light text-gray-900";
  const card     = isDark ? "bg-surface border-border"   : "bg-white border-gray-200";
  const muted    = isDark ? "text-slate-400"             : "text-slate-500";
  const accent   = isDark ? "text-primary"               : "text-secondary";
  const divider  = isDark ? "border-border"              : "border-gray-100";
  const badgeCls = isDark ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary";
  const dotCls   = isDark ? "bg-primary/40"              : "bg-secondary/30";
  const floatBtn = isDark
    ? "bg-surface border border-border text-primary hover:bg-surface-raised shadow-lg shadow-black/30"
    : "bg-white border border-gray-200 text-secondary hover:bg-gray-50 shadow-md";

  const tocLink = (isActive) =>
    isActive
      ? `text-sm py-1 pl-3 block border-l-2 font-medium transition-all duration-200 ${isDark ? "text-primary border-primary" : "text-secondary border-secondary"}`
      : `text-sm py-1 pl-3 block border-l-2 border-transparent transition-all duration-200 ${isDark ? "text-slate-400 hover:text-slate-200 hover:border-slate-600" : "text-slate-500 hover:text-slate-700 hover:border-gray-300"}`;

  // Respect prefers-reduced-motion for scroll animation
  const scrollToTop = useCallback(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, []);

  return (
    <div className={`min-h-screen ${bg}`}>

      {/* ── Header ──────────────────────────────────────── */}
      <header className="px-6 pt-10 pb-8 max-w-6xl mx-auto">
        <div className={`rounded-2xl border p-8 md:p-12 text-center ${card}`}>
          <span className={`text-xs font-medium uppercase tracking-[0.18em] ${muted}`}>
            {content.updated}
          </span>
          <h1 className={`font-display text-4xl md:text-5xl font-bold mt-3 leading-tight ${accent}`}>
            {content.title}
          </h1>
          <p className={`mt-5 text-base md:text-lg leading-relaxed max-w-2xl mx-auto ${muted}`}>
            {content.intro}
          </p>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="lg:grid lg:grid-cols-[210px_1fr] lg:gap-14 lg:items-start">

          {/* Sticky TOC — desktop */}
          <aside className="hidden lg:block" aria-label={content.tocLabel}>
            <nav className="sticky top-8">
              <p className={`text-xs uppercase tracking-widest mb-4 ${muted}`}>
                {content.tocLabel}
              </p>
              <ol className="space-y-0.5">
                {content.sections.map((s, i) => (
                  <li key={sectionIds[i]}>
                    <a href={`#${sectionIds[i]}`} className={tocLink(activeId === sectionIds[i])}>
                      <span className="mr-1.5 tabular-nums">{i + 1}.</span>
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
            <details className={`lg:hidden mb-6 rounded-xl border ${card}`}>
              <summary
                className={`px-5 py-4 text-sm font-semibold cursor-pointer select-none list-none flex items-center justify-between ${accent}`}
              >
                {content.tocLabel}
                <span className="text-xs opacity-60">▾</span>
              </summary>
              <ol className={`px-5 pb-4 pt-1 space-y-2.5 border-t ${divider}`}>
                {content.sections.map((s, i) => (
                  <li key={sectionIds[i]}>
                    <a
                      href={`#${sectionIds[i]}`}
                      className={`text-sm transition-colors duration-150 ${isDark ? "text-slate-300 hover:text-primary" : "text-slate-600 hover:text-secondary"}`}
                    >
                      <span className="mr-1 tabular-nums">{i + 1}.</span>
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
                  className={`rounded-xl border p-6 md:p-8 scroll-mt-8 ${card}`}
                >
                  <h2 className="flex items-center gap-3 mb-5">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${badgeCls}`}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className={`font-display text-lg font-semibold ${accent}`}>
                      {section.title}
                    </span>
                  </h2>

                  {section.type === "paragraphs" ? (
                    <div className={`space-y-3.5 ${muted}`}>
                      {section.items.map((item, j) => (
                        <p key={j} className="text-sm leading-relaxed">
                          {renderText(item)}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <ul className={`space-y-2.5 ${muted}`} role="list">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed">
                          <span
                            className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`}
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

      {/* ── Floating back to top ─────────────────────────── */}
      <button
        onClick={scrollToTop}
        aria-label={content.backToTop}
        title={content.backToTop}
        className={`fixed bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium z-50 transition-all duration-300 ${floatBtn} ${
          showBackTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        ↑
      </button>
    </div>
  );
}
