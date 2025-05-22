import {
  FaYoutube,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import footerEn from "../../locales/en/footer.json";
import footerFr from "../../locales/fr/footer.json";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const footerLinks = [
    {
      title: {
        en: footerEn.product,
        fr: footerFr.product,
      },
      links: [
        {
          label: {
            en: footerEn.pricing,
            fr: footerFr.pricing,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.overview,
            fr: footerFr.overview,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.browse,
            fr: footerFr.browse,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.accessibility,
            fr: footerFr.accessibility,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.five,
            fr: footerFr.five,
          },
          href: "#",
        },
      ],
    },
    {
      title: {
        en: footerEn.solutions,
        fr: footerFr.solutions,
      },
      links: [
        {
          label: {
            en: footerEn.brainstorming,
            fr: footerFr.brainstorming,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.ideation,
            fr: footerFr.ideation,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.wireframing,
            fr: footerFr.wireframing,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.research,
            fr: footerFr.research,
          },
          href: "#",
        },
      ],
    },
    {
      title: {
        en: footerEn.ressources,
        fr: footerFr.ressources,
      },
      links: [
        {
          label: {
            en: footerEn.help_center,
            fr: footerFr.help_center,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.blog,
            fr: footerFr.blog,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.tutorials,
            fr: footerFr.tutorials,
          },
          href: "#",
        },
      ],
    },
    {
      title: {
        en: footerEn.company,
        fr: footerFr.company,
      },
      links: [
        {
          label: {
            en: footerEn.about,
            fr: footerFr.about,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.press,
            fr: footerFr.press,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.events,
            fr: footerFr.events,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.careers,
            fr: footerFr.careers,
          },
          href: "#",
        },
      ],
    },
  ];

  return (
    <footer
      className={`text-sm px-12 py-12 w-full ${
        theme === "dark" ? "bg-white text-dark" : "bg-dark text-white"
      }`}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-8 lg:flex-row lg:justify-between text-left">
        {/* Colonne 1 : Logo */}
        <div>
          <h2 className="text-xl font-bold">weeb</h2>
        </div>
        {footerLinks.map(({ title, links }) => (
          <div key={language === "fr" ? title.fr : title.en}>
            <h3 className="font-semibold text-muted uppercase mb-2">
              {language === "fr" ? title.fr : title.en}
            </h3>
            <ul className="space-y-1">
              {links.map(({ label, href }) => (
                <li key={language === "fr" ? label.fr : label.en}>
                  <a href={href}>{language === "fr" ? label.fr : label.en}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Ligne du bas */}
      <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row justify-between text-left gap-4 max-w-5xl mx-auto">
        <p>
          &copy; {language === "fr" ? footerFr.copyright : footerEn.copyright}
        </p>
        {/* Reseaux sociaux */}
        <div className="flex gap-4 text-xl text-dark-icon">
          <FaYoutube
            className={`hover:text-primary cursor-pointer ${
              theme === "dark" ? "hover:text-primary" : "hover:text-secondary"
            }`}
          />
          <FaFacebookF
            className={`hover:text-primary cursor-pointer ${
              theme === "dark" ? "hover:text-primary" : "hover:text-secondary"
            }`}
          />
          <FaTwitter
            className={`hover:text-primary cursor-pointer ${
              theme === "dark" ? "hover:text-primary" : "hover:text-secondary"
            }`}
          />
          <FaInstagram
            className={`hover:text-primary cursor-pointer ${
              theme === "dark" ? "hover:text-primary" : "hover:text-secondary"
            }`}
          />
          <FaLinkedinIn
            className={`hover:text-primary cursor-pointer ${
              theme === "dark" ? "hover:text-primary" : "hover:text-secondary"
            }`}
          />
        </div>
      </div>
    </footer>
  );
}
