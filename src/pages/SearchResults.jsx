import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { API_BASE } from "../lib/api";
import searchEn from "../../locales/en/search.json";
import searchFr from "../../locales/fr/search.json";

// ── Sub-components ────────────────────────────────────────────────────────────

function ArticleCard({ article, theme, t }) {
  const isDark = theme === "dark";
  const authorName = article.author?.first_name || article.author?.username;

  return (
    <Link
      to={`/blog/${article.id}`}
      className={`group flex flex-col justify-between rounded-2xl border p-5 transition-colors min-h-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isDark
          ? "bg-surface border-border hover:border-primary/40 text-white"
          : "bg-white border-gray-200 hover:border-secondary/40 text-dark shadow-sm"
      }`}
    >
      <div>
        {/* Type tag */}
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-purple-400 mb-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" aria-hidden="true" />
          {t.tag_article}
        </span>

        <h3
          className={`font-display font-semibold leading-snug text-sm mb-1.5 group-hover:text-primary transition-colors ${
            isDark ? "text-white" : "text-dark"
          }`}
        >
          {article.title}
        </h3>

        {authorName && (
          <p className={`text-xs ${isDark ? "text-white/65" : "text-dark/45"}`}>
            {t.by_author.replace("{author}", authorName)}
          </p>
        )}
      </div>

      {/* Arrow */}
      <div className="flex justify-end mt-4">
        <svg
          className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
            isDark ? "text-white/60" : "text-dark/25"
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

function FormationCard({ formation, theme, t }) {
  const isDark = theme === "dark";

  return (
    <Link
      to="/formations"
      className={`group flex flex-col justify-between rounded-2xl border p-5 transition-colors min-h-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isDark
          ? "bg-surface border-border hover:border-emerald-500/30 text-white"
          : "bg-white border-gray-200 hover:border-emerald-500/30 text-dark shadow-sm"
      }`}
    >
      <div>
        {/* Type tag */}
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-emerald-400 mb-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
          {t.tag_formation}
        </span>

        <h3
          className={`font-display font-semibold leading-snug text-sm mb-1.5 group-hover:text-emerald-400 transition-colors ${
            isDark ? "text-white" : "text-dark"
          }`}
        >
          {formation.name}
        </h3>

        {formation.description && (
          <p className={`text-xs line-clamp-2 ${isDark ? "text-white/65" : "text-dark/45"}`}>
            {formation.description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <div className="flex justify-end mt-4">
        <svg
          className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
            isDark ? "text-white/60" : "text-dark/25"
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

// animate-pulse required by test: document.querySelectorAll(".animate-pulse").length > 0
function Skeleton({ theme }) {
  const isDark = theme === "dark";
  return (
    <div
      className={`rounded-2xl border p-5 animate-pulse min-h-[120px] ${
        isDark ? "bg-surface border-border" : "bg-white border-gray-200"
      }`}
    >
      <div className="h-2.5 w-12 bg-gray-300/20 rounded-full mb-3" />
      <div className="h-4 w-3/4 bg-gray-300/20 rounded mb-2" />
      <div className="h-3 w-1/2 bg-gray-300/20 rounded mb-1" />
      <div className="h-3 w-2/5 bg-gray-300/15 rounded" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SearchResults() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? searchFr : searchEn;
  const [searchParams] = useSearchParams();
  const q = useMemo(() => (searchParams.get("q") ?? "").trim(), [searchParams]);
  const isDark = theme === "dark";

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // SEO: search pages are never indexed
  useEffect(() => {
    const prev = document.title;
    document.title = q ? t.page_title_query.replace("{q}", q) : t.page_title_empty;
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.name = "robots";
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = "noindex, follow";
    return () => { document.title = prev; };
  }, [q]);

  useEffect(() => {
    if (q.length < 3) {
      setResults(null);
      return;
    }
    let alive = true;
    const ctrl = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/search/?q=${encodeURIComponent(q)}`, {
          credentials: "include",
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (alive) setResults(data);
      } catch (e) {
        if (alive && e.name !== "AbortError") setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    }, 300);

    return () => { alive = false; ctrl.abort(); clearTimeout(timer); };
  }, [q]);

  const totalResults = (results?.articles?.length ?? 0) + (results?.formations?.length ?? 0);

  return (
    <main className="min-h-screen px-6 pt-28 pb-20 max-w-4xl mx-auto">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <header className="mb-12">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 -z-10 w-[600px] h-[300px]"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(192,132,252,0.07), transparent 70%)"
              : "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(147,51,234,0.04), transparent 70%)",
          }}
        />

        {/* h1 — test: getByRole("heading", {level:1}) must contain query or "Recherche" */}
        <h1
          className={`font-display font-extrabold tracking-tight leading-tight ${
            isDark ? "text-white" : "text-dark"
          }`}
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
        >
          {q ? t.heading_query.replace("{q}", q) : t.heading_empty}
        </h1>

        {/* Results count — test: getByText(/2 résultats trouvés/i) */}
        {results && !loading && (
          <p className={`mt-3 text-sm tabular-nums ${isDark ? "text-white/70" : "text-dark/50"}`}>
            {totalResults}{" "}
            {totalResults !== 1 ? t.results_count_many : t.results_count_one}
          </p>
        )}

        {/* Min chars hint — test: getByText(/saisir au moins 3 caractères/i) */}
        {q.length > 0 && q.length < 3 && (
          <p className={`mt-3 text-sm ${isDark ? "text-white/70" : "text-dark/50"}`}>
            {t.min_chars}
          </p>
        )}
      </header>

      {/* ── Error — test: getByRole("alert") ─────────────────────────── */}
      {error && (
        <div
          role="alert"
          className={`mb-8 flex items-start gap-3 rounded-xl border p-4 text-sm ${
            isDark
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          <svg
            className="w-4 h-4 shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {t.error.replace("{message}", error)}
        </div>
      )}

      {/* ── Loading skeletons — test: .animate-pulse count > 0 ─────────── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} theme={theme} />)}
        </div>
      )}

      {/* ── Empty state — test: getByText(/aucun résultat/i) ────────────── */}
      {results && !loading && totalResults === 0 && (
        <div
          className={`rounded-2xl border p-10 text-center ${
            isDark ? "bg-surface border-border" : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              isDark ? "bg-white/5" : "bg-gray-100"
            }`}
          >
            <svg
              className={`w-5 h-5 ${isDark ? "text-white/60" : "text-dark/30"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          {/* Title — test: getByText(/aucun résultat/i) */}
          <p
            className={`text-base font-semibold mb-1.5 ${
              isDark ? "text-white" : "text-dark"
            }`}
          >
            {t.no_results_title}
          </p>
          <p className={`text-sm mb-7 max-w-sm mx-auto ${isDark ? "text-white/70" : "text-dark/50"}`}>
            {t.no_results_body}
          </p>

          {/* Shortcut links */}
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/blog"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isDark
                  ? "bg-white/8 text-white/80 hover:bg-white/12"
                  : "bg-gray-100 text-dark/80 hover:bg-gray-200"
              }`}
            >
              Blog
            </Link>
            <Link
              to="/formations"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isDark
                  ? "bg-white/8 text-white/80 hover:bg-white/12"
                  : "bg-gray-100 text-dark/80 hover:bg-gray-200"
              }`}
            >
              {language === "fr" ? "Formations" : "Trainings"}
            </Link>
          </div>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {results && !loading && totalResults > 0 && (
        <div className="space-y-10">

          {/* Articles section */}
          {results.articles.length > 0 && (
            <section>
              <div className={`flex items-center gap-3 mb-5 pb-3 border-b ${isDark ? "border-border" : "border-gray-100"}`}>
                <h2 className={`text-[11px] uppercase tracking-[.15em] font-semibold ${isDark ? "text-white/60" : "text-dark/40"}`}>
                  {t.section_articles.replace("{count}", results.articles.length)}
                </h2>
                <span
                  className={`w-1.5 h-1.5 rounded-full bg-purple-400 ml-auto shrink-0`}
                  aria-hidden="true"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.articles.map((a) => (
                  <ArticleCard key={a.id} article={a} theme={theme} t={t} />
                ))}
              </div>
            </section>
          )}

          {/* Formations section */}
          {results.formations.length > 0 && (
            <section>
              <div className={`flex items-center gap-3 mb-5 pb-3 border-b ${isDark ? "border-border" : "border-gray-100"}`}>
                <h2 className={`text-[11px] uppercase tracking-[.15em] font-semibold ${isDark ? "text-white/60" : "text-dark/40"}`}>
                  {t.section_formations.replace("{count}", results.formations.length)}
                </h2>
                <span
                  className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ml-auto shrink-0`}
                  aria-hidden="true"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.formations.map((f) => (
                  <FormationCard key={f.id} formation={f} theme={theme} t={t} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
