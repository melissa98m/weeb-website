import {
  FaYoutube,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();
  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Pricing", href: "#" },
        { label: "Overview", href: "#" },
        { label: "Browse", href: "#" },
        { label: "Accessibility", href: "#" },
        { label: "Five", href: "#" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { label: "Brainstorming", href: "#" },
        { label: "Ideation", href: "#" },
        { label: "Wireframing", href: "#" },
        { label: "Research", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Help Center", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Tutorials", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Press", href: "#" },
        { label: "Events", href: "#" },
        { label: "Careers", href: "#" },
      ],
    },
  ];
  return (
    <footer className="bg-white text-dark text-sm px-12 py-12 w-full">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 lg:flex-row lg:justify-between text-left">
        {/* Colonne 1 : Logo */}
        <div>
          <h2 className="text-xl font-bold">weeb</h2>
        </div>
        {footerLinks.map(({ title, links }) => (
          <div key={title}>
            <h3 className="font-semibold text-muted uppercase mb-2">{title}</h3>
            <ul className="space-y-1">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Ligne du bas */}
      <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row justify-between text-left gap-4">
        <p className="text-muted">
          &copy; 2025 Weeb, Inc. All rights reserved.
        </p>
        <div className="flex gap-4 text-xl text-dark-icon">
          <FaYoutube className="hover:text-primary cursor-pointer" />
          <FaFacebookF className="hover:text-primary cursor-pointer" />
          <FaTwitter className="hover:text-primary cursor-pointer" />
          <FaInstagram className="hover:text-primary cursor-pointer" />
          <FaLinkedinIn className="hover:text-primary cursor-pointer" />
        </div>
      </div>
    </footer>
  );
}
