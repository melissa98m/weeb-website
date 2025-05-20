import { useState } from "react";
import { useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isContactPage = location.pathname === "/contact";

  return (
    <header className="bg-dark shadow-md rounded-xl max-w-5xl mx-auto my-4">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="text-white font-bold text-lg tracking-wide"><a href="/">weeb</a></div>
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm text-white">
            {isContactPage ? (
              <span>Contact</span>
            ) : (
              <>
                <a href="/about-us" className="hover:text-white transition">
                  About Us
                </a>
                <a href="/contact" className="hover:text-white transition">
                  Contact
                </a>
              </>
            )}
          </nav>
        </div>

        {/* Desktop buttons */}
        <div className="hidden md:flex space-x-4">
          {isContactPage ? (
            <a href="/login">
              <button className="bg-secondary text-white text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition">
                Se connecter
              </button>
            </a>
          ) : (
            <>
              <a href="/login">
                <button className="text-sm text-white/80 hover:text-white transition py-2">
                  Log In
                </button>
              </a>
              <a href="/registration">
                <button className="bg-secondary text-white text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition">
                  Join Now
                </button>
              </a>
            </>
          )}
        </div>

        {/* Mobile toggle button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4 space-y-4 text-white/90 text-sm ">
          {isContactPage ? (
            <>
              <span className="block">Contact</span>
              <a href="/login">
                <button className="block w-full hover:text-white transition my-4">
                  Se connecter
                </button>
              </a>
            </>
          ) : (
            <>
              <a href="/about-us" className="block hover:text-white transition">
                About Us
              </a>
              <a href="/contact" className="block hover:text-white transition">
                Contact
              </a>
              <a href="/login">
                <button className="block w-full hover:text-white transition my-4">
                  Log In
                </button>
              </a>
              <a href="/registration">
                <button className="w-full bg-secondary text-white text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition">
                  Join Now
                </button>
              </a>
            </>
          )}
        </div>
      )}
    </header>
  );
}
