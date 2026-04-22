import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const t = {
  fr: {
    title: "404",
    heading: "Page introuvable",
    description:
      "Oups ! La page que vous cherchez n'existe pas ou a été déplacée.",
    home: "Retour à l'accueil",
    blog: "Explorer le blog",
    meta: "Page introuvable — Weeb",
  },
  en: {
    title: "404",
    heading: "Page not found",
    description:
      "Oops! The page you're looking for doesn't exist or has been moved.",
    home: "Back to home",
    blog: "Explore the blog",
    meta: "Page not found — Weeb",
  },
};

export default function NotFound() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const copy = t[language] ?? t.fr;

  useEffect(() => {
    const prev = document.title;
    document.title = copy.meta;

    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute("content", "noindex, nofollow");

    return () => {
      document.title = prev;
    };
  }, [copy.meta]);

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 ${
        isDark ? "bg-background text-white" : "bg-light text-dark"
      }`}
    >
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg w-full"
      >
        {/* Chiffre 404 */}
        <motion.p
          aria-hidden="true"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-[9rem] sm:text-[12rem] font-extrabold leading-none select-none bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent"
        >
          {copy.title}
        </motion.p>

        {/* Titre */}
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold">
          {copy.heading}
        </h1>

        {/* Description */}
        <p
          className={`mt-4 text-base sm:text-lg leading-relaxed ${
            isDark ? "text-muted" : "text-gray-500"
          }`}
        >
          {copy.description}
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2 rounded-xl bg-primary text-white font-semibold transition-all duration-200 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15V15h-6v6.75H3.75A.75.75 0 013 21V9.75z"
              />
            </svg>
            {copy.home}
          </Link>

          <Link
            to="/blog"
            className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2 rounded-xl border font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              isDark
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-gray-300 text-dark hover:bg-gray-100"
            }`}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            {copy.blog}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
