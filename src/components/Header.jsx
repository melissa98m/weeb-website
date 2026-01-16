import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import Button from "./Button";
import headerEn from "../../locales/en/header.json";
import headerFr from "../../locales/fr/header.json";
import { useAuth } from "../context/AuthContext";
import { hasAnyStaffRole, hasAnyRedactionRole, hasPersonnelRole } from "../utils/roles";


function IconMenu({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}

function IconX({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      className={`shadow-md fixed md:top-6 translate-x-[-50%] left-[50%] md:rounded-t-xl rounded-b-xl md:w-[95%] max-w-5xl z-10 w-full ${
        theme === "dark" ? "bg-dark" : "bg-gray-100"
      }`}
    >
      <div className="px-6 py-4 flex items-center justify-between">
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

        {/* Desktop actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button
            onClick={toggleTheme}
            aria-label={t("change_theme", "Change theme")}
            className="text-2xl focus:outline-none"
            title={t("change_theme", "Change theme")}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </Button>

          <Button
            onClick={toggleLanguage}
            aria-label={t("change_language", "Change language")}
            className="text-2xl focus:outline-none"
            title={t("change_language", "Change language")}
          >
            {language === "fr" ? "​🇬🇧​​" : "​🇫🇷​"}
          </Button>

          {user ? (
            <>
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
              className="text-2xl focus:outline-none"
              title={t("change_theme", "Change theme")}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </Button>
            <Button
              onClick={() => {
                toggleLanguage();
                setIsOpen(false);
              }}
              aria-label={t("change_language", "Change language")}
              className="text-2xl focus:outline-none"
              title={t("change_language", "Change language")}
            >
              {language === "fr" ? "​🇬🇧​​" : "​🇫🇷​"}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
