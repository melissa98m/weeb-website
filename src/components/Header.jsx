import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-dark shadow-md">
      <div className="max-w-2xl px-6 py-4 flex items-center justify-between rounded-3xl">
        {/* Logo */}
        <div className="text-white font-bold text-lg tracking-wide">weeb</div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm text-white">
          <a href="#" className="hover:text-white transition">About Us</a>
          <a href="#" className="hover:text-white transition">Contact</a>
        </nav>

        {/* Desktop buttons */}
        <div className="hidden md:flex space-x-4">
          <button className="text-sm text-white/80 hover:text-white transition">
            Log In
          </button>
          <button className="bg-secondary text-white text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition">
            Join Now
          </button>
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
        <div className="md:hidden px-6 pb-4 space-y-4 text-white/90 text-sm">
          <a href="#" className="block hover:text-white transition">About Us</a>
          <a href="#" className="block hover:text-white transition">Contact</a>
          <button className="block w-full text-left hover:text-white transition">
            Log In
          </button>
          <button className="w-full bg-secondary text-white text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition">
            Join Now
          </button>
        </div>
      )}
    </header>
  );
}
