import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function IconSearch({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
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
  );
}

/**
 * Barre de recherche globale — redirige vers /search?q=…
 * Place dans le Header entre la nav et les actions.
 */
export default function SearchBar() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const bg = theme === "dark"
    ? "bg-[#2a2a2a] text-white border-[#444] placeholder-white/40"
    : "bg-white text-gray-900 border-gray-300 placeholder-gray-400";

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      const q = query.trim();
      if (q.length < 3) return;
      setOpen(false);
      setQuery("");
      navigate(`/search?q=${encodeURIComponent(q)}`);
    },
    [query, navigate]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  // Focus automatique quand la barre s'ouvre
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Raccourci clavier Ctrl+K / Cmd+K pour ouvrir
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Rechercher (Ctrl+K)"
        aria-label="Ouvrir la recherche"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition
          ${theme === "dark"
            ? "border-[#444] text-white/70 hover:text-white hover:border-[#666] bg-[#2a2a2a]"
            : "border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 bg-white"
          }`}
      >
        <IconSearch size={14} />
        <span className="hidden lg:inline">Rechercher…</span>
        <kbd className={`hidden lg:inline text-xs px-1 rounded border font-mono
          ${theme === "dark" ? "border-[#555] text-white/50" : "border-gray-300 text-gray-400"}`}>
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} role="search" aria-label="Recherche globale">
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
          <IconSearch size={14} />
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (!query.trim()) setOpen(false); }}
          placeholder="Rechercher articles, formations…"
          aria-label="Terme de recherche"
          minLength={3}
          className={`pl-8 pr-3 py-1.5 rounded-lg border text-sm w-56 transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${bg}`}
          autoComplete="off"
        />
      </div>
    </form>
  );
}
