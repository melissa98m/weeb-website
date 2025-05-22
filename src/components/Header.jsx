import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { useTheme } from "../context/ThemeContext";
import Button from "./Button";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isContactPage = location.pathname === "/contact";
  const isLoginPage = location.pathname === "/login";

  return (
    <header
      className={`shadow-md fixed md:top-6 translate-x-[-50%] left-[50%] md:rounded-t-xl rounded-b-xl md:w-[95%] max-w-5xl z-1 w-full ${
        theme === "dark" ? "bg-dark" : "bg-gray-100"
      }`}
    >
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div
            className={` font-bold text-lg tracking-wide ${
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
            {isContactPage ? (
              <span>Contact</span>
            ) : isLoginPage ? (
              <span>Login</span>
            ) : (
              <>
                <Link
                  to="/about-us"
                  className={`transition ${
                    theme === "dark" ? "text-white" : "text-dark"
                  }`}
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  className={`transition ${
                    theme === "dark" ? "text-white" : "text-dark"
                  }`}
                >
                  Contact
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Desktop buttons */}
        <div className="hidden md:flex space-x-4">
          <Button
            onClick={toggleTheme}
            aria-label="Changer de thème"
            className="text-2xl focus:outline-none"
            title="Changer de thème"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </Button>

          {isContactPage ? (
            <>
              <Button
                to="/login"
                className={`text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition ${
                  theme === "dark"
                    ? "text-white bg-secondary"
                    : "text-dark bg-primary"
                }`}
              >
                Se connecter
              </Button>
            </>
          ) : isLoginPage ? (
            <>
              <Link
                to="/contact"
                className={`text-sm transition py-2 ${
                  theme === "dark"
                    ? "text-white/80 hover:text-white"
                    : "text-dark/80 hover:text-dark"
                }`}
              >
                Contact
              </Link>

              <Button
                to="/registration"
                className={`text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition ${
                  theme === "dark"
                    ? "text-white bg-secondary"
                    : "text-dark bg-primary"
                }`}
              >
                Créer un compte
              </Button>
            </>
          ) : (
            <>
              <Button
                to="/login"
                className={`text-sm transition py-2 ${
                  theme === "dark"
                    ? "text-white/80 hover:text-white"
                    : "text-dark/80 hover:text-dark"
                }`}
              >
                Log In
              </Button>
              <Button
                to="/registration"
                className={`text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition ${
                  theme === "dark"
                    ? "text-white bg-secondary"
                    : "text-dark bg-primary"
                }`}
              >
                Créer un compte
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          className={`md:hidden px-2 py-2 rounded-xl ${
            theme === "dark"
              ? "bg-secondary text-white"
              : "bg-primary text-dark"
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
          {isContactPage ? (
            <>
              <span
                className={`block ${
                  theme === "dark" ? "text-white" : "text-dark"
                }`}
              >
                Contact
              </span>
              <Button
                to="/login"
                className={`w-full text-sm px-4 py-2 rounded-md shadow ${
                  theme === "dark"
                    ? "bg-secondary text-white"
                    : "text-dark bg-primary"
                }`}
              >
                Se connecter
              </Button>
            </>
          ) : isLoginPage ? (
            <>
              <span className="block font-semibold">Login</span>
              <Link to="/contact" className="block">
                Contact
              </Link>
              <Button
                to="/registration"
                className={`w-full text-sm px-4 py-2 rounded-md shadow ${
                  theme === "dark"
                    ? "bg-secondary text-white"
                    : "text-dark bg-primary"
                }`}
              >
                Créer un compte
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/about-us"
                className={`block ${
                  theme === "dark" ? "text-white" : "text-dark"
                }`}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className={`block ${
                  theme === "dark" ? "text-white" : "text-dark"
                }`}
              >
                Contact
              </Link>
              <Button
                to="/login"
                className={`w-full text-sm px-4 py-2 rounded-md shadow ${
                  theme === "dark" ? " text-white" : "text-dark"
                }`}
              >
                Se connecter
              </Button>
              <Button
                to="/registration"
                className={`w-full text-sm px-4 py-2 rounded-md shadow ${
                  theme === "dark"
                    ? "bg-secondary text-white"
                    : "text-dark bg-primary"
                }`}
              >
                Créer un compte
              </Button>
            </>
          )}
          <Button
            onClick={toggleTheme}
            aria-label="Changer de thème"
            className="text-2xl focus:outline-none"
            title="Changer de thème"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </Button>
        </div>
      )}
    </header>
  );
}
