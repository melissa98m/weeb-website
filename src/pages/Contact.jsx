import { useEffect } from "react";
import ContactIntro from "../components/Contact/ContactIntro";
import ContactFAQ from "../components/Contact/ContactFAQ";
import ContactForm from "../components/Contact/ContactForm";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { setCanonical, setOgMeta, setHreflang, setTwitterMeta, SITE_URL, DEFAULT_OG_IMAGE } from "../lib/seo";

export default function Contact() {
  const { theme } = useTheme();
  const { language } = useLanguage();

  useEffect(() => {
    const prev = document.title;
    const isFr = language === "fr";
    const title = isFr
      ? "Contact | Weeb — Écrivez-nous"
      : "Contact | Weeb — Get in Touch";
    const desc = isFr
      ? "Contactez l'équipe Weeb pour toute question sur nos formations, articles ou partenariats. Nous répondons sous 48h."
      : "Contact the Weeb team for any question about our courses, articles or partnerships. We reply within 48h.";

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute("content", "index, follow");

    const cleanCanonical = setCanonical("/contact");
    const cleanHreflang = setHreflang("/contact");
    const cleanOgUrl = setOgMeta("og:url", `${SITE_URL}/contact`);
    const cleanOgTitle = setOgMeta("og:title", title);
    const cleanOgDesc = setOgMeta("og:description", desc);
    const cleanOgImg = setOgMeta("og:image", DEFAULT_OG_IMAGE);
    const cleanTwTitle = setTwitterMeta("twitter:title", title);
    const cleanTwDesc = setTwitterMeta("twitter:description", desc);
    const cleanTwImg = setTwitterMeta("twitter:image", DEFAULT_OG_IMAGE);

    return () => {
      document.title = prev;
      cleanCanonical();
      cleanHreflang();
      cleanOgUrl();
      cleanOgTitle();
      cleanOgDesc();
      cleanOgImg();
      cleanTwTitle();
      cleanTwDesc();
      cleanTwImg();
    };
  }, [language]);

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "dark" ? "bg-background text-white" : "bg-light text-dark"
      }`}
    >
      <ContactIntro />
      <ContactFAQ />
      <div id="contact-form">
        <ContactForm />
      </div>
    </div>
  );
}
