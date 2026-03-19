import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { API_BASE } from "../lib/api";

function ArticleCard({ article, theme }) {
  const muted = theme === "dark" ? "text-white/60" : "text-gray-500";
  const card = theme === "dark"
    ? "bg-[#1c1c1c] border-[#333] text-white hover:bg-[#222]"
    : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50";

  return (
    <Link
      to={`/blog/${article.id}`}
      className={`block rounded-xl border p-4 transition ${card}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-blue-500 mb-1">Article</p>
      <h3 className="font-semibold leading-snug mb-1">{article.title}</h3>
      {article.author && (
        <p className={`text-sm ${muted}`}>
          par {article.author.first_name || article.author.username}
        </p>
      )}
    </Link>
  );
}

function FormationCard({ formation, theme }) {
  const muted = theme === "dark" ? "text-white/60" : "text-gray-500";
  const card = theme === "dark"
    ? "bg-[#1c1c1c] border-[#333] text-white hover:bg-[#222]"
    : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50";

  return (
    <Link
      to="/formations"
      className={`block rounded-xl border p-4 transition ${card}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-500 mb-1">Formation</p>
      <h3 className="font-semibold leading-snug mb-1">{formation.name}</h3>
      {formation.description && (
        <p className={`text-sm line-clamp-2 ${muted}`}>{formation.description}</p>
      )}
    </Link>
  );
}

function Skeleton({ theme }) {
  const bg = theme === "dark" ? "bg-[#1c1c1c] border-[#333]" : "bg-white border-gray-200";
  return (
    <div className={`rounded-xl border p-4 animate-pulse ${bg}`}>
      <div className="h-3 w-16 bg-gray-300/20 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-300/20 rounded mb-1" />
      <div className="h-3 w-1/3 bg-gray-300/20 rounded" />
    </div>
  );
}

export default function SearchResults() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const q = useMemo(() => (searchParams.get("q") ?? "").trim(), [searchParams]);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // SEO : les pages de résultats de recherche ne doivent pas être indexées
  useEffect(() => {
    const prev = document.title;
    document.title = q ? `Résultats pour "${q}" | Weeb` : "Recherche | Weeb";
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.name = "robots";
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = "noindex, follow";
    return () => { document.title = prev; };
  }, [q]);

  const card = theme === "dark"
    ? "bg-[#262626] border-[#333] text-white"
    : "bg-white border-gray-200 text-gray-900";
  const muted = theme === "dark" ? "text-white/60" : "text-gray-500";

  useEffect(() => {
    if (q.length < 3) {
      setResults(null);
      return;
    }
    let alive = true;
    const ctrl = new AbortController();

    (async () => {
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
    })();

    return () => { alive = false; ctrl.abort(); };
  }, [q]);

  const totalResults = (results?.articles?.length ?? 0) + (results?.formations?.length ?? 0);

  return (
    <main className="min-h-[60vh] px-4 md:px-8 py-12 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          {q ? `Résultats pour « ${q} »` : "Recherche"}
        </h1>
        {results && !loading && (
          <p className={`text-sm ${muted}`}>
            {totalResults} résultat{totalResults !== 1 ? "s" : ""} trouvé{totalResults !== 1 ? "s" : ""}
          </p>
        )}
        {q.length > 0 && q.length < 3 && (
          <p className={`text-sm ${muted}`}>Saisir au moins 3 caractères.</p>
        )}
      </header>

      {error && (
        <p className="text-sm text-red-500 mb-6" role="alert">
          Erreur : {error}
        </p>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} theme={theme} />)}
        </div>
      )}

      {results && !loading && totalResults === 0 && (
        <div className={`rounded-2xl border p-8 text-center ${card}`}>
          <p className="text-lg font-medium mb-2">Aucun résultat</p>
          <p className={`text-sm ${muted}`}>
            Essaie avec d'autres mots-clés ou consulte directement le{" "}
            <Link to="/blog" className="text-blue-500 underline">blog</Link> et les{" "}
            <Link to="/formations" className="text-blue-500 underline">formations</Link>.
          </p>
        </div>
      )}

      {results && !loading && totalResults > 0 && (
        <div className="space-y-8">
          {/* Articles */}
          {results.articles.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide opacity-50 mb-3">
                Articles ({results.articles.length})
              </h2>
              <div className="space-y-3">
                {results.articles.map((a) => (
                  <ArticleCard key={a.id} article={a} theme={theme} />
                ))}
              </div>
            </section>
          )}

          {/* Formations */}
          {results.formations.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide opacity-50 mb-3">
                Formations ({results.formations.length})
              </h2>
              <div className="space-y-3">
                {results.formations.map((f) => (
                  <FormationCard key={f.id} formation={f} theme={theme} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
