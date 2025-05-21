import { useState } from "react";
import { useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { useTheme } from "../context/ThemeContext";


export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
 const { theme, toggleTheme } = useTheme();

  const isContactPage = location.pathname === "/contact";
  const isLoginPage = location.pathname === "/login";

  return (
    <header className={`shadow-md rounded-xl max-w-5xl mx-auto my-4 ${theme === 'dark' ? 'bg-dark' : 'bg-gray-100'}`}>
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className={` font-bold text-lg tracking-wide ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>
            <a href="/">weeb</a>
          </div>
          {/* Desktop navigation */}
          <nav className={`hidden md:flex items-center space-x-6 text-sm ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>
            {isContactPage ? (
              <span>Contact</span>
            ) : isLoginPage ? (
              <span>Login</span>
            ) : (
              <>
                <a href="/about-us" className={`transition ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>
                  About Us
                </a>
                <a href="/contact" className={`transition ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>
                  Contact
                </a>
              </>
            )}
          </nav>
        </div>

        {/* Desktop buttons */}
        <div className="hidden md:flex space-x-4">
           <button
          onClick={toggleTheme}
          className="text-2xl focus:outline-none"
          title="Changer de thème"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
          {isContactPage ? (
            <a href="/login">
              <button className={`text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition ${theme === 'dark' ? 'text-white bg-secondary' : 'text-dark bg-primary'}`}>
                Se connecter
              </button>
            </a>
          ) : isLoginPage ? (
            
          <>
           <a href="/contact" className={`text-sm transition py-2 ${theme === 'dark' ? 'text-white/80 hover:text-white' : 'text-dark/80 hover:text-dark'}`}>
                Contact
              </a>
            <a href="/registration">
              <button className={`text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition ${theme === 'dark' ? 'text-white bg-secondary' : 'text-dark bg-primary'}`}>
                Join Now
              </button>
            </a>
            </>
          ) : (
            <>
              <a href="/login">
                <button className={`text-sm transition py-2 ${theme === 'dark' ? 'text-white/80 hover:text-white' : 'text-dark/80 hover:text-dark'}`}>
                  Log In
                </button>
              </a>
              <a href="/registration">
                <button className={`text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition ${theme === 'dark' ? 'bg-secondary text-white' : 'bg-primary text-dark'}`}>
                  Join Now
                </button>
              </a>
            </>
          )}
        </div>

        {/* Mobile toggle button */}
        <button
          className={`md:hidden px-2 py-2 rounded-xl ${theme === 'dark' ? 'bg-secondary text-white' : 'bg-primary text-dark'}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className={`md:hidden px-6 pb-4 space-y-4 text-sm ${theme === 'dark' ?  'text-white/90' : 'text-dark/90'}`}>
          {isContactPage ? (
            <>
              <span className={`block ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>Contact</span>
              <a href="/login">
                <button className={`block w-full my-4 ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>Se connecter</button>
              </a>
            </>
          ) : isLoginPage ? (
            <>
              <span className="block font-semibold">Login</span>
               <a href="/contact" className="block">
                Contact
              </a>
              <a href="/registration">
                <button className={`w-full text-sm px-4 py-2 rounded-md shadow ${theme === 'dark' ?  'bg-secondary text-white' : 'text-dark bg-primary'}`}>
                  Join Now
                </button>
              </a>
            </>
          ) : isLoginPage ? (
            <>
              <span className="block">Login</span>
              <a
                href="/contact"
                className={`block text-sm px-4 py-2 rounded-md shadow ${theme === 'dark' ? 'text-white' : 'text-dark'}`}
              >
                Contact
              </a>
              <a href="/registration">
                <button className={`w-full text-sm px-4 py-2 rounded-md shadow ${theme === 'dark' ?  'bg-secondary text-white' : 'text-dark bg-primary'}`}>
                  Join Now
                </button>
              </a>
            </>
          ) : (
            <>
              <a href="/about-us" className="block">
                About Us
              </a>
              <a href="/contact" className="block">
                Contact
              </a>
              <a href="/login">
                <button className="block w-full my-4">Log In</button>
              </a>
              <a href="/registration">
                <button className={`w-full text-sm px-4 py-2 rounded-md shadow ${theme === 'dark' ?  'bg-secondary text-white' : 'text-dark bg-primary'}`}>
                  Join Now
                </button>
              </a>
            </>
          )}
           <button
          onClick={toggleTheme}
          className="text-2xl focus:outline-none"
          title="Changer de thème"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        </div>
      )}
    </header>
  );
}
