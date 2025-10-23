import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import Button from "./Button";
import headerEn from "../../locales/en/header.json";
import headerFr from "../../locales/fr/header.json";
import { useAuth } from "../context/AuthContext";

/* ===== Helper rôles: Commercial OU Personnel (robuste) ===== */
const hasAnyStaffRole = (u) => {
  if (!u) return false;
  const toLower = (s) => String(s || "").toLowerCase();

  const collected = [];

  if (Array.isArray(u.groups)) {
    for (const g of u.groups) {
      if (g && typeof g === "object" && g.name) collected.push(g.name);
      else if (typeof g === "string") collected.push(g);
    }
  }
  if (Array.isArray(u.group_names)) collected.push(...u.group_names);
  if (Array.isArray(u.roles)) collected.push(...u.roles);
  if (u.role) collected.push(u.role);
  if (u.profile?.group?.name) collected.push(u.profile.group.name);

  const set = new Set(collected.map(toLower));
  const inCommercial = set.has("commercial");
  const inPersonnel = set.has("personnel");

  const flags = !!(u.is_commercial || u.is_personnel);
  const staffFallback = !!u.is_staff;

  return inCommercial || inPersonnel || flags || staffFallback;
};
/* =========================================================== */

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();

  const onLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
  };

  const t = (key, fallback) =>
    language === "fr" ? headerFr[key] || fallback : headerEn[key] || fallback;

  const isLoginPage = location.pathname === "/login";

  // => calcule ici le droit d'accès Feedback / Messages
  const canSeeCommercialPage = hasAnyStaffRole(user);

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

          {/* Desktop navigation — uniformisée sur toutes les pages */}
          <nav
            className={`hidden md:flex items-center space-x-6 text-sm ${
              theme === "dark" ? "text-white" : "text-dark"
            }`}
          >
            {[
              { to: "/about-us", label: t("about_us", "About us") },
              { to: "/blog", label: t("blog", "Blog") },
              { to: "/formations", label: t("formations", "Formations") },
              { to: "/contact", label: t("contact", "Contact") },
              ...(user && canSeeCommercialPage
                ? [
                    { to: "/feedbacks", label: t("feedback", "Feedback") },
                    { to: "/messages", label: t("message", "Message") },
                  ]
                : []),
            ].map(({ to, label }) => {
              const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "transition underline-offset-4",
                    active
                      ? (theme === "dark"
                          ? "text-white font-medium underline"
                          : "text-dark font-medium underline")
                      : (theme === "dark"
                          ? "text-white/90 hover:text-white"
                          : "text-dark/90 hover:text-dark"),
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
          {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </Button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          className={`md:hidden px-6 pb-4 space-y-4 text-sm ${
            theme === "dark" ? "text-white/90" : "text-dark/90"
          }`}
        >
          <Link to="/about-us" className={`block ${theme === "dark" ? "text-white" : "text-dark"}`} onClick={() => setIsOpen(false)}>
            {t("about_us", "About us")}
          </Link>

          <Link to="/blog" className={`block ${theme === "dark" ? "text-white" : "text-dark"}`} onClick={() => setIsOpen(false)}>
            {t("blog", "Blog")}
          </Link>

          <Link to="/formations" className={`block ${theme === "dark" ? "text-white" : "text-dark"}`} onClick={() => setIsOpen(false)}>
            {t("formations", "Formations")}
          </Link>

          <Link to="/contact" className={`block ${theme === "dark" ? "text-white" : "text-dark"}`} onClick={() => setIsOpen(false)}>
            {t("contact", "Contact")}
          </Link>

          {/* Lien Feedback mobile */}
          {user && canSeeCommercialPage && (
            <Link
              to="/feedbacks"
              className={`block ${theme === "dark" ? "text-white" : "text-dark"}`}
              onClick={() => setIsOpen(false)}
            >
              {t("feedback", "Feedback")}
            </Link>
          )}
          {user && canSeeCommercialPage && (
            <Link
              to="/messages"
              className={`block ${theme === "dark" ? "text-white" : "text-dark"}`}
              onClick={() => setIsOpen(false)}
            >
              {t("message", "Message")}
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
