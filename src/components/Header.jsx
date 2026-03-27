import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import Button from "./Button";
import headerEn from "../../locales/en/header.json";
import headerFr from "../../locales/fr/header.json";
import { useAuth } from "../context/AuthContext";
import { hasAnyStaffRole, hasAnyRedactionRole, hasPersonnelRole } from "../utils/roles";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";


function IconSun({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function IconMoon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconMenu({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}

function IconX({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const t = (key, fallback) =>
    language === "fr" ? headerFr[key] || fallback : headerEn[key] || fallback;

  const isLoginPage = location.pathname === "/login";

  // Accès à l’administration si au moins un des rôles suivants
  const canAdmin =
    !!user && (hasAnyStaffRole(user) || hasAnyRedactionRole(user) || hasPersonnelRole(user));

  return (
    <header
      className={`shadow-md fixed md:top-6 translate-x-[-50%] left-[50%] md:rounded-xl md:w-[98%] z-10 w-full ${
        theme === "dark" ? "bg-dark" : "bg-gray-100"
      }`}
    >
      <div className="px-8 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div
            className={`font-bold text-lg tracking-wide ${
              theme === "dark" ? "text-white" : "text-dark"
            }`}
          >
            <Link to="/">weeb</Link>
          </div>

          {/* Desktop navigation */}
          <nav
            className={`hidden md:flex items-center space-x-6 text-sm ${
              theme === "dark" ? "text-white" : "text-dark"
            }`}
          >
            {[
              { to: "/about-us", label: t("about_us", "About us"), testid: "nav-about" },
              { to: "/blog", label: t("blog", "Blog"), testid: "nav-blog" },
              { to: "/formations", label: t("formations", "Formations"), testid: "nav-formations" },
              { to: "/contact", label: t("contact", "Contact"), testid: "nav-contact" },
              ...(canAdmin
                ? [{ to: "/admin", label: t("administration", "Administration"), testid: "nav-admin" }]
                : []),
            ].map(({ to, label, testid }) => {
              const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
              return (
                <Link
                  key={to}
                  to={to}
                  data-testid={testid}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "transition underline-offset-4",
                    active
                      ? theme === "dark"
                        ? "text-white font-medium underline"
                        : "text-dark font-medium underline"
                      : theme === "dark"
                      ? "text-white/90 hover:text-white"
                      : "text-dark/90 hover:text-dark",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop search */}
        <div className="hidden md:block">
          <SearchBar />
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button
            onClick={toggleTheme}
            aria-label={t("change_theme", "Change theme")}
            className={`p-1.5 rounded-md transition-colors ${
              theme === "dark"
                ? "text-amber-400 hover:text-amber-300"
                : "text-violet-500 hover:text-violet-700"
            }`}
            title={t("change_theme", "Change theme")}
          >
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </Button>

          <Button
            onClick={toggleLanguage}
            aria-label={t("change_language", "Change language")}
            className={`px-2 py-1 rounded text-xs font-semibold tracking-wider transition-colors ${
              theme === "dark"
                ? "bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 hover:text-violet-300"
                : "bg-violet-100 text-violet-600 hover:bg-violet-200 hover:text-violet-700"
            }`}
            title={t("change_language", "Change language")}
          >
            {language === "fr" ? "EN" : "FR"}
          </Button>

          {user ? (
            <>
              <NotificationBell theme={theme} />

              <Link
                to="/profile"
                title={t("profile", "Profile")}
                className={`text-sm underline-offset-4 hover:underline ${
                  theme === "dark" ? "text-white/90 hover:text-white" : "text-dark/90 hover:text-dark"
                }`}
              >
                {user.username || user.email}
              </Link>

              <Button
                onClick={onLogout}
                className={`text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition ${
                  theme === "dark" ? "text-white bg-secondary" : "text-dark bg-primary"
                }`}
              >
                {t("logout", "Logout")}
              </Button>
            </>
          ) : isLoginPage ? (
            <>
              <Link
                to="/contact"
                className={`text-sm transition py-2 ${
                  theme === "dark" ? "text-white/80 hover:text-white" : "text-dark/80 hover:text-dark"
                }`}
              >
                {t("contact", "Contact")}
              </Link>
              <Button
                to="/register"
                className={`text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition ${
                  theme === "dark" ? "text-white bg-secondary" : "text-dark bg-primary"
                }`}
              >
                {t("register", "Register")}
              </Button>
            </>
          ) : (
            <>
              <Button
                to="/login"
                className={`text-sm transition py-2 ${
                  theme === "dark" ? "text-white/80 hover:text-white" : "text-dark/80 hover:text-dark"
                }`}
              >
                {t("login", "Login")}
              </Button>
              <Button
                to="/register"
                className={`text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition ${
                  theme === "dark" ? "text-white bg-secondary" : "text-dark bg-primary"
                }`}
              >
                {t("register", "Register")}
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          className={`md:hidden px-2 py-2 rounded-xl ${
            theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
          }`}
        >
          {isOpen ? <IconX size={24} /> : <IconMenu size={24} />}
        </Button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          className={`md:hidden px-6 pb-4 space-y-4 text-sm ${
            theme === "dark" ? "text-white/90" : "text-dark/90"
          }`}
        >
          <Link to="/about-us" data-testid="nav-about" className={`block ${theme === "dark" ? "text-white" : "text-dark"}`} onClick={() => setIsOpen(false)}>
            {t("about_us", "About us")}
          </Link>

          <Link to="/blog" data-testid="nav-blog" className={`block ${theme === "dark" ? "text-white" : "text-dark"}`} onClick={() => setIsOpen(false)}>
            {t("blog", "Blog")}
          </Link>

          <Link to="/formations" data-testid="nav-formations" className={`block ${theme === "dark" ? "text-white" : "text-dark"}`} onClick={() => setIsOpen(false)}>
            {t("formations", "Formations")}
          </Link>

          <Link to="/contact" data-testid="nav-contact" className={`block ${theme === "dark" ? "text-white" : "text-dark"}`} onClick={() => setIsOpen(false)}>
            {t("contact", "Contact")}
          </Link>

          {/* Administration (mobile) */}
          {canAdmin && (
            <Link
              to="/admin"
              data-testid="nav-admin"
              className={`block ${theme === "dark" ? "text-white" : "text-dark"}`}
              onClick={() => setIsOpen(false)}
            >
              {t("administration", "Administration")}
            </Link>
          )}

          {user ? (
            <div className="pt-2 space-y-2">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={`block underline-offset-4 hover:underline ${
                  theme === "dark" ? "text-white/90 hover:text-white" : "text-dark/90 hover:text-dark"
                }`}
                title={t("profile", "Profile")}
              >
                {user.username || user.email}
              </Link>

              <Button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className={`w-full text-sm px-4 py-2 rounded-md shadow ${
                  theme === "dark" ? "bg-secondary text-white" : "text-dark bg-primary"
                }`}
              >
                {t("logout", "Logout")}
              </Button>
            </div>
          ) : isLoginPage ? (
            <>
              <Link to="/contact" className="block" onClick={() => setIsOpen(false)}>
                {t("contact", "Contact")}
              </Link>
              <Button
                to="/register"
                className={`w-full text-sm px-4 py-2 rounded-md shadow ${
                  theme === "dark" ? "bg-secondary text-white" : "text-dark bg-primary"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {t("register", "Register")}
              </Button>
            </>
          ) : (
            <>
              <Button
                to="/login"
                className={`w-full text-sm px-4 py-2 rounded-md shadow ${theme === "dark" ? " text-white" : "text-dark"}`}
                onClick={() => setIsOpen(false)}
              >
                {t("login", "Login")}
              </Button>
              <Button
                to="/register"
                className={`w-full text-sm px-4 py-2 rounded-md shadow ${
                  theme === "dark" ? "bg-secondary text-white" : "text-dark bg-primary"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {t("register", "Register")}
              </Button>
            </>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              aria-label={t("change_theme", "Change theme")}
              className={`p-1.5 rounded-md transition-colors ${
                theme === "dark"
                  ? "text-amber-400 hover:text-amber-300"
                  : "text-violet-500 hover:text-violet-700"
              }`}
              title={t("change_theme", "Change theme")}
            >
              {theme === "dark" ? <IconSun /> : <IconMoon />}
            </Button>
            <Button
              onClick={() => {
                toggleLanguage();
                setIsOpen(false);
              }}
              aria-label={t("change_language", "Change language")}
              className={`px-2 py-1 rounded text-xs font-semibold tracking-wider transition-colors ${
                theme === "dark"
                  ? "bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 hover:text-violet-300"
                  : "bg-violet-100 text-violet-600 hover:bg-violet-200 hover:text-violet-700"
              }`}
              title={t("change_language", "Change language")}
            >
              {language === "fr" ? "EN" : "FR"}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
