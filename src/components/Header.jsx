import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import Button from "./Button";
import headerEn from "../../locales/en/header.json";
import headerFr from "../../locales/fr/header.json";
import { useAuth } from "../context/AuthContext";
import { hasAnyStaffRole, hasAnyRedactionRole, hasPersonnelRole } from "../utils/roles";
import NotificationBell from "./NotificationBell";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconSun({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function IconMoon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconMenu({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function IconX({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconSearch({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ─── Logo wordmark ─────────────────────────────────────────────────────────

function WeebLogo({ isDark }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-1.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
      aria-label="Weeb — accueil"
    >
      {/* Dot accent */}
      <span
        aria-hidden="true"
        className="w-2 h-2 rounded-full bg-primary flex-shrink-0 group-hover:scale-125 transition-transform duration-200"
        style={{ boxShadow: "0 0 8px rgba(192,132,252,0.6)" }}
      />
      <span
        className={`font-display font-extrabold text-lg tracking-tight ${
          isDark ? "text-white" : "text-dark"
        }`}
      >
        weeb
      </span>
    </Link>
  );
}

// ─── Search modal ──────────────────────────────────────────────────────────

function SearchModal({ isDark, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Trap Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      const q = query.trim();
      if (q.length < 2) return;
      onClose();
      navigate(`/search?q=${encodeURIComponent(q)}`);
    },
    [query, navigate, onClose]
  );

  const overlayVariants = prefersReducedMotion
    ? {}
    : { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };

  const panelVariants = prefersReducedMotion
    ? {}
    : { hidden: { opacity: 0, y: -12, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -8, scale: 0.98 } };

  return (
    <motion.div
      key="search-overlay"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Recherche globale"
    >
      {/* Blur backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: isDark ? "rgba(15,23,42,0.75)" : "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
      />

      <motion.div
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} role="search" aria-label="Recherche">
          <div
            className="flex items-center gap-3 px-4 rounded-xl border"
            style={{
              background: isDark ? "#1c1c1c" : "#ffffff",
              borderColor: isDark ? "#444" : "#e5e7eb",
              boxShadow: isDark
                ? "0 0 0 1px rgba(192,132,252,0.15), 0 24px 48px rgba(0,0,0,0.6)"
                : "0 24px 48px rgba(0,0,0,0.15)",
            }}
          >
            <IconSearch size={18} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher articles, formations…"
              aria-label="Terme de recherche"
              autoComplete="off"
              className={`flex-1 py-4 text-base bg-transparent outline-none ${
                isDark ? "text-white placeholder-white/40" : "text-gray-900 placeholder-gray-400"
              }`}
            />
            <kbd
              aria-label="Appuyer sur Échap pour fermer"
              className={`text-xs px-2 py-1 rounded border font-mono flex-shrink-0 ${
                isDark ? "border-border-2 text-white/40" : "border-gray-300 text-gray-400"
              }`}
            >
              Esc
            </kbd>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const prefersReducedMotion = useReducedMotion();

  // Detect scroll for header style transition
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const onLogout = async () => {
    try { await logout(); } catch (e) { console.error(e); }
    finally { navigate("/login", { replace: true }); }
  };

  const t = (key, fallback) =>
    language === "fr" ? headerFr[key] || fallback : headerEn[key] || fallback;

  const isLoginPage = location.pathname === "/login";

  const canAdmin =
    !!user && (hasAnyStaffRole(user) || hasAnyRedactionRole(user) || hasPersonnelRole(user));

  const navLinks = [
    { to: "/about-us", label: t("about_us", "About us"), testid: "nav-about" },
    { to: "/blog", label: t("blog", "Blog"), testid: "nav-blog" },
    { to: "/formations", label: t("formations", "Formations"), testid: "nav-formations" },
    { to: "/contact", label: t("contact", "Contact"), testid: "nav-contact" },
    ...(canAdmin
      ? [{ to: "/admin", label: t("administration", "Administration"), testid: "nav-admin" }]
      : []),
  ];

  // ── Header style: transparent → frosted on scroll ──────────────────────
  const headerStyle = scrolled
    ? {
        background: isDark ? "rgba(15,23,42,0.82)" : "rgba(242,242,242,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: isDark ? "rgba(51,51,51,0.8)" : "rgba(0,0,0,0.08)",
        boxShadow: isDark
          ? "0 1px 0 rgba(255,255,255,0.04)"
          : "0 1px 0 rgba(0,0,0,0.06)",
      }
    : {
        background: "transparent",
        backdropFilter: "none",
        borderColor: "transparent",
        boxShadow: "none",
      };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 border-b transition-all duration-300"
        style={headerStyle}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <WeebLogo isDark={isDark} />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 text-sm flex-1 ml-8" aria-label="Navigation principale">
            {navLinks.map(({ to, label, testid }) => {
              const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
              return (
                <Link
                  key={to}
                  to={to}
                  data-testid={testid}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    active
                      ? isDark ? "text-white" : "text-dark"
                      : isDark ? "text-white/55 hover:text-white hover:bg-white/5" : "text-dark/55 hover:text-dark hover:bg-dark/5",
                  ].join(" ")}
                >
                  {label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Ouvrir la recherche (Ctrl+K)"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors duration-150 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isDark
                  ? "border-border-2 text-white/50 hover:text-white hover:border-muted bg-surface-3/60"
                  : "border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 bg-white/60"
              }`}
            >
              <IconSearch size={14} />
              <span className="hidden lg:inline text-xs">Rechercher</span>
              <kbd className={`hidden lg:inline text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                isDark ? "border-border-2 text-white/30" : "border-gray-200 text-gray-300"
              }`}>
                ⌘K
              </kbd>
            </button>

            {/* Theme */}
            <button
              onClick={toggleTheme}
              aria-label={t("change_theme", "Change theme")}
              className={`p-2 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isDark ? "text-white/45 hover:text-white hover:bg-white/5" : "text-dark/45 hover:text-dark hover:bg-dark/5"
              }`}
            >
              {isDark ? <IconSun /> : <IconMoon />}
            </button>

            {/* Language */}
            <button
              onClick={toggleLanguage}
              aria-label={t("change_language", "Change language")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider min-h-[36px] border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isDark
                  ? "border-border-2 text-white/45 hover:text-white hover:border-border"
                  : "border-gray-200 text-dark/45 hover:text-dark hover:border-gray-300"
              }`}
            >
              {language === "fr" ? "EN" : "FR"}
            </button>

            {/* Separator */}
            <div aria-hidden="true" className={`w-px h-5 mx-1 ${isDark ? "bg-border" : "bg-gray-200"}`} />

            {user ? (
              <>
                <NotificationBell theme={theme} />
                <Link
                  to="/profile"
                  className={`text-sm px-2.5 py-1.5 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isDark ? "text-white/65 hover:text-white hover:bg-white/5" : "text-dark/65 hover:text-dark hover:bg-dark/5"
                  }`}
                >
                  {user.username || user.email}
                </Link>
                <Button variant="primary" size="md" onClick={onLogout}>
                  {t("logout", "Logout")}
                </Button>
              </>
            ) : isLoginPage ? (
              <>
                <Link
                  to="/contact"
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors duration-150 ${
                    isDark ? "text-white/55 hover:text-white hover:bg-white/5" : "text-dark/55 hover:text-dark hover:bg-dark/5"
                  }`}
                >
                  {t("contact", "Contact")}
                </Link>
                <Button variant="primary" size="md" to="/register">
                  {t("register", "Register")}
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors duration-150 ${
                    isDark ? "text-white/55 hover:text-white hover:bg-white/5" : "text-dark/55 hover:text-dark hover:bg-dark/5"
                  }`}
                >
                  {t("login", "Login")}
                </Link>
                <Button variant="primary" size="md" to="/register">
                  {t("register", "Register")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile: search icon + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Ouvrir la recherche"
              className={`p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isDark ? "text-white/55 hover:text-white hover:bg-white/5" : "text-dark/55 hover:text-dark hover:bg-dark/5"
              }`}
            >
              <IconSearch size={18} />
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              className={`p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isDark ? "text-white/55 hover:text-white hover:bg-white/5" : "text-dark/55 hover:text-dark hover:bg-dark/5"
              }`}
            >
              <IconMenu />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              id="mobile-drawer"
              key="drawer-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
              initial={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
              animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed top-0 right-0 bottom-0 z-50 w-[min(320px,90vw)] flex flex-col md:hidden ${
                isDark ? "bg-dark border-l border-border" : "bg-light border-l border-gray-200"
              }`}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-16 flex-shrink-0 border-b border-inherit">
                <WeebLogo isDark={isDark} />
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Fermer le menu"
                  className={`p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isDark ? "text-white/55 hover:text-white hover:bg-white/5" : "text-dark/55 hover:text-dark hover:bg-dark/5"
                  }`}
                >
                  <IconX />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigation mobile">
                {navLinks.map(({ to, label, testid }, idx) => {
                  const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
                  return (
                    <motion.div
                      key={to}
                      initial={prefersReducedMotion ? false : { opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.22, delay: idx * 0.04 }}
                    >
                      <Link
                        to={to}
                        data-testid={testid}
                        aria-current={active ? "page" : undefined}
                        className={[
                          "flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors duration-150 mb-0.5",
                          active
                            ? isDark
                              ? "text-white bg-white/6"
                              : "text-dark bg-dark/6"
                            : isDark
                            ? "text-white/60 hover:text-white hover:bg-white/5"
                            : "text-dark/60 hover:text-dark hover:bg-dark/5",
                        ].join(" ")}
                      >
                        {label}
                        {active && (
                          <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Auth + utilities pushed to bottom */}
              <div className={`flex-shrink-0 px-5 py-5 border-t ${isDark ? "border-border" : "border-gray-200"}`}>
                {user ? (
                  <div className="space-y-2 mb-4">
                    <Link
                      to="/profile"
                      className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isDark ? "text-white/70 hover:text-white hover:bg-white/5" : "text-dark/70 hover:text-dark hover:bg-dark/5"
                      }`}
                    >
                      {user.username || user.email}
                    </Link>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full justify-center"
                      onClick={onLogout}
                    >
                      {t("logout", "Logout")}
                    </Button>
                  </div>
                ) : isLoginPage ? (
                  <div className="space-y-2 mb-4">
                    <Link
                      to="/contact"
                      className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-dark/60 hover:text-dark hover:bg-dark/5"
                      }`}
                    >
                      {t("contact", "Contact")}
                    </Link>
                    <Button variant="primary" size="lg" to="/register" className="w-full justify-center">
                      {t("register", "Register")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    <Button variant="ghost" size="lg" isDark={isDark} to="/login" className="w-full justify-center">
                      {t("login", "Login")}
                    </Button>
                    <Button variant="primary" size="lg" to="/register" className="w-full justify-center">
                      {t("register", "Register")}
                    </Button>
                  </div>
                )}

                {/* Theme + language */}
                <div className={`flex items-center gap-2 pt-4 border-t ${isDark ? "border-border" : "border-gray-200"}`}>
                  <button
                    onClick={toggleTheme}
                    aria-label={t("change_theme", "Change theme")}
                    className={`p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isDark ? "text-white/50 hover:text-white hover:bg-white/5" : "text-dark/50 hover:text-dark hover:bg-dark/5"
                    }`}
                  >
                    {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
                  </button>
                  <button
                    onClick={toggleLanguage}
                    aria-label={t("change_language", "Change language")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold tracking-wider min-h-[44px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isDark
                        ? "border-border-2 text-white/50 hover:text-white hover:border-border"
                        : "border-gray-200 text-dark/50 hover:text-dark hover:border-gray-300"
                    }`}
                  >
                    {language === "fr" ? "EN" : "FR"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Search modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <SearchModal
            key="search-modal"
            isDark={isDark}
            onClose={() => setSearchOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
